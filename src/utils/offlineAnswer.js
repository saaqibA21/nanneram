/**
 * Offline answerer: understands common questions without a server, using the
 * same timing tools as the AI assistant. Used when /api/ask is not configured
 * or unreachable, so the Ask page always gives a real answer.
 */

import { CITIES, getZonedNow } from './vedicTiming.js';
import {
  getDayTimings, findMeetingSlots, getRightNow, getMeetingAdvice, compareDays, REFERENCE, DAY_NAMES, toDateStr, parseDate
} from './askTools.js';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const has = (text, ...words) => words.some((w) => (w instanceof RegExp ? w.test(text) : text.includes(w)));

function findCity(text, fallback) {
  const lower = text.toLowerCase();
  const aliases = { bangalore: 'Bengaluru', delhi: 'New Delhi', sf: 'San Francisco', nyc: 'New York', madras: 'Chennai', bombay: 'Mumbai', calcutta: 'Kolkata' };
  for (const [alias, name] of Object.entries(aliases)) {
    if (new RegExp(`\\b${alias}\\b`).test(lower)) return CITIES.find((c) => c.name === name);
  }
  return CITIES.find((c) => lower.includes(c.name.toLowerCase())) || fallback;
}

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Resolve a date mentioned in the text, relative to today in the city. */
export function findDate(text, todayStr) {
  const lower = text.toLowerCase();
  const today = parseDate(todayStr);
  const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(lower);
  if (iso && parseDate(iso[0])) return { date: iso[0], explicit: true };

  if (has(lower, 'day after tomorrow')) return { date: toDateStr(addDays(today, 2)), explicit: true };
  if (has(lower, 'tomorrow', 'tmrw', 'tmr')) return { date: toDateStr(addDays(today, 1)), explicit: true };
  if (has(lower, 'yesterday')) return { date: toDateStr(addDays(today, -1)), explicit: true };
  if (has(lower, /\b(today|tonight|now)\b/)) return { date: todayStr, explicit: true };

  // "20 oct", "oct 20", "20th october"
  const dm = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/.exec(lower);
  const md = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/.exec(lower);
  const hit = dm ? { day: +dm[1], month: MONTHS.indexOf(dm[2]) } : md ? { day: +md[2], month: MONTHS.indexOf(md[1]) } : null;
  if (hit) {
    let d = new Date(today.getFullYear(), hit.month, hit.day);
    if (d < addDays(today, -1)) d = new Date(today.getFullYear() + 1, hit.month, hit.day);
    if (d.getDate() === hit.day) return { date: toDateStr(d), explicit: true };
  }

  // "friday", "next friday", "this friday"
  const wd = DAY_NAMES.findIndex((n) => new RegExp(`\\b${n.toLowerCase()}\\b`).test(lower));
  if (wd >= 0) {
    let diff = (wd - today.getDay() + 7) % 7;
    if (has(lower, `next ${DAY_NAMES[wd].toLowerCase()}`) && diff === 0) diff = 7;
    return { date: toDateStr(addDays(today, diff)), explicit: true };
  }
  return { date: todayStr, explicit: false };
}

function findDuration(text) {
  const m = /(\d{2,3})\s*(?:min|mins|minutes|m\b)/.exec(text) || /(\d)\s*(?:hour|hr)/.exec(text);
  if (!m) return 30;
  const mins = /hour|hr/.test(m[0]) ? Number(m[1]) * 60 : Number(m[1]);
  return [15, 30, 45, 60, 90, 120].reduce((best, v) => (Math.abs(v - mins) < Math.abs(best - mins) ? v : best), 30);
}

const prettyDate = (dateStr) => parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

const TERM_MATCHERS = [
  ['Rahu Kaalam', /rahu|raahu|ragu/],
  ['Yamagandam', /yama/],
  ['Gulika Kaalam', /gulika|kuligai|gulikai/],
  ['Nalla Neram', /nalla|nala neram|good time|auspicious|shubh|muhurt/],
  ['Gowri Panchangam', /gowri|gauri|gouri/],
  ['Hora', /hora/]
];

