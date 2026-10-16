import { answerOffline } from './offlineAnswer.js';

// Once the server says it has no API key, stop asking it for this session.
let serverAvailable = true;

/**
 * Ask a question. Uses the AI assistant at /api/ask when it is configured, and
 * the offline answerer otherwise, so the user always gets an answer.
 * `history` is [{ role: 'user'|'assistant', content: string }], ending with the question.
 */
export async function askQuestion(history, ctx) {
  const question = history[history.length - 1].content;
  const offline = (note) => ({ ...answerOffline(question, ctx.offline), source: 'offline', note });

  if (!serverAvailable) return offline();

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, context: ctx.server })
    });
    if (res.status === 503 || res.status === 404 || res.status === 405) {
      serverAvailable = false;
      return offline();
    }
    if (res.status === 429) return offline('The AI assistant is busy, so this is a quick offline answer.');
    if (!res.ok) return offline('The AI assistant had a problem, so this is a quick offline answer.');
    const data = await res.json();
    if (!data || typeof data.answer !== 'string') return offline();
    return { answer: data.answer, slots: data.slots || null, source: 'ai' };
  } catch {
    return offline('Could not reach the AI assistant, so this is a quick offline answer.');
  }
}
