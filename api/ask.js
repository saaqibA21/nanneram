/**
 * POST /api/ask — answers any question about timings, meetings or the product.
 *
 * Claude does the understanding and writing; every number comes from the site's
 * own timing engine, exposed to Claude as tools (src/utils/askTools.js).
 * Requires the ANTHROPIC_API_KEY environment variable on Vercel. Without it the
 * endpoint returns 503 and the browser falls back to its offline answerer.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS, runTool } from '../src/utils/askTools.js';

const MODEL = 'claude-opus-5-5';
const MAX_TOOL_ROUNDS = 6;
const MAX_HISTORY = 16;
const MAX_CHARS = 2000;

const SYSTEM_PROMPT = `You are the assistant inside Nanneram, a website that finds good times for meetings and important starts using traditional Tamil/Vedic timekeeping (Rahu Kaalam, Yamagandam, Gulika Kaalam, Horas, Gowri Panchangam / Nalla Neram), calculated from real sunrise and sunset for the user's city.

Answer whatever the user asks. Most questions are about timings, scheduling meetings, what to wear or say, what the terms mean, or how the product works; answer those fully. If a question is unrelated, still give a short, helpful answer, and mention what you can help with only if it is natural.

Rules:
- Never state a sunrise, sunset, Rahu Kaalam, Hora, Gowri, Nalla Neram or meeting time from memory. Call a tool and use its numbers exactly.
- Resolve relative dates ("tomorrow", "next Friday", "this week") from the current date given below, in the relevant city, and pass dates to tools as YYYY-MM-DD.
- If the user names no place, use the selected city below. For a place outside the preset list, pass its latitude, longitude and IANA time zone to the tool.
- Always say which city and date the times are for. Times are local to that city.
- For "when should I" or "best time" questions, call find_meeting_slots (or compare_days for a range of days) and give the top options with a one-line reason each.
- For product questions (Zoom/Meet links, calendar export, pricing, cities, how timings are worked out), call get_reference rather than guessing.
- Be honest about limits: these are traditional planning aids, not predictions or guarantees, and not financial, legal or medical advice. Say so briefly when someone treats a timing as a guarantee; do not add it to every answer.
- Keep answers short and scannable: a direct answer first, then a few bullet points if useful. Use **bold** for times. No headings, no tables.`;

const GENZ_NOTE = 'The user has the site in Gen-Z mode: keep the same facts, but write casually and briefly, like a friend texting.';

// Created on first use so a missing key surfaces as a 503, not a module crash.
let client;
const getClient = () => (client ??= new Anthropic());

// Best-effort per-instance rate limit so a public endpoint can't be drained in a loop.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 30;
}

function cleanHistory(messages) {
  if (!Array.isArray(messages)) return null;
  const cleaned = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (cleaned.length && cleaned[0].role !== 'user') cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== 'user') return null;
  return cleaned;
}

function contextBlock(ctx = {}) {
  const lines = [
    `Current date in the selected city: ${ctx.today || 'unknown'} (${ctx.weekday || ''})`,
    `Current local time there: ${ctx.localTime || 'unknown'}`,
    `Selected city: ${ctx.city || 'Chennai'}`,
    `Date selected on the page: ${ctx.selectedDate || ctx.today || 'today'}`,
    `Preferred video platform: ${ctx.platform || 'Google Meet'}`
  ];
  return `Context for this conversation:\n${lines.join('\n')}`;
}

/**
 * Runs the question through Claude with the timing tools. `anthropic` is
 * injectable so the loop can be tested without network access.
 */
export async function runAsk({ messages, context = {}, anthropic = getClient() }) {
  const convo = [...messages];
  const system = [SYSTEM_PROMPT, context.mode === 'genz' ? GENZ_NOTE : '', contextBlock(context)].filter(Boolean).join('\n\n');
  let slotsResult = null;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system,
      tools: TOOL_DEFINITIONS,
      messages: convo
    });

    if (response.stop_reason === 'refusal') {
      return { answer: "I can't help with that one. Ask me about timings, meetings or how Nanneram works.", slots: null };
    }

    const toolUses = response.content.filter((b) => b.type === 'tool_use');
    if (response.stop_reason !== 'tool_use' || !toolUses.length || round === MAX_TOOL_ROUNDS) {
      const answer = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
      return { answer: answer || 'Sorry, I could not put an answer together. Please try rephrasing.', slots: slotsResult };
    }

    // Keep the full assistant content (thinking + tool calls) so the next turn is append-only.
    convo.push({ role: 'assistant', content: response.content });
    const results = toolUses.map((tu) => {
      const output = runTool(tu.name, tu.input);
      if (tu.name === 'find_meeting_slots' && !output.error && output.slots?.length) slotsResult = output;
      return {
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(output),
        ...(output.error ? { is_error: true } : {})
      };
    });
    convo.push({ role: 'user', content: results });
  }
  return { answer: 'Sorry, that took too many steps. Please ask a narrower question.', slots: slotsResult };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'not_configured' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const messages = cleanHistory(body?.messages);
  if (!messages) return res.status(400).json({ error: 'bad_request' });

  try {
    const result = await runAsk({ messages, context: body.context || {} });
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'rate_limited' });
    if (err instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'not_configured' });
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic API error', err.status, err.message);
      return res.status(502).json({ error: 'upstream_error' });
    }
    console.error('ask handler failed', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