function definition(term) {
  return `**${term}**: ${REFERENCE.terms[term]}`;
}

/**
 * Answer a question offline. Returns { answer, slots } in the same shape as /api/ask.
 */
export function answerOffline(question, ctx) {
  const text = question.toLowerCase().trim();
  const city = findCity(text, ctx.city);
  const today = getZonedNow(city.timeZone).dateStr;
  const { date, explicit } = findDate(text, today);
  const useDate = explicit ? date : (ctx.selectedDate || today);
  const where = `${city.name}, ${prettyDate(useDate)}`;
  const asksWhatIs = /^(what|whats|what's|explain|meaning|define|tell me about)\b/.test(text) && !has(text, 'time', 'when', 'today', 'tomorrow');

  // Product questions
  if (has(text, 'zoom', 'google meet', 'meet link', 'meet room', 'video link', 'pmi')) {
    return { answer: `${REFERENCE.product.video}\n\nUse the **Set up** button in the top bar, or on the Schedule page under "Where will you meet?".`, slots: null };
  }
  if (has(text, 'calendar', '.ics', 'outlook', 'invite', 'reminder', 'remind')) {
    return { answer: REFERENCE.product.calendar, slots: null };
  }
  if (has(text, /\b(price|pricing|cost|costs|plans?|subscription|pay|paid|is it free|pro plan|team plan)\b/)) {
    return { answer: REFERENCE.product.pricing, slots: null };
  }
  if (has(text, 'which cities', 'what cities', 'cities supported', 'my city', 'other city', 'support city', 'location')) {
    return { answer: `The pickers cover: ${REFERENCE.product.cities.join(', ')}.\n\nWith the AI assistant switched on you can also ask about any other city by name.`, slots: null };
  }
  if (has(text, 'gen-z', 'genz', 'gen z', /\bmodes?\b/)) {
    return { answer: REFERENCE.product.modes, slots: null };
  }
  if (has(text, 'accurate', 'accuracy', 'how do you calculate', 'how is it calculated', 'how are', 'how does it work', 'how it works', 'method', 'noaa')) {
    return { answer: REFERENCE.method, slots: null };
  }
  if (has(text, 'guarantee', 'really work', 'scientific', 'does it work', 'is it true', 'proof')) {
    return { answer: REFERENCE.product.limits, slots: null };
  }

  // Definitions
  const term = TERM_MATCHERS.find(([, re]) => re.test(text));
  if (asksWhatIs) {
    const hora = Object.keys(REFERENCE.horas).find((p) => text.includes(p.toLowerCase()));
    if (hora) {
      const h = REFERENCE.horas[hora];
      return { answer: `**${hora} Hora**: ${h.meaning}\n- Good for: ${h.goodFor.join(', ')}\n- Avoid: ${h.avoidFor.join(', ')}`, slots: null };
    }
    const gowri = Object.keys(REFERENCE.gowri).find((g) => text.includes(g.toLowerCase()));
    if (gowri) return { answer: `**${gowri}**: ${REFERENCE.gowri[gowri]}`, slots: null };
    if (term) return { answer: definition(term[0]), slots: null };
  }

  // Right now
  if (has(text, /\b(now|current|currently|at the moment|this moment|ruling now)\b/) && !has(text, 'best time', 'schedule', 'tomorrow')) {
    const r = getRightNow({ city: city.name });
    return {
      answer: `In **${r.city}** it is **${r.localTime}**.\n- ${r.verdict}\n- Hora: ${r.hora}\n- Gowri: ${r.gowri}\n- Rahu Kaalam today: **${r.rahuKaalamToday}**`,
      slots: null
    };
  }

  // What to wear / say / face
  if (has(text, 'wear', 'colour', 'color', 'dress', 'outfit', 'direction', 'face ', 'facing', 'what should i say', 'opening line', 'how do i start')) {
    const a = getMeetingAdvice({ city: city.name, date: useDate, description: question });
    return {
      answer: `For ${where}:\n- Wear: ${a.wear}\n- Avoid: ${a.avoidWearing}\n- Face: ${a.faceDirection}\n- Best window: **${a.bestWindow}**\n- Opening line: ${a.openingLine}`,
      slots: null
    };
  }

  // Which day is best
  if (has(text, 'which day', 'what day', 'this week', 'next week', 'best day')) {
    const start = has(text, 'next week') ? toDateStr(addDays(parseDate(today), 7 - parseDate(today).getDay() + 1)) : today;
    const r = compareDays({ city: city.name, startDate: start, days: 7, purpose: question, durationMinutes: findDuration(text) });
    const ranked = [...r.days].sort((a, b) => b.bestScore - a.bestScore).slice(0, 3);
    return {
      answer: `Best days in **${r.city}** for this, starting ${prettyDate(start)}:\n${ranked.map((d) => `- **${d.weekday} ${d.date}**: ${d.bestSlot}`).join('\n')}\n\nOpen the Schedule page on one of those dates for all options.`,
      slots: null
    };
  }

  // Best time / scheduling
  if (has(text, 'best time', 'good time to', 'when should', 'when can', 'when to', 'schedule', 'slot', 'book', 'meeting', 'call', 'interview', 'pitch', 'negotiat', 'sign', 'propose', 'ask for', 'text ', 'message')) {
    const r = findMeetingSlots({ city: city.name, date: useDate, purpose: question, durationMinutes: findDuration(text) });
    if (!r.slots.length) {
      return { answer: `No good ${r.durationMinutes}-minute slot between 9 AM and 7 PM in ${where}. Try another day or a shorter meeting.`, slots: null };
    }
    return {
      answer: `Best time in ${where} (${r.durationMinutes} min): **${r.slots[0].start} – ${r.slots[0].end}** (${r.slots[0].hora} Hora, ${r.slots[0].gowri}). All options are below.

Skipped Rahu Kaalam (${r.skipped.rahuKaalam}) and Yamagandam (${r.skipped.yamagandam}).`,
      slots: r
    };
  }

  // Specific windows for a day
  const t = getDayTimings({ city: city.name, date: useDate });
  if (term && term[0] === 'Rahu Kaalam') return { answer: `Rahu Kaalam in ${where}: **${t.rahuKaalam}**. Avoid starting important things then.`, slots: null };
  if (term && term[0] === 'Yamagandam') return { answer: `Yamagandam in ${where}: **${t.yamagandam}**.`, slots: null };
  if (term && term[0] === 'Gulika Kaalam') return { answer: `Gulika Kaalam in ${where}: **${t.gulikaKaalam}**.`, slots: null };
  if (term && term[0] === 'Nalla Neram') {
    return { answer: `Nalla Neram in ${where}:\n${t.nallaNeramDay.map((w) => `- **${w}**`).join('\n')}\n\nNight:\n${t.nallaNeramNight.map((w) => `- ${w}`).join('\n')}`, slots: null };
  }
  if (term && term[0] === 'Gowri Panchangam') return { answer: `Gowri in ${where} (day):\n${t.gowriDay.map((g) => `- ${g}`).join('\n')}`, slots: null };
  if (term && term[0] === 'Hora') return { answer: `Horas in ${where} (day):\n${t.horasDay.map((h) => `- ${h}`).join('\n')}`, slots: null };
  if (has(text, 'sunrise', 'sun rise', 'dawn')) return { answer: `Sunrise in ${where}: **${t.sunrise}**.`, slots: null };
  if (has(text, 'sunset', 'sun set', 'dusk')) return { answer: `Sunset in ${where}: **${t.sunset}**.`, slots: null };

  // Default: a summary of the day plus what you can ask
  return {
    answer:
      `Here is ${where}:\n- Sunrise **${t.sunrise}**, sunset **${t.sunset}**\n- Rahu Kaalam **${t.rahuKaalam}** (avoid)\n- Yamagandam **${t.yamagandam}**\n- Best Nalla Neram: **${t.nallaNeramDay[0] || 'none'}**\n\n` +
      `I can also find the best time for a meeting, compare days, explain any term, or suggest what to wear. Try "best time for a job interview tomorrow in Mumbai".`,
    slots: null
  };
}
