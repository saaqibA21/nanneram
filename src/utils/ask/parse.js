/**
 * Turns a free-form question into structured pieces: places, dates, date
 * ranges, clock times, time windows, duration and the activity being planned.
 */

import { findPlaces, ZONE_ABBREVIATIONS } from './places.js';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_RE = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

export const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDateStr = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Lowercase, expand common shorthand and fix frequent misspellings. */
export function normalize(text) {
  return ` ${text.toLowerCase()} `
    .replace(/[’`]/g, "'")
    .replace(/[?!,;]+/g, ' ')
    .replace(/\btmrw\b|\btmr\b|\btmrow\b|\btomorow\b|\btommorow\b|\btommorrow\b|\btomorrrow\b|\btmw\b/g, 'tomorrow')
    .replace(/\btdy\b|\btoday's\b/g, 'today')
    .replace(/\btonite\b/g, 'tonight')
    .replace(/\bu\b/g, 'you')
    .replace(/\br\b/g, 'are')
    .replace(/\bpls\b|\bplz\b/g, 'please')
    .replace(/\brn\b/g, 'right now')
    .replace(/\bwhts\b|\bwats\b|\bwhat's\b/g, 'what is')
    .replace(/\bwhen's\b/g, 'when is')
    .replace(/\bmins?\b/g, 'minutes')
    .replace(/\bhrs?\b/g, 'hours')
    .replace(/\s+/g, ' ');
}

/* ------------------------------------------------------------------ */
/* Dates                                                              */
/* ------------------------------------------------------------------ */

/**
 * A single date or a range mentioned in the text.
 * Returns { date } or { range: { start, days, label } } or null.
 */
export function findDate(text, todayStr) {
  const t = text;
  const today = parseDateStr(todayStr);

  const iso = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/.exec(t);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    if (d.getDate() === +iso[3]) return { date: toDateStr(d), label: null };
  }

  // dd/mm or dd/mm/yyyy (Indian order); mm/dd only if the first number can't be a day-of-month first
  const slashRaw = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b(?!\s*(?:am|pm|a\.m|p\.m|minutes|hours))/.exec(t)
    || /\b(\d{1,2})[.-](\d{1,2})[.-](\d{2,4})\b/.exec(t);
  const slash = slashRaw && !/24\/7/.test(slashRaw[0]) ? slashRaw : null;
  if (slash) {
    let day = +slash[1];
    let month = +slash[2];
    if (month > 12 && day <= 12) [day, month] = [month, day];
    let year = slash[3] ? +slash[3] : today.getFullYear();
    if (year < 100) year += 2000;
    const d = new Date(year, month - 1, day);
    if (month >= 1 && month <= 12 && d.getDate() === day) {
      if (!slash[3] && d < addDays(today, -1)) d.setFullYear(year + 1);
      return { date: toDateStr(d), label: null };
    }
  }

  if (/\bday after tomorrow\b/.test(t)) return { date: toDateStr(addDays(today, 2)), label: 'day after tomorrow' };
  if (/\bday before yesterday\b/.test(t)) return { date: toDateStr(addDays(today, -2)), label: 'day before yesterday' };
  if (/\btomorrow\b|\bnaalai\b|\bnaale\b/.test(t)) return { date: toDateStr(addDays(today, 1)), label: 'tomorrow' };
  if (/\byesterday\b|\bnetru\b/.test(t)) return { date: toDateStr(addDays(today, -1)), label: 'yesterday' };

  const inDays = /\bin (\d{1,3}|a|one|two|three|four|five|six|seven|ten) (days?|weeks?)\b/.exec(t);
  if (inDays) {
    const words = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, ten: 10 };
    const n = words[inDays[1]] ?? +inDays[1];
    const days = /week/.test(inDays[2]) ? n * 7 : n;
    return { date: toDateStr(addDays(today, days)), label: null };
  }

  // Ranges
  if (/\bnext week\b/.test(t)) {
    const start = addDays(today, ((8 - today.getDay()) % 7) || 7);
    return { range: { start: toDateStr(start), days: 7, label: 'next week' } };
  }
  if (/\b(this|coming) weekend\b|\bweekend\b/.test(t)) {
    const sat = addDays(today, (6 - today.getDay() + 7) % 7);
    const start = today.getDay() === 0 ? today : sat;
    return { range: { start: toDateStr(start), days: today.getDay() === 0 ? 1 : 2, label: 'this weekend' } };
  }
  if (/\b(this|the) week\b|\bthis week's\b|\bnext (few|couple of) days\b|\bcoming days\b|\bnext 7 days\b/.test(t)) {
    return { range: { start: todayStr, days: 7, label: 'the next 7 days' } };
  }
  if (/\b(next|coming) (two|2) weeks\b|\bnext 14 days\b|\bfortnight\b/.test(t)) {
    return { range: { start: todayStr, days: 14, label: 'the next 14 days' } };
  }
  const nextN = /\b(?:next|coming|for (?:the )?next|for)\s+(\d{1,2}|two|three|four|five|six|ten)\s+days\b/.exec(t);
  if (nextN) {
    const words = { two: 2, three: 3, four: 4, five: 5, six: 6, ten: 10 };
    const n = Math.min(words[nextN[1]] ?? +nextN[1], 31);
    return { range: { start: todayStr, days: n, label: `the next ${n} days` } };
  }
  if (/\b(for )?(a|one|1) week\b|\bweekly\b/.test(t)) {
    return { range: { start: todayStr, days: 7, label: 'the next 7 days' } };
  }
  const inMonth = new RegExp(`\\b(?:in|during|for|this|next|whole|all of|throughout)\\s+${MONTH_RE}\\b(?!\\s+\\d)`).exec(t) || new RegExp(`^\\s*${MONTH_RE}\\s*$`).exec(t);
  if (inMonth) {
    const month = MONTHS.indexOf(inMonth[1].slice(0, 3));
    let year = today.getFullYear();
    if (month < today.getMonth()) year += 1;
    const first = month === today.getMonth() && year === today.getFullYear() ? today : new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days = Math.round((last - first) / 86400000) + 1;
    return { range: { start: toDateStr(first), days, label: `in ${last.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}` } };
  }
  if (/\b(this|next|coming) month\b/.test(t)) {
    const next = /\bnext month\b/.test(t);
    const start = next ? new Date(today.getFullYear(), today.getMonth() + 1, 1) : today;
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const days = Math.round((end - start) / 86400000) + 1;
    return { range: { start: toDateStr(start), days, label: next ? 'next month' : 'the rest of this month' } };
  }

  // "between 20 and 25 oct", "20-25 oct"
  const between = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:-|to|and|till|until)\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH_RE}`).exec(t);
  if (between) {
    const month = MONTHS.indexOf(between[3].slice(0, 3));
    let start = new Date(today.getFullYear(), month, +between[1]);
    if (start < addDays(today, -1)) start = new Date(today.getFullYear() + 1, month, +between[1]);
    const days = Math.min(Math.max(+between[2] - +between[1] + 1, 1), 31);
    return { range: { start: toDateStr(start), days, label: null } };
  }

  // "20 oct", "20th of october", "oct 20", "october 20th"
  const dm = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH_RE}(?:\\s+(\\d{4}))?`).exec(t);
  const md = new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s*(\\d{4}))?`).exec(t);
  const hit = dm ? { day: +dm[1], month: MONTHS.indexOf(dm[2].slice(0, 3)), year: dm[3] } : md ? { day: +md[2], month: MONTHS.indexOf(md[1].slice(0, 3)), year: md[3] } : null;
  if (hit) {
    let d = new Date(hit.year ? +hit.year : today.getFullYear(), hit.month, hit.day);
    if (!hit.year && d < addDays(today, -1)) d = new Date(today.getFullYear() + 1, hit.month, hit.day);
    if (d.getDate() === hit.day) return { date: toDateStr(d), label: null };
  }

  // "on the 25th"
  const nth = /\b(?:on )?the (\d{1,2})(?:st|nd|rd|th)\b/.exec(t);
  if (nth) {
    let d = new Date(today.getFullYear(), today.getMonth(), +nth[1]);
    if (d < today) d = new Date(today.getFullYear(), today.getMonth() + 1, +nth[1]);
    if (d.getDate() === +nth[1]) return { date: toDateStr(d), label: null };
  }

  // weekdays, including "next friday" and "this sat"
  for (let i = 0; i < 7; i++) {
    const re = new RegExp(`\\b(next |this |coming |on )?(${DAY_NAMES[i]}|${DAY_SHORT[i]})\\b`);
    const m = re.exec(t);
    if (!m) continue;
    let diff = (i - today.getDay() + 7) % 7;
    if (m[1] === 'next ' && diff === 0) diff = 7;
    if (m[1] === 'next ' && diff <= 2 && /\bnext week\b/.test(t)) diff += 7;
    return { date: toDateStr(addDays(today, diff)), label: null };
  }

  if (/\btoday\b|\btonight\b|\bright now\b|\bnow\b|\bthis (morning|afternoon|evening)\b|\binru\b|\baaj\b/.test(t)) {
    return { date: todayStr, label: 'today' };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Times                                                              */
/* ------------------------------------------------------------------ */

const PERIODS = [
  ['early morning', 4 * 60, 8 * 60],
  ['morning', 6 * 60, 12 * 60],
  ['before noon', 6 * 60, 12 * 60],
  ['noon', 11 * 60 + 30, 13 * 60],
  ['lunch', 12 * 60, 14 * 60],
  ['afternoon', 12 * 60, 16 * 60 + 30],
  ['after lunch', 13 * 60, 17 * 60],
  ['evening', 16 * 60, 20 * 60],
  ['after work', 17 * 60, 21 * 60],
  ['tonight', 18 * 60, 23 * 60],
  ['night', 19 * 60, 23 * 60 + 30],
  ['office hours', 9 * 60, 18 * 60],
  ['work hours', 9 * 60, 18 * 60],
  ['business hours', 9 * 60, 18 * 60]
];

function clockToMinutes(h, m, ampm) {
  let hours = +h;
  const mins = m ? +m : 0;
  if (hours > 24 || mins > 59) return null;
  if (ampm) {
    const pm = ampm.startsWith('p');
    if (hours === 12) hours = pm ? 12 : 0;
    else if (pm) hours += 12;
  }
  return hours * 60 + mins;
}

const CLOCK = '(\\d{1,2})(?:[:.](\\d{2}))?\\s*(am|pm|a\\.m\\.?|p\\.m\\.?)';

/**
 * Times in the text: { at } a single clock time, { from, to } a window, or null.
 * Bare hours ("at 3") are read as daytime (3 PM) unless clearly morning.
 */
export function findTime(text) {
  const t = text;

  const rangeAmPm = new RegExp(`\\b(?:between|from)?\\s*(\\d{1,2})(?:[:.](\\d{2}))?\\s*(am|pm)?\\s*(?:-|to|and|till|until)\\s*${CLOCK}`).exec(t);
  if (rangeAmPm && (rangeAmPm[3] || /between|from/.test(rangeAmPm[0]) || /-/.test(rangeAmPm[0]))) {
    const endAmPm = rangeAmPm[6];
    let from = clockToMinutes(rangeAmPm[1], rangeAmPm[2], rangeAmPm[3] || endAmPm);
    const to = clockToMinutes(rangeAmPm[4], rangeAmPm[5], endAmPm);
    if (from !== null && to !== null) {
      if (!rangeAmPm[3] && from > to) from -= 12 * 60;
      if (to > from) return { from, to, label: `${rangeAmPm[0].trim()}` };
    }
  }

  const after = new RegExp(`\\bafter ${CLOCK}`).exec(t) || /\bafter (\d{1,2})(?:[:.](\d{2}))?\b(?! minutes| hours| days)/.exec(t);
  const before = new RegExp(`\\bbefore ${CLOCK}`).exec(t) || /\bbefore (\d{1,2})(?:[:.](\d{2}))?\b(?! minutes| hours| days)/.exec(t);
  if (after || before) {
    const read = (m) => {
      if (!m) return null;
      const v = clockToMinutes(m[1], m[2], m[3]);
      return v !== null && !m[3] && +m[1] < 8 ? v + 12 * 60 : v;
    };
    const from = read(after) ?? 6 * 60;
    const to = read(before) ?? 22 * 60;
    if (to > from) return { from, to, label: (after ? `after ${after[0].replace('after ', '')}` : '') + (before ? ` before ${before[0].replace('before ', '')}` : '') };
  }

  const ampm = new RegExp(`\\b${CLOCK}`).exec(t);
  if (ampm) {
    const at = clockToMinutes(ampm[1], ampm[2], ampm[3]);
    if (at !== null) return { at };
  }
  const h24 = /\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/.exec(t);
  if (h24 && !/\d[:.]\d{2}[:.]/.test(t)) return { at: +h24[1] * 60 + +h24[2] };
  if (/\bnoon\b|\bmidday\b/.test(t) && !/\bafternoon\b|\bbefore noon\b|\bafter noon\b/.test(t)) return { at: 12 * 60 };
  if (/\bmidnight\b/.test(t)) return { at: 0 };
  const bare = /\b(?:at|around|by|about)\s+(\d{1,2})(?:[:.](\d{2}))?\b(?!\s*(?:minutes|hours|days|people|th|st|nd|rd))/.exec(t);
  if (bare && +bare[1] <= 12) {
    let at = +bare[1] * 60 + (bare[2] ? +bare[2] : 0);
    const morning = /\bmorning\b/.test(t);
    if (!morning && +bare[1] < 8) at += 12 * 60;
    if (!morning && +bare[1] === 12) at = 12 * 60 + (bare[2] ? +bare[2] : 0);
    return { at };
  }

  for (const [label, from, to] of PERIODS) {
    if (new RegExp(`\\b${label}\\b`).test(t)) return { from, to, label };
  }
  return null;
}

export function findDuration(text) {
  const t = text;
  const hm = /\b(\d+(?:\.\d+)?)\s*(hours?|h)\b(?:\s*(?:and\s*)?(\d{1,2})\s*minutes)?/.exec(t);
  if (hm) return Math.round(parseFloat(hm[1]) * 60 + (hm[3] ? +hm[3] : 0));
  if (/\b(an|one|1) hour\b/.test(t)) return 60;
  if (/\bhalf (an )?hour\b/.test(t)) return 30;
  if (/\bquarter (of an )?hour\b/.test(t)) return 15;
  const m = /\b(\d{1,3})\s*-?\s*minutes?\b/.exec(t);
  if (m && !/\bin \d{1,3} minutes\b/.test(t)) return +m[1];
  return null;
}

/* ------------------------------------------------------------------ */
/* Activities                                                         */
/* ------------------------------------------------------------------ */

/**
 * What the user wants to do. `horas` are preferred planetary hours (best first),
 * `avoid` are Horas to steer away from, `window` is the default search window,
 * and `strict` adds the classical tithi/yoga/karana checks for big events.
 */
export const ACTIVITIES = [
  { id: 'vendor', label: 'meeting with a vendor', re: /\b(wedding|event|party) (vendor|planner|photographer|caterer|decorator|organi[sz]er|hall|venue|designer)s?\b|\b(vendor|caterer|photographer|planner|decorator) (meeting|call)\b/, horas: ['Mercury', 'Venus', 'Jupiter'], avoid: ['Mars', 'Saturn'], window: 'business', kind: 'meeting', purpose: 'vendor meeting' },
  { id: 'wedding', label: 'wedding or marriage', re: /\b(wedding|marriage|marry|kalyanam|thirumanam|vivah|muhurtham for marriage|tie the knot)\b/, horas: ['Jupiter', 'Venus', 'Moon'], avoid: ['Saturn', 'Mars'], window: 'day', strict: true, kind: 'ritual' },
  { id: 'engagement', label: 'engagement', re: /\b(engagement|nichayathartham|nischayam|roka|ring ceremony|betrothal)\b/, horas: ['Venus', 'Jupiter', 'Moon'], avoid: ['Saturn', 'Mars'], window: 'day', strict: true, kind: 'ritual' },
  { id: 'housewarming', label: 'housewarming (griha pravesam)', re: /\b(house ?warming|griha ?prave(sh|s)(am)?|graha ?pravesam|gruha ?pravesam|new house entry|moving in|move in|move into|moving into|shift(ing)? (in)?to (my |the |a )?new|shifting house|shift house|move house|new home)\b/, horas: ['Jupiter', 'Moon', 'Venus'], avoid: ['Saturn', 'Mars'], window: 'day', strict: true, kind: 'ritual' },
  { id: 'bhoomi', label: 'bhoomi puja or foundation stone', re: /\b(bhoomi ?(puja|pooja)|bhumi ?(puja|pooja)|foundation stone|groundbreaking|start construction|vastu puja)\b/, horas: ['Jupiter', 'Mars', 'Sun'], avoid: ['Saturn'], window: 'day', strict: true, kind: 'ritual' },
  { id: 'puja', label: 'puja or prayer', re: /\b(puja|pooja|prayer|pray|homam|havan|temple|vratham|fasting|abhishekam|archana|ganapathi|ganesh)\b/, horas: ['Jupiter', 'Sun', 'Moon'], avoid: [], window: 'day', strict: false, kind: 'ritual' },
  { id: 'naming', label: 'naming ceremony', re: /\b(naming ceremony|namakaran|namakaranam|name the baby|baby name|cradle ceremony|annaprashan|ear piercing|first haircut|mundan)\b/, horas: ['Jupiter', 'Moon', 'Venus'], avoid: ['Saturn', 'Mars'], window: 'day', strict: true, kind: 'ritual' },
  { id: 'business_start', label: 'starting a business or opening a shop', re: /\b(start(ing)? (a |my |the |new )?(business|company|startup|venture|shop|store|office|clinic|restaurant)|open(ing)? (a |my |the |new )?(shop|store|office|business|clinic|restaurant|branch)|shop opening|inauguration|inaugurate|launch(ing)? (a |my |the )?(business|company|startup|shop|store)|register (a |my )?company|incorporat\w*)\b/, horas: ['Mercury', 'Jupiter', 'Sun'], avoid: ['Saturn', 'Mars'], window: 'day', strict: true, kind: 'business' },
  { id: 'launch', label: 'product launch or announcement', re: /\b(product launch|launch|go live|release|announce|announcement|press release|publish|upload (a |my )?video|post (on|to) (instagram|linkedin|youtube|social))\b/, horas: ['Sun', 'Mercury', 'Jupiter'], avoid: ['Saturn'], window: 'business', strict: false, kind: 'business' },
  { id: 'pitch', label: 'investor pitch', re: /\b(pitch|investor|vc|fundrais\w*|funding|term sheet|valuation|angel|seed round|series [a-d])\b/, horas: ['Jupiter', 'Sun', 'Mercury'], avoid: ['Mars', 'Saturn'], window: 'business', kind: 'meeting', purpose: 'VC pitch investor' },
  { id: 'salary', label: 'salary or raise conversation', re: /\b(salary|raise|hike|appraisal|promotion|compensation|increment|bonus|negotiat)/, horas: ['Mercury', 'Jupiter'], avoid: ['Mars', 'Saturn'], window: 'business', kind: 'meeting', purpose: 'salary negotiation raise' },
  { id: 'contract', label: 'signing a contract or deal', re: /\b(sign(ing)? (the |a |an |my |our )?(contract|agreement|deal|papers|documents|mou|nda|lease|offer)|signing|contract|agreement|deal|mou|nda|lease|closing|close the deal|proposal|quotation|tender|bid)\b/, horas: ['Mercury', 'Jupiter'], avoid: ['Mars', 'Saturn'], window: 'business', strict: true, kind: 'meeting', purpose: 'contract sign deal' },
  { id: 'interview', label: 'job interview', re: /\b(interview|job application|apply for (a |the )?job|hiring|recruit|placement)\b/, horas: ['Jupiter', 'Sun', 'Mercury'], avoid: ['Mars', 'Saturn'], window: 'business', kind: 'meeting', purpose: 'job interview hiring' },
  { id: 'join_job', label: 'joining a new job', re: /\b(start(ing)? (a |my |the )?new job|new job|join(ing)? (a |the |my )?(new )?(job|company|office|work)|first day (at|of) (work|job)|joining date|onboarding)\b/, horas: ['Jupiter', 'Sun', 'Mercury'], avoid: ['Saturn', 'Mars'], window: 'business', strict: true, kind: 'business' },
  { id: 'resign', label: 'resigning', re: /\b(resign|quit (my|the) job|notice period|leave (my|the) job|put in (my )?papers)\b/, horas: ['Sun', 'Mars', 'Mercury'], avoid: ['Moon'], window: 'business', kind: 'meeting' },
  { id: 'difficult', label: 'difficult conversation', re: /\b(fire (someone|an employee|him|her)|terminat\w*|layoff|lay off|confront|dispute|argument|complaint|breakup|break up|apologi[sz]e|apology|sorry|settle|court|lawyer|legal notice)\b/, horas: ['Mars', 'Sun', 'Mercury'], avoid: ['Venus'], window: 'business', kind: 'meeting', purpose: 'dispute termination' },
  { id: 'romance', label: 'romantic plans', re: /\b(crush|(a |first |go on a |dinner )date|date (with|night)|propose|proposal to|confess|love|girlfriend|boyfriend|ask (her|him) out|valentine|first move|rizz|dm (her|him)|text (her|him))\b/, horas: ['Venus', 'Moon', 'Mercury'], avoid: ['Saturn', 'Mars'], window: 'waking', kind: 'personal' },
  { id: 'family', label: 'family conversation', re: /\b(parents|mom|mum|dad|amma|appa|mother|father|in-laws|family|relatives|ask (my )?(mom|dad|parents))\b/, horas: ['Moon', 'Jupiter', 'Sun'], avoid: ['Mars', 'Saturn'], window: 'waking', kind: 'personal' },
  { id: 'message', label: 'sending an important message or email', re: /\b(email|e-mail|mail|text|message|whatsapp|send|reply|call back|cold call|reach out|follow up)\b/, horas: ['Mercury', 'Venus', 'Moon'], avoid: ['Saturn', 'Mars'], window: 'waking', kind: 'personal' },
  { id: 'meeting', label: 'meeting', re: /\b(meeting|meet|call|zoom|google meet|presentation|present|demo|review|client|standup|sync|discussion|webinar|seminar|conference)\b/, horas: ['Mercury', 'Jupiter', 'Sun'], avoid: ['Mars', 'Saturn'], window: 'business', kind: 'meeting', purpose: 'important meeting' },
  { id: 'design', label: 'creative or design work', re: /\b(design|creative|brand|ux|art|photo ?shoot|music|record|film|shoot|write a song|painting)\b/, horas: ['Venus', 'Mercury', 'Moon'], avoid: ['Saturn'], window: 'business', kind: 'meeting', purpose: 'creative design review' },
  { id: 'travel', label: 'travel or journey', re: /\b(travel|trip|journey|flight|fly|drive|road trip|leave (for|home)|depart|set out|vacation|holiday|pilgrimage|yatra|tour)\b/, horas: ['Moon', 'Mercury', 'Venus'], avoid: ['Saturn', 'Mars'], window: 'waking', kind: 'travel' },
  { id: 'gold', label: 'buying gold or jewellery', re: /\b(gold|jewel|jewellery|jewelry|silver|diamond|thali|mangalsutra|necklace|ornament)\b/, horas: ['Jupiter', 'Venus', 'Moon'], avoid: ['Saturn', 'Mars'], window: 'day', strict: true, kind: 'purchase' },
  { id: 'vehicle', label: 'buying a vehicle', re: /\b(car|bike|scooter|vehicle|two ?wheeler|motorcycle|ev\b|tesla|truck)\b/, horas: ['Venus', 'Mercury', 'Jupiter'], avoid: ['Saturn', 'Mars'], window: 'day', strict: true, kind: 'purchase' },
  { id: 'property', label: 'property or land deal', re: /\b(house|flat|apartment|property|land|plot|villa|real estate|registration|bhoomi puja|bhoomi pooja|foundation stone|construction|build a house)\b/, horas: ['Jupiter', 'Mars', 'Venus'], avoid: ['Saturn'], window: 'day', strict: true, kind: 'purchase' },
  { id: 'purchase', label: 'a purchase', re: /\b(buy|buying|purchase|shopping|order|book (a|the|my)|phone|laptop|gadget|clothes|dress|saree|furniture|appliance)\b/, horas: ['Venus', 'Mercury', 'Jupiter'], avoid: ['Saturn'], window: 'waking', kind: 'purchase' },
  { id: 'invest', label: 'investing', re: /\b(invest|investment|stock|shares|mutual fund|sip\b|crypto|bitcoin|trading|fd\b|fixed deposit|insurance|policy)\b/, horas: ['Jupiter', 'Mercury', 'Venus'], avoid: ['Saturn', 'Mars'], window: 'business', strict: true, kind: 'finance' },
  { id: 'loan', label: 'loans or money matters', re: /\b(loan|lend|borrow|debt|emi|pay back|repay|credit card|bank|money)\b/, horas: ['Jupiter', 'Mercury'], avoid: ['Mars'], window: 'business', kind: 'finance' },
  { id: 'medical', label: 'medical appointment or treatment', re: /\b(surgery|operation|doctor|hospital|treatment|medicine|dentist|checkup|check-up|therapy|vaccine|delivery|c-section|procedure)\b/, horas: ['Sun', 'Jupiter', 'Mars'], avoid: ['Saturn'], window: 'business', kind: 'health' },
  { id: 'exam', label: 'exam or study', re: /\b(exam|test|study|studies|revision|homework|assignment|class|course|admission|school|college|learn|vidyarambham|aksharabhyasam)\b/, horas: ['Mercury', 'Jupiter', 'Sun'], avoid: ['Saturn', 'Mars'], window: 'waking', kind: 'personal' },
  { id: 'fitness', label: 'starting a fitness routine', re: /\b(gym|workout|exercise|diet|yoga class|jogging|go for a run|fitness|sports|match|game day)\b/, horas: ['Mars', 'Sun'], avoid: ['Moon'], window: 'waking', kind: 'personal' },
  { id: 'haircut', label: 'haircut or grooming', re: /\b(haircut|hair cut|cut (my |his |her )?hair|hair ?trim|shave|salon|nails|beard)\b/, horas: ['Venus', 'Moon'], avoid: ['Saturn'], window: 'waking', kind: 'personal' },
  { id: 'party', label: 'party or celebration', re: /\b(party|celebration|birthday|anniversary|get-together|dinner|lunch with)\b/, horas: ['Venus', 'Moon', 'Jupiter'], avoid: ['Saturn'], window: 'waking', kind: 'personal' }
];

export function findActivity(text) {
  for (const a of ACTIVITIES) if (a.re.test(text)) return a;
  return null;
}

/** All structured pieces of a question. */
export function parseQuestion(raw, todayStr) {
  const text = normalize(raw);
  const zones = Object.keys(ZONE_ABBREVIATIONS).filter((z) => new RegExp(`\\b${z}\\b`).test(text));
  return {
    raw,
    text,
    places: findPlaces(text),
    date: findDate(text, todayStr),
    time: findTime(text),
    duration: findDuration(text),
    activity: findActivity(text),
    zones
  };
}
