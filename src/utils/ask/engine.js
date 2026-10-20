/**
 * Nanneram's built-in question answerer. Understands a free-form question,
 * calculates the answer with the site's own astronomy and panchang code, and
 * writes a reply tailored to the city, date, time and activity asked about.
 * Runs entirely in the browser: no server, no API key.
 */

import {
  calculateVedicDay, formatTime, formatDuration, formatUtcOffset, getZonedNow, getUtcOffsetHours,
  zonedMinutesToUtcDate, HORA_METADATA
} from '../vedicTiming.js';
import { generateOracleConsultation } from '../oracleConsultant.js';
import { parseQuestion, parseDateStr, toDateStr, normalize, findDate, ACTIVITIES } from './parse.js';
import { PLACES, ZONE_ABBREVIATIONS } from './places.js';
import { quickAt, INAUSPICIOUS_YOGAS, RIKTA_TITHIS, NAKSHATRA_NAMES, RASI_NAMES } from './lunar.js';
import { dayPanchang, choghadiya, nextObservances, OBSERVANCES, chandrashtamam, rasiOfNakshatra } from './panchang.js';
import { GLOSSARY, FAQ, JOKES } from './knowledge.js';

const fmt = formatTime;
const span = (w) => `${fmt(w.start)} – ${fmt(w.end)}`;
const bold = (s) => `**${s}**`;

const VAARA_SOOLAM = ['West', 'East', 'North', 'North', 'South', 'West', 'East']; // Sun..Sat
const GENERIC_ACTIVITY = { id: 'generic', label: 'it', horas: ['Jupiter', 'Mercury', 'Venus'], avoid: ['Saturn', 'Mars'], window: 'waking', kind: 'personal' };

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const shortDate = (dateStr) => parseDateStr(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const longDate = (dateStr) => parseDateStr(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

function dayWord(dateStr, todayStr) {
  const diff = Math.round((parseDateStr(dateStr) - parseDateStr(todayStr)) / 86400000);
  if (diff === 0) return `today (${shortDate(dateStr)})`;
  if (diff === 1) return `tomorrow (${shortDate(dateStr)})`;
  if (diff === -1) return `yesterday (${shortDate(dateStr)})`;
  return longDate(dateStr);
}

const remaining = (mins) => {
  const total = Math.max(1, Math.round(mins));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
};

const within = (t, w) => t >= w.start && t < w.end;
const overlaps = (a0, a1, w) => Math.max(a0, w.start) < Math.min(a1, w.end);

function msAt(city, dateStr, minutes) {
  return zonedMinutesToUtcDate(dateStr, city.timeZone, minutes).getTime();
}

function windowFor(activity, day, time) {
  if (time && time.from !== undefined) {
    let { from, to } = time;
    if (to <= from) to += 1440;
    return { from, to, label: time.label };
  }
  if (activity.window === 'business') return { from: 9 * 60, to: 19 * 60, label: '9 AM – 7 PM' };
  if (activity.window === 'day') return { from: Math.ceil(day.sunriseMin), to: Math.floor(day.sunsetMin), label: 'sunrise to sunset' };
  return { from: Math.max(Math.ceil(day.sunriseMin), 6 * 60), to: 22 * 60, label: 'between sunrise and 10 PM' };
}

/* ------------------------------------------------------------------ */
/* Core calculations                                                  */
/* ------------------------------------------------------------------ */

/** Score one candidate start time. Returns null if it must be skipped. */
function scoreSlot(ctx, start, duration, activity) {
  const { day, chog, city, dateStr } = ctx;
  const end = start + duration;
  if (overlaps(start, end, day.rahuKaalam)) return null;
  if (overlaps(start, end, day.yamagandam)) return null;
  const hora = day.allHoras.find((h) => within(start, h));
  const gowri = day.allGowriSlots.find((g) => within(start, g));
  if (!hora || !gowri || gowri.quality !== 'Auspicious') return null;
  const cg = chog.find((c) => within(start, c));

  let score = 50;
  const reasons = [];
  const prefIdx = activity.horas.indexOf(hora.planet);
  if (prefIdx === 0) { score += 40; reasons.push(`${hora.planet} Hora, the best planet for ${activity.label}`); }
  else if (prefIdx > 0) { score += 25; reasons.push(`${hora.planet} Hora suits ${activity.label}`); }
  if (activity.avoid.includes(hora.planet)) { score -= 40; reasons.push(`${hora.planet} Hora is not ideal`); }
  const gowriBonus = { Amirtham: 30, Labham: 25, Danam: 20, Sugam: 18, Uthi: 18 }[gowri.state] || 0;
  score += gowriBonus;
  reasons.push(`${gowri.name} Gowri (${gowri.rank.toLowerCase()})`);
  if (cg) {
    if (cg.tone === 'good') { score += 10; reasons.push(`${cg.name} choghadiya`); }
    else if (cg.tone === 'bad') score -= 10;
    else if (activity.id === 'travel') { score += 10; reasons.push('Char choghadiya, good for travel'); }
  }
  const spill = day.allGowriSlots.some((g) => g.quality !== 'Auspicious' && overlaps(start, end, g));
  if (spill) score -= 15;
  if (hora.end - end < 5) score -= 8;
  if (overlaps(start, end, day.gulikaKaalam) && ['difficult', 'loan', 'medical'].includes(activity.id)) score -= 15;
  if (ctx.abhijit && overlaps(start, end, ctx.abhijit) && day.dayOfWeek !== 3) { score += 8; reasons.push('inside Abhijit Muhurtham'); }

  if (activity.strict) {
    const q = quickAt(msAt(city, dateStr, start));
    if (RIKTA_TITHIS.has(q.tithi)) score -= 12;
    if (INAUSPICIOUS_YOGAS.has(q.yoga)) score -= 10;
    if (q.karana.startsWith('Vishti')) { score -= 15; }
    if (q.tithi === 30) score -= 20;
  }
  return { start, end, hora, gowri, chog: cg, score, reasons };
}

/** Best slots for an activity on a date. */
function findSlots(city, dateStr, activity, { time, duration, nowMinutes } = {}) {
  const day = calculateVedicDay(parseDateStr(dateStr), city);
  const dp = dayPanchang(city, dateStr);
  const ctx = { day, chog: dp.choghadiya, city, dateStr, abhijit: dp.abhijit };
  const win = windowFor(activity, day, time);
  const len = duration || (activity.kind === 'ritual' ? 60 : activity.kind === 'meeting' ? 30 : 30);
  const from = Math.max(win.from, nowMinutes !== undefined ? Math.ceil((nowMinutes + 5) / 15) * 15 : -Infinity);
  const candidates = [];
  for (let t = Math.ceil(from / 15) * 15; t + len <= Math.min(win.to, day.nextSunriseMin); t += 15) {
    const s = scoreSlot(ctx, t, len, activity);
    if (s) candidates.push(s);
  }
  candidates.sort((a, b) => b.score - a.score || a.start - b.start);
  const strong = candidates.some((x) => x.score >= 60);
  const picked = [];
  for (const c of candidates) {
    if (strong && c.score < 50) continue;
    if (picked.every((p) => Math.abs(p.start - c.start) >= 45)) picked.push(c);
    if (picked.length === 3) break;
  }
  return { day, dp, win, len, slots: picked, cutByNow: nowMinutes !== undefined && nowMinutes > win.from };
}

/** Classical day-level checks for big events. */
function dayFactors(dp, activity) {
  const p = dp.panchang;
  const good = [];
  const bad = [];
  if (p.tithi.number <= 15 && p.tithi.number !== 15) good.push('waxing moon (Shukla Paksha)');
  if (p.tithi.number === 30) bad.push('Amavasai (new moon)');
  if (RIKTA_TITHIS.has(p.tithi.number)) bad.push(`${p.tithi.name} is a Rikta tithi`);
  if (INAUSPICIOUS_YOGAS.has(p.yoga.name)) bad.push(`${p.yoga.name} yoga at sunrise`);
  else good.push(`${p.yoga.name} yoga`);
  if (['ritual', 'purchase', 'business'].includes(activity.kind) && dp.day.dayOfWeek === 2) bad.push('Tuesday is traditionally avoided for this');
  if (['ritual', 'purchase'].includes(activity.kind) && dp.day.dayOfWeek === 6) bad.push('Saturday is traditionally avoided for this');
  return { good, bad };
}

function slotLine(s, i) {
  const tag = i === 0 ? ' (best)' : '';
  return `- ${bold(`${fmt(s.start)} – ${fmt(s.end)}`)}${tag}: ${s.reasons.slice(0, 2).join(', ')}`;
}

function slotsPayload(city, dateStr, activity, len, slots, purpose) {
  return {
    city: city.name,
    date: dateStr,
    weekday: parseDateStr(dateStr).toLocaleDateString('en-GB', { weekday: 'long' }),
    durationMinutes: len,
    purpose,
    presetCity: Boolean(city.preset ?? true),
    slots: slots.map((s, i) => ({
      rank: i + 1,
      start: fmt(s.start),
      end: fmt(s.end),
      startMin: s.start,
      hora: s.hora.planet,
      gowri: s.gowri.name
    }))
  };
}

/* ------------------------------------------------------------------ */
/* Intent handlers                                                    */
/* ------------------------------------------------------------------ */

function bestTime(c) {
  const { city, dateStr, todayStr, activity, q, nowMinutes } = c;
  const isToday = dateStr === todayStr;
  const purpose = activity.id === 'generic' ? c.purposeText : activity.label;
  const result = findSlots(city, dateStr, activity, { time: q.time, duration: q.duration, nowMinutes: isToday ? nowMinutes : undefined });
  const lines = [];
  const when = dayWord(dateStr, todayStr);

  if (activity.strict && !q.time) {
    const f = dayFactors(result.dp, activity);
    if (f.bad.length) lines.push(`Heads-up for ${when}: ${f.bad.join('; ')}. Many families would pick another day for ${activity.label}; if this date is fixed, use the best window below.`);
  }

  if (!result.slots.length) {
    const tomorrow = toDateStr(new Date(parseDateStr(dateStr).getTime() + 86400000));
    const next = findSlots(city, tomorrow, activity, { time: q.time, duration: q.duration });
    lines.unshift(`No clean ${result.len}-minute window is left ${isToday ? 'today' : `on ${when}`} in ${city.name} (${result.win.label}) once Rahu Kaalam (${span(result.day.rahuKaalam)}), Yamagandam and unfavourable Gowri parts are removed.`);
    if (next.slots.length) {
      lines.push(`The next good options are ${dayWord(tomorrow, todayStr)}:`);
      next.slots.forEach((s, i) => lines.push(slotLine(s, i)));
      return { text: lines.join('\n'), slots: slotsPayload(city, tomorrow, activity, next.len, next.slots, purpose), date: tomorrow };
    }
    return { text: lines.join('\n') };
  }

  lines.unshift(`Best time${result.slots.length > 1 ? 's' : ''} for ${purpose} in ${bold(city.name)} ${when}${result.cutByNow ? ' (from now on)' : ''}, ${result.len} min:`);
  result.slots.forEach((s, i) => lines.push(slotLine(s, i)));
  lines.push(`Avoid Rahu Kaalam ${bold(span(result.day.rahuKaalam))} and Yamagandam ${span(result.day.yamagandam)}.`);
  lines.push(...activityNotes(activity, result.day, city));
  return { text: lines.filter(Boolean).join('\n'), slots: slotsPayload(city, dateStr, activity, result.len, result.slots, purpose) };
}

function activityNotes(activity, day, city) {
  const notes = [];
  if (activity.id === 'travel') notes.push(`Vaara Soolam: on ${day.dayName}s, avoid starting a journey towards the ${VAARA_SOOLAM[day.dayOfWeek]}.`);
  if (activity.id === 'haircut' && [2, 6].includes(day.dayOfWeek)) notes.push(`Many Tamil families avoid haircuts on ${day.dayName}s; Monday, Wednesday or Thursday are the usual picks.`);
  if (activity.id === 'medical') notes.push('Follow your doctor\'s schedule first; use these windows only when you have a choice.');
  if (activity.id === 'invest') notes.push('This is traditional timing, not financial advice.');
  if (activity.id === 'wedding' || activity.id === 'engagement') notes.push('For the wedding muhurtham itself, families also match the couple\'s birth stars; confirm the final time with your astrologer.');
  if (activity.kind === 'meeting' && city) notes.push('Tap "Add one to my calendar" to put a slot straight into Google Calendar or Outlook.');
  return notes;
}

function checkTime(c) {
  const { city, dateStr, todayStr, activity, q } = c;
  const day = calculateVedicDay(parseDateStr(dateStr), city);
  const dp = dayPanchang(city, dateStr);
  const len = q.duration || 30;
  let start = q.time.at;
  if (start < day.sunriseMin && start < 4 * 60) start += 1440; // after midnight belongs to the same Vedic night
  const end = start + len;
  const hora = day.allHoras.find((h) => within(start, h));
  const gowri = day.allGowriSlots.find((g) => within(start, g));
  const cg = dp.choghadiya.find((ch) => within(start, ch));
  const good = [];
  const bad = [];
  if (overlaps(start, end, day.rahuKaalam)) bad.push(`it falls in Rahu Kaalam (${span(day.rahuKaalam)})`);
  if (overlaps(start, end, day.yamagandam)) bad.push(`it touches Yamagandam (${span(day.yamagandam)})`);
  if (overlaps(start, end, day.gulikaKaalam)) (['difficult', 'loan', 'medical'].includes(activity.id) ? bad : good).push(`it is in Gulika Kaalam (${span(day.gulikaKaalam)})${['difficult', 'loan', 'medical'].includes(activity.id) ? ', which repeats things' : ', fine for routine things'}`);
  if (gowri) (gowri.quality === 'Auspicious' ? good : bad).push(`${gowri.name} Gowri (${gowri.rank.toLowerCase()}) runs ${span(gowri)}`);
  if (hora) {
    if (activity.horas.includes(hora.planet)) good.push(`${hora.planet} Hora suits ${activity.label}`);
    else if (activity.avoid.includes(hora.planet)) bad.push(`${hora.planet} Hora is not ideal for ${activity.label}`);
    else good.push(`${hora.planet} Hora (${HORA_METADATA[hora.planet].badge.toLowerCase()})`);
  }
  if (cg) (cg.tone === 'bad' ? bad : good).push(`${cg.name} choghadiya (${cg.text})`);
  if (start >= day.sunsetMin && activity.kind === 'meeting') good.push('note it is after sunset, in the night Horas');

  const fatal = bad.some((b) => b.includes('Rahu') || b.includes('Yamagandam'));
  const verdict = fatal ? 'Better to avoid' : bad.length === 0 ? 'Yes, that is a good time' : bad.length === 1 ? 'It is okay, with one caution' : 'Not ideal';
  const lines = [`${bold(verdict)}: ${fmt(start)}${len ? `–${fmt(end)}` : ''} ${dayWord(dateStr, todayStr)} in ${city.name}${activity.id !== 'generic' ? ` for ${activity.label}` : ''}.`];
  good.forEach((g) => lines.push(`- ✓ ${g}`));
  bad.forEach((b) => lines.push(`- ✗ ${b}`));

  let slots = null;
  if (bad.length) {
    const alt = findSlots(city, dateStr, activity, { duration: len, time: { from: Math.max(start - 180, day.sunriseMin), to: Math.min(start + 240, day.nextSunriseMin) } });
    if (alt.slots.length) {
      lines.push(`Closest better options that day: ${alt.slots.map((s) => bold(`${fmt(s.start)}–${fmt(s.end)}`)).join(', ')}.`);
      slots = slotsPayload(city, dateStr, activity, len, alt.slots, activity.id === 'generic' ? c.purposeText : activity.label);
    }
  }
  return { text: lines.join('\n'), slots };
}

function rightNow(c) {
  const { city } = c;
  const z = getZonedNow(city.timeZone, c.nowMs);
  const vedicDate = liveVedicDate(city, c.nowMs);
  const at = z.minutesFromMidnight + (vedicDate !== z.dateStr ? 1440 : 0);
  const r = checkTime({ ...c, dateStr: vedicDate, todayStr: vedicDate, q: { ...c.q, time: { at }, duration: c.q.duration || 30 } });
  const forWhat = c.activity.id !== 'generic' ? `, for ${c.activity.label}` : '';
  return r.text.replace(/^\*\*(.+?)\*\*: [^\n]*/, (m, v) => `${bold(v)} right now (${fmt(z.minutesFromMidnight)} in ${city.name}${forWhat}).`);
}

/** The calendar date of the Vedic day running now (before sunrise it is still yesterday). */
function liveVedicDate(city, nowMs) {
  const z = getZonedNow(city.timeZone, nowMs);
  const day = calculateVedicDay(parseDateStr(z.dateStr), city);
  if (z.minutesFromMidnight < day.sunriseMin) return toDateStr(new Date(parseDateStr(z.dateStr).getTime() - 86400000));
  return z.dateStr;
}

function windowAnswer(c, term) {
  const { city, dateStr, todayStr, nowMinutes } = c;
  const day = calculateVedicDay(parseDateStr(dateStr), city);
  const dp = dayPanchang(city, dateStr);
  const when = dayWord(dateStr, todayStr);
  const isToday = dateStr === todayStr;
  const live = (w) => {
    if (!isToday) return '';
    if (within(nowMinutes, w)) return ` It is running now and ends in ${remaining(w.end - nowMinutes)}.`;
    if (nowMinutes < w.start) return ` It starts in ${remaining(w.start - nowMinutes)}.`;
    return ' It is already over for today.';
  };
  switch (term) {
    case 'rahu': return `Rahu Kaalam in ${bold(city.name)} ${when}: ${bold(span(day.rahuKaalam))}.${live(day.rahuKaalam)} Avoid starting anything important in it.`;
    case 'yama': return `Yamagandam in ${bold(city.name)} ${when}: ${bold(span(day.yamagandam))}.${live(day.yamagandam)}`;
    case 'gulika': return `Gulika (Kuligai) Kaalam in ${bold(city.name)} ${when}: ${bold(span(day.gulikaKaalam))}.${live(day.gulikaKaalam)}`;
    case 'nalla': {
      const best = day.gowriSlots.find((g) => g.state === 'Amirtham');
      return [
        `Nalla Neram in ${bold(city.name)} ${when} (favourable Gowri):`,
        ...day.nallaNeramDay.map((w) => `- ${bold(span(w))}: ${w.states.join(' + ')}`),
        `Night: ${day.nallaNeramNight.map((w) => `${span(w)} (${w.states.join(' + ')})`).join('; ')}`,
        best ? `The single best part is Amirtham, ${bold(span(best))}${overlaps(best.start, best.end, day.rahuKaalam) ? ' (but it overlaps Rahu Kaalam, so use the next one)' : ''}.` : ''
      ].filter(Boolean).join('\n');
    }
    case 'gowri': return [
      isToday ? (() => { const g = day.allGowriSlots.find((x) => within(nowMinutes < day.sunriseMin ? nowMinutes + 1440 : nowMinutes, x)); return g ? `Right now: ${bold(g.name)} (${g.quality === 'Auspicious' ? 'favourable' : 'avoid'}) until ${fmt(g.end)}.` : ''; })() : '',
      `Gowri Panchangam for ${bold(city.name)} ${when}:`,
      ...day.gowriSlots.map((g) => `- ${span(g)}: ${g.name} (${g.quality === 'Auspicious' ? 'good' : 'avoid'})`),
      'Night:',
      ...day.nightGowriSlots.map((g) => `- ${span(g)}: ${g.name} (${g.quality === 'Auspicious' ? 'good' : 'avoid'})`)
    ].filter(Boolean).join('\n');
    case 'hora': {
      const now = isToday ? day.allHoras.find((h) => within(nowMinutes, h)) : null;
      return [
        now ? `Right now it is ${bold(`${now.planet} Hora`)} until ${fmt(now.end)} (${HORA_METADATA[now.planet].badge.toLowerCase()}).` : '',
        `Horas in ${bold(city.name)} ${when}:`,
        ...day.horas.map((h) => `- ${span(h)}: ${h.planet}`),
        `Night Horas: ${day.nightHoras.map((h) => `${fmt(h.start)} ${h.planet}`).join(', ')}`
      ].filter(Boolean).join('\n');
    }
    case 'choghadiya': return [
      isToday ? (() => { const x = dp.choghadiya.find((ch) => within(nowMinutes < day.sunriseMin ? nowMinutes + 1440 : nowMinutes, ch)); return x ? `Right now: ${bold(`${x.name} choghadiya`)} (${x.text}) until ${fmt(x.end)}.` : ''; })() : '',
      `Choghadiya for ${bold(city.name)} ${when}:`,
      ...dp.choghadiya.filter((x) => !x.night).map((x) => `- ${span(x)}: ${x.name} (${x.text})`),
      'Night:',
      ...dp.choghadiya.filter((x) => x.night).map((x) => `- ${span(x)}: ${x.name} (${x.text})`)
    ].filter(Boolean).join('\n');
    case 'abhijit': return day.dayOfWeek === 3
      ? `Abhijit Muhurtham in ${bold(city.name)} ${when} would be ${span(dp.abhijit)}, but it is traditionally skipped on Wednesdays.`
      : `Abhijit Muhurtham in ${bold(city.name)} ${when}: ${bold(span(dp.abhijit))}.${live(dp.abhijit)}${overlaps(dp.abhijit.start, dp.abhijit.end, day.rahuKaalam) ? ' It overlaps Rahu Kaalam today, so many would skip it.' : ''}`;
    case 'brahma': return `Brahma Muhurtham in ${bold(city.name)} ${when}: ${bold(span(dp.brahma))}, ending 48 minutes before sunrise (${fmt(day.sunriseMin)}).`;
    case 'sunrise': return `Sunrise in ${bold(city.name)} ${when}: ${bold(fmt(day.sunriseMin))}. Sunset: ${fmt(day.sunsetMin)} (day length ${formatDuration(day.dinamana)}).`;
    case 'sunset': return `Sunset in ${bold(city.name)} ${when}: ${bold(fmt(day.sunsetMin))}. Next sunrise: ${fmt(day.nextSunriseMin)}.`;
    case 'durations': return `In ${city.name} ${when} the day lasts ${formatDuration(day.dinamana)} and the night ${formatDuration(day.ratrimana)}, so each Rahu Kaalam-style part is ${Math.round(day.partDuration)} minutes and each Hora about ${Math.round(day.dinamana / 12)} minutes.`;
    default: return daySummary(c);
  }
}

function panchangAnswer(c, element) {
  const { city, dateStr, todayStr } = c;
  const dp = dayPanchang(city, dateStr);
  const p = dp.panchang;
  const when = dayWord(dateStr, todayStr);
  const L = dp.label;
  const map = {
    tithi: `Tithi in ${city.name} ${when}: ${bold(p.tithi.name)} (${p.tithi.paksha}) at sunrise, until ${bold(L(p.tithi.endsAt))}, then ${p.nextTithi}.`,
    nakshatra: `Nakshatra in ${city.name} ${when}: ${bold(p.nakshatra.name)} at sunrise, until ${bold(L(p.nakshatra.endsAt))}, then ${p.nextNakshatra}.`,
    yoga: `Yoga ${when}: ${bold(p.yoga.name)} until ${L(p.yoga.endsAt)}${INAUSPICIOUS_YOGAS.has(p.yoga.name) ? ' (one of the yogas avoided for new beginnings)' : ''}.`,
    karana: `Karana at sunrise ${when}: ${bold(p.karana.name)} until ${L(p.karana.endsAt)}${p.karana.name.startsWith('Vishti') ? ' (Vishti is avoided for auspicious work)' : ''}.`,
    paksha: `${when[0].toUpperCase()}${when.slice(1)} is in ${bold(p.tithi.paksha)}, tithi ${p.tithi.name}.`,
    moonsign: `The Moon is in ${bold(p.moonSign.name)} ${when}${dateStr === todayStr ? '' : ' at sunrise'}, until ${L(p.moonSign.endsAt)}.`,
    sunsign: `The Sun is in sidereal ${bold(p.sunSign.name)}, which makes it the Tamil month of ${bold(p.tamilMonth)}.`,
    month: `It is the Tamil month of ${bold(p.tamilMonth)} (Sun in sidereal ${p.sunSign.name}).`
  };
  return map[element] || panchangSummary(c);
}

function panchangSummary(c) {
  const { city, dateStr, todayStr } = c;
  const dp = dayPanchang(city, dateStr);
  const p = dp.panchang;
  const d = dp.day;
  const L = dp.label;
  return [
    `Panchang for ${bold(city.name)}, ${dayWord(dateStr, todayStr)}:`,
    `- Tamil month: ${p.tamilMonth} · ${p.tithi.paksha}`,
    `- Tithi: ${bold(p.tithi.name)} until ${L(p.tithi.endsAt)}, then ${p.nextTithi}`,
    `- Nakshatra: ${bold(p.nakshatra.name)} until ${L(p.nakshatra.endsAt)}, then ${p.nextNakshatra}`,
    `- Yoga: ${p.yoga.name} until ${L(p.yoga.endsAt)} · Karana: ${p.karana.name} until ${L(p.karana.endsAt)}`,
    `- Moon sign: ${p.moonSign.name}`,
    `- Sunrise ${fmt(d.sunriseMin)} · Sunset ${fmt(d.sunsetMin)}`,
    `- Rahu Kaalam ${bold(span(d.rahuKaalam))} · Yamagandam ${span(d.yamagandam)} · Gulika ${span(d.gulikaKaalam)}`,
    `- Abhijit ${d.dayOfWeek === 3 ? '(skipped on Wednesday)' : span(dp.abhijit)} · Brahma Muhurtham ${span(dp.brahma)}`,
    `- Nalla Neram: ${d.nallaNeramDay.map((w) => span(w)).join(', ')}`
  ].join('\n');
}

function daySummary(c) {
  const { city, dateStr, todayStr } = c;
  const d = calculateVedicDay(parseDateStr(dateStr), city);
  const dp = dayPanchang(city, dateStr);
  return [
    `${bold(city.name)}, ${dayWord(dateStr, todayStr)}:`,
    `- Sunrise ${fmt(d.sunriseMin)}, sunset ${fmt(d.sunsetMin)}`,
    `- Rahu Kaalam ${bold(span(d.rahuKaalam))} (avoid) · Yamagandam ${span(d.yamagandam)} · Gulika ${span(d.gulikaKaalam)}`,
    `- Nalla Neram: ${d.nallaNeramDay.map((w) => bold(span(w))).join(', ')}`,
    `- Tithi ${dp.panchang.tithi.name}, nakshatra ${dp.panchang.nakshatra.name}`
  ].join('\n');
}

function compareDays(c, dates, label) {
  const { city, todayStr, activity, q } = c;
  const purpose = activity.id === 'generic' ? c.purposeText : activity.label;
  const rows = dates.map((dateStr) => {
    const r = findSlots(city, dateStr, activity, { time: q.time, duration: q.duration, nowMinutes: dateStr === todayStr ? c.nowMinutes : undefined });
    const f = dayFactors(r.dp, activity);
    const best = r.slots[0];
    let score = best ? best.score : -100;
    if (activity.strict) score += f.good.length * 3 - f.bad.length * 15;
    return { dateStr, r, f, best, score };
  });
  const ranked = [...rows].filter((x) => x.best).sort((a, b) => b.score - a.score);
  if (!ranked.length) return { text: `I could not find a clean window for ${purpose} in ${city.name} ${label || 'on those days'}. Try a wider range or a shorter duration.` };
  const lines = [`For ${purpose} in ${bold(city.name)}${label ? `, ${label}` : ''}, the strongest day${ranked.length > 1 ? 's are' : ' is'}:`];
  ranked.slice(0, 3).forEach((x, i) => {
    lines.push(`- ${bold(shortDate(x.dateStr))}${i === 0 ? ' (best)' : ''}: ${fmt(x.best.start)}–${fmt(x.best.end)}, ${x.best.reasons.slice(0, 2).join(', ')}${x.f.bad.length ? `; note ${x.f.bad[0]}` : ''}`);
  });
  if (rows.length > 3 && rows.length <= 7) {
    lines.push(`Rahu Kaalam on each day: ${rows.map((x) => `${shortDate(x.dateStr).split(' ')[0]} ${fmt(x.r.day.rahuKaalam.start)}`).join(', ')}.`);
  }
  const top = ranked[0];
  return { text: lines.join('\n'), slots: slotsPayload(city, top.dateStr, activity, top.r.len, top.r.slots, purpose), date: top.dateStr };
}

function rangeWindows(c, dates, term, label) {
  const { city } = c;
  const lines = [`${({ rahu: 'Rahu Kaalam', yama: 'Yamagandam', gulika: 'Gulika Kaalam', nalla: 'Best Nalla Neram', sunrise: 'Sunrise / sunset' })[term] || 'Key times'} in ${bold(city.name)}${label ? `, ${label}` : ''}:`];
  dates.forEach((dateStr) => {
    const d = calculateVedicDay(parseDateStr(dateStr), city);
    const val = term === 'yama' ? span(d.yamagandam)
      : term === 'gulika' ? span(d.gulikaKaalam)
        : term === 'nalla' ? d.nallaNeramDay.map(span).join(', ')
          : term === 'sunrise' ? `${fmt(d.sunriseMin)} / ${fmt(d.sunsetMin)}`
            : span(d.rahuKaalam);
    lines.push(`- ${shortDate(dateStr)}: ${bold(val)}`);
  });
  return lines.join('\n');
}

function adviceAnswer(c) {
  const { city, dateStr, todayStr, activity } = c;
  const day = calculateVedicDay(parseDateStr(dateStr), city);
  const prompt = c.q.raw.length > 12 ? c.q.raw : `${activity.label} ${c.q.raw}`;
  const r = generateOracleConsultation({ prompt, vedicData: day, selectedCity: city });
  const lines = [`For ${activity.id === 'generic' ? 'your plan' : activity.label} ${dayWord(dateStr, todayStr)} in ${city.name}:`];
  if (r.slot) lines.push(`- Time: ${bold(`${r.slot.startTimeFormatted} – ${r.slot.endTimeFormatted}`)} (${r.slot.hora.planet} Hora, ${r.slot.gowri.name})`);
  lines.push(`- Wear: ${r.attire.recommendedPalette}`);
  lines.push(`- Avoid wearing: ${r.attire.avoidColors}`);
  lines.push(`- Fabric and accessories: ${r.attire.fabrics} ${r.attire.metalAndWatch}`);
  lines.push(`- Face: ${bold(r.attire.direction)}. ${r.attire.directionMeaning}`);
  lines.push(`- Opening line: ${r.openingScript}`);
  lines.push(`- How to run it: ${r.tacticalAdvice}`);
  return lines.join('\n');
}

function observanceAnswer(c, key) {
  const { city, todayStr } = c;
  const obs = OBSERVANCES[key];
  const list = nextObservances(city, key, c.dateExplicit ? c.dateStr : todayStr, 3);
  if (!list.length) return `I could not find the next ${obs.label} in the coming year.`;
  const first = list[0];
  const days = Math.round((parseDateStr(first.date) - parseDateStr(todayStr)) / 86400000);
  return [
    `Next ${obs.label} for ${city.name}: ${bold(longDate(first.date))} (${first.paksha})${days === 0 ? ', that is today' : days === 1 ? ', that is tomorrow' : `, in ${days} days`}.`,
    list.length > 1 ? `After that: ${list.slice(1).map((o) => `${shortDate(o.date)} (${o.paksha.split(' ')[0]})`).join(', ')}.` : '',
    'Dates follow the tithi in force at the traditional moment (sunrise, or sunset for Pradosham), so a temple calendar can occasionally differ by a day.'
  ].filter(Boolean).join('\n');
}

function chandrashtamamAnswer(c) {
  const t = c.q.text;
  const rasiIdx = RASI_NAMES.findIndex((r) => r.toLowerCase().split(' ').some((w) => w.length > 3 && t.includes(w.replace(/[()]/g, ''))));
  const nakIdx = NAKSHATRA_NAMES.findIndex((n) => n.toLowerCase().replace(/[()]/g, '').split(' ').some((w) => w.length > 3 && new RegExp(`\\b${w}\\b`).test(t)));
  const birth = rasiIdx >= 0 ? rasiIdx : nakIdx >= 0 ? rasiOfNakshatra(nakIdx) : -1;
  if (birth < 0) return 'Chandrashtamam depends on your birth sign. Tell me your rasi (for example "chandrashtamam for Simha") or your birth star (for example "chandrashtamam for Rohini").';
  const periods = chandrashtamam(birth, c.nowMs, 3);
  const dp = dayPanchang(c.city, c.todayStr);
  return [
    `Chandrashtamam for ${bold(RASI_NAMES[birth])}${nakIdx >= 0 && rasiIdx < 0 ? ` (${NAKSHATRA_NAMES[nakIdx]})` : ''}, in ${c.city.name} time (Moon in ${periods[0]?.rasi}):`,
    ...periods.map((p) => `- ${bold(`${dp.label(p.start)} → ${dp.label(p.end)}`)}`),
    'Keep important starts and arguments out of these windows.'
  ].join('\n');
}

function convertAnswer(c) {
  const { q } = c;
  const zones = [];
  const text = q.text;
  // ordered mentions of places and zone abbreviations
  const mentions = [];
  q.places.forEach((p) => {
    const idx = [p.name, ...p.aliases].map((n) => text.indexOf(n.toLowerCase())).filter((i) => i >= 0).sort((x, y) => x - y)[0] ?? 0;
    mentions.push({ idx, label: p.name, timeZone: p.timeZone });
  });
  q.zones.forEach((z) => mentions.push({ idx: text.search(new RegExp(`\\b${z}\\b`)), label: ZONE_ABBREVIATIONS[z].label, timeZone: ZONE_ABBREVIATIONS[z].timeZone }));
  mentions.sort((a, b) => a.idx - b.idx).forEach((m) => { if (!zones.some((z) => z.timeZone === m.timeZone)) zones.push(m); });
  const todayStr = c.todayStr;

  if (!q.time || q.time.at === undefined) {
    if (zones.length >= 2) {
      const [a, b] = zones;
      const [y, mo, d] = todayStr.split('-').map(Number);
      const diff = getUtcOffsetHours(b.timeZone, y, mo, d) - getUtcOffsetHours(a.timeZone, y, mo, d);
      const now = (z) => fmt(getZonedNow(z.timeZone, c.nowMs).minutesFromMidnight);
      return `${b.label} is ${bold(diff === 0 ? 'on the same time as' : `${Math.abs(diff)} hour${Math.abs(diff) === 1 ? '' : 's'} ${diff > 0 ? 'ahead of' : 'behind'}`)} ${a.label} today. Right now it is ${now(a)} in ${a.label} and ${now(b)} in ${b.label}.`;
    }
    const z = zones[0] || { label: c.city.name, timeZone: c.city.timeZone };
    const zn = getZonedNow(z.timeZone, c.nowMs);
    const [y, mo, d] = zn.dateStr.split('-').map(Number);
    return `It is ${bold(fmt(zn.minutesFromMidnight))} on ${longDate(zn.dateStr)} in ${z.label} (${formatUtcOffset(getUtcOffsetHours(z.timeZone, y, mo, d))}).`;
  }

  const source = zones[0] || { label: c.defaultCity.name, timeZone: c.defaultCity.timeZone };
  const target = zones[1] || (source.timeZone === c.defaultCity.timeZone ? null : { label: c.defaultCity.name, timeZone: c.defaultCity.timeZone });
  if (!target) return `Tell me which two places to convert between, for example "10 AM IST in New York".`;
  const dateStr = c.dateExplicit ? c.dateStr : todayStr;
  const instant = zonedMinutesToUtcDate(dateStr, source.timeZone, q.time.at);
  const t = getZonedNow(target.timeZone, instant.getTime());
  const dayShift = t.dateStr === dateStr ? '' : ` (${shortDate(t.dateStr)})`;
  return `${bold(fmt(q.time.at))} in ${source.label} on ${shortDate(dateStr)} is ${bold(fmt(t.minutesFromMidnight) + dayShift)} in ${target.label}.`;
}

function currentClock(c) {
  const z = getZonedNow(c.city.timeZone, c.nowMs);
  const dp = dayPanchang(c.city, liveVedicDate(c.city, c.nowMs));
  return `It is ${bold(fmt(z.minutesFromMidnight))} on ${bold(longDate(z.dateStr))} in ${c.city.name}. Tamil month ${dp.panchang.tamilMonth}, tithi ${dp.panchang.tithi.name}, nakshatra ${dp.panchang.nakshatra.name}.`;
}

/* ------------------------------------------------------------------ */
/* Small talk and things outside scope                                */
/* ------------------------------------------------------------------ */

function safeMath(expr) {
  const clean = expr.replace(/×|x/g, '*').replace(/÷/g, '/').replace(/\^/g, '**').replace(/\s+/g, '');
  if (!/^[\d+\-*/().%]+$/.test(clean) || !/\d/.test(clean) || !/[+\-*/%]/.test(clean)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict";return (${clean})`)();
    return Number.isFinite(v) ? Math.round(v * 1e8) / 1e8 : null;
  } catch {
    return null;
  }
}

const OUT_OF_SCOPE = [
  [/\bweather\b|\brain\b|\btemperature\b|\bforecast\b|\bhumid/, 'I can\'t see live weather, but I can tell you sunrise, sunset and the good windows for any day.'],
  [/\bnews\b|\bheadlines\b|\belection\b|\bscore\b|\bcricket\b|\bmatch result\b/, 'I don\'t follow news or live scores. What I can do is time things: meetings, travel, purchases, ceremonies.'],
  [/\bstock price\b|\bshare price\b|\bnifty\b|\bsensex\b|\bbitcoin price\b|\bexchange rate\b|\bdollar rate\b|\bgold rate\b|\bgold price\b/, 'I don\'t have live market prices, and this isn\'t financial advice. I can tell you traditionally good times to invest or buy gold, though.'],
  [/\bhoroscope\b|\bpredict\b|\bfuture\b|\bwill i (get|be|pass|win)\b|\bfortune\b|\bkundli\b|\bjathagam\b|\bhoroscope matching\b|\bporutham\b/, 'I don\'t do predictions or horoscope matching. I work out good and bad time windows from the panchang, which you can use to choose when to act.']
];

/* ------------------------------------------------------------------ */
/* Intent detection                                                   */
/* ------------------------------------------------------------------ */

const TERM_RES = {
  rahu: GLOSSARY.find((g) => g.id === 'rahu').re,
  yama: GLOSSARY.find((g) => g.id === 'yama').re,
  gulika: GLOSSARY.find((g) => g.id === 'gulika').re,
  nalla: /\bnall?a\s*n[ae]+ram\b|\bnallaneram\b|\bgowri nalla\b/,
  gowri: GLOSSARY.find((g) => g.id === 'gowri').re,
  hora: /\bhoras?\b|\bplanetary hour/,
  choghadiya: GLOSSARY.find((g) => g.id === 'choghadiya').re,
  abhijit: GLOSSARY.find((g) => g.id === 'abhijit').re,
  brahma: GLOSSARY.find((g) => g.id === 'brahma').re,
  sunrise: /\bsun ?rise\b|\bdawn\b|\bsooriya udhayam\b/,
  sunset: /\bsun ?set\b|\bdusk\b/
};

const PANCHANG_RES = {
  tithi: /\bthithi\b|\btithi\b/,
  nakshatra: /\bnakshat?h?ra(m)?\b|\bnatchathiram\b|\bstar (today|tomorrow|now)\b|\b(today|tomorrow)'?s? star\b|\bwhich star\b|\bwhat star\b/,
  yoga: /\byogam\b|\bwhich yoga\b|\bwhat yoga\b|\byoga (today|tomorrow|now)\b/,
  karana: /\bkaranam?\b/,
  paksha: /\bpaksha\b|\bwaxing\b|\bwaning\b|\bvalarpirai\b|\btheipirai\b/,
  moonsign: /\bmoon sign\b|\bmoon (is )?in\b|\bchandra rasi\b|\bwhich rasi\b|\bmoon'?s? (rasi|sign)\b/,
  sunsign: /\bsun sign\b|\bsun (is )?in\b/,
  month: /\btamil month\b|\bwhich month\b|\bwhat month\b/
};

const OBSERVANCE_RES = {
  ekadashi: /\beka+da?s(h)?i\b/,
  pournami: /\bpou?rnami\b|\bpurnima\b|\bpoornima\b|\bfull moon\b/,
  amavasai: /\bamavas(ai|ya|i)\b|\bnew moon\b/,
  pradosham: /\bpradosh(am)?\b/,
  sashti: /\bsas?h?ti\b|\bskanda sashti\b/,
  sankatahara: /\bsankat(ahara|a hara)\b|\bsankashti\b/,
  chaturthi: /\bchaturthi\b|\bvinayaka(r)? chaturthi\b/,
  ashtami: /\bashtami\b/,
  shivaratri: /\bshiva ?rat(h)?ri\b/
};

const DEFINE_RE = /^\s*(what (is|are|does)|what's|whats|define|meaning of|explain|tell me (about|what)|why (is|do|does|should|avoid)|how (is|does) .+ (work|calculated)|difference between)\b/;
const CHECK_RE = /\b(is it|is that|is this|would it be|will it be|can i|could i|should i|shall i|may i|ok to|okay to|good to|fine to|safe to|alright to|auspicious to|good for|ok for|okay for|fine for|is .+ (good|ok|okay|fine|auspicious|bad))\b/;
const BEST_RE = /\b(best|good|right|ideal|lucky|auspicious|perfect|correct|suitable|favou?rable|nalla|subha|shubh)\s+(time|timing|moment|hour|slot|day|date|muhur\w*)\b|\bwhen (should|can|do|shall|could|would) i\b|\bwhen to\b|\bwhat time (should|can|do|to)\b|\bschedule\b|\bfind (me )?(a )?(time|slot)\b|\bplan (a|my|the)\b/;
const NOW_RE = /\b(right now|now|at the moment|currently|this moment|this minute|this hour|immediately)\b/;
const ADVICE_RE = /\b(wear|outfit|colou?r|dress|attire|clothes|which direction|what direction|face (north|south|east|west|which)|facing|opening line|what (should|do) i say|how (do|should) i (start|open|begin|approach)|tips|prepare|preparation|advice|strategy|how to (ask|pitch|negotiate|approach|start))\b/;
const FOLLOWUP_RE = /^\s*(and|what about|how about|then|also|ok|okay|same|what if|instead|or)\b|^\s*(in|on|at|for)\s+\S+\s*$/;

function matchTerm(text) {
  for (const [k, re] of Object.entries(TERM_RES)) if (re.test(text)) return k;
  return null;
}
function matchFrom(map, text) {
  for (const [k, re] of Object.entries(map)) if (re.test(text)) return k;
  return null;
}

function faqMatch(text) {
  let best = null;
  for (const f of FAQ) {
    if (f.groups.every((g) => g.test(text))) {
      const weight = f.groups.length;
      if (!best || weight > best.weight) best = { f, weight };
    }
  }
  return best?.f || null;
}

/** A short label for a plan the activity list doesn't know ("start something", "call the bank"). */
function extractPurpose(text) {
  const m = /\b(?:time|moment|day|good|ok|okay|fine|auspicious|when should i|when can i|should i|can i|when to|is it good)\s+(?:a |the )?(?:good |right |best )?(?:time |day )?(?:to|for)\s+(.+)$/.exec(text) || /\b(?:should i|can i|shall i|when to)\s+(.+)$/.exec(text);
  if (!m) return 'your plan';
  const cleaned = m[1]
    .replace(/\b(today|tomorrow|tonight|now|right now|this (morning|afternoon|evening|week)|next \w+|on \w+|at \d.*|in [a-z ]+$)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || cleaned.length > 50 || /^(do|it|this|that|something|anything|go|start|begin|things?)$/.test(cleaned)) return 'your plan';
  return cleaned;
}

/** The previous question's resolved context, for follow-ups. */
function lastMeta(history) {
  for (let i = history.length - 1; i >= 0; i--) if (history[i].role === 'assistant' && history[i].meta) return history[i].meta;
  return null;
}

function suggestionsFor(intent, c) {
  const city = c.city.name;
  const base = {
    best: ['What should I wear for it?', 'Is tomorrow better?', `Rahu Kaalam in ${city} tomorrow`],
    check: ['What is the best time instead?', 'What about tomorrow?', 'Is now a good time?'],
    now: ['Best time for a meeting today', 'When is the next Nalla Neram?', 'Today\'s panchang'],
    window: ['Today\'s full panchang', 'Best time for a meeting tomorrow', 'What is Yamagandam?'],
    panchang: ['When is the next Ekadashi?', 'Choghadiya today', 'Is today good for buying gold?'],
    compare: ['What should I wear?', 'Rahu Kaalam this week', 'Today\'s panchang'],
    define: [`Rahu Kaalam in ${city} today`, 'Nalla Neram tomorrow', 'Is now a good time?'],
    observance: ['When is the next Pournami?', 'When is the next Pradosham?', 'Today\'s panchang'],
    advice: ['Best time for it tomorrow', 'Is now a good time?', 'Rahu Kaalam today'],
    product: ['How do I add my Zoom link?', 'How accurate are the times?', 'Rahu Kaalam today'],
    other: ['Is now a good time to start something?', 'Best time for a job interview tomorrow', 'Today\'s panchang']
  };
  return base[intent] || base.other;
}

/* ------------------------------------------------------------------ */
/* Main entry point                                                   */
/* ------------------------------------------------------------------ */

/**
 * @param {string} question
 * @param {object} opts { history, defaultCity, selectedDate, mode, nowMs }
 * @returns {{ answer: string, slots: object|null, suggestions: string[], meta: object }}
 */
export function answerQuestion(question, opts) {
  const nowMs = opts.nowMs ?? Date.now();
  const defaultCity = opts.defaultCity;
  const history = opts.history || [];
  const raw = (question || '').trim();
  const prev = lastMeta(history);

  // First pass: find the city, so "today" means today in that city
  const pre = parseQuestion(raw, getZonedNow(defaultCity.timeZone, nowMs).dateStr);
  const text = pre.text;
  const hasTopic = Boolean(matchTerm(text) || matchFrom(PANCHANG_RES, text) || matchFrom(OBSERVANCE_RES, text) || pre.activity || BEST_RE.test(text)
    || ADVICE_RE.test(text) || pre.date?.range || NOW_RE.test(text) || /\b(panchang\w*|chandrash?tam\w*|chandra ashtam\w*|choghadiya|convert|time difference)\b/.test(text)
    || faqMatch(text) || OUT_OF_SCOPE.some(([re]) => re.test(text)));
  const followUp = Boolean(prev) && (FOLLOWUP_RE.test(text) || (raw.split(/\s+/).length <= 4 && !hasTopic));
  const prevCity = prev ? PLACES.find((p) => p.name === prev.city) : null;
  const city = pre.places[0] || (followUp && prevCity) || defaultCity;
  const todayStr = getZonedNow(city.timeZone, nowMs).dateStr;
  const q = city === defaultCity ? pre : parseQuestion(raw, todayStr);
  q.places = pre.places;

  const dateExplicit = Boolean(q.date && q.date.date);
  const range = q.date?.range || null;
  let dateStr = q.date?.date
    || (followUp && prev?.date)
    || (opts.selectedDate && opts.selectedDate !== getZonedNow(defaultCity.timeZone, nowMs).dateStr ? opts.selectedDate : null)
    || todayStr;
  if (!q.time && followUp && prev?.time !== undefined && prev?.time !== null && !dateExplicit && !range) q.time = prev.time;

  let activity = q.activity || (followUp && prev?.activity ? ACTIVITIES.find((a) => a.id === prev.activity) || null : null);
  const purposeText = extractPurpose(text);
  const nowMinutes = getZonedNow(city.timeZone, nowMs).minutesFromMidnight;

  const c = { q, city, defaultCity, todayStr, dateStr, dateExplicit, nowMs, nowMinutes, activity: activity || GENERIC_ACTIVITY, purposeText, history };
  let intent = 'other';
  let out = null;

  const respond = (text, extra = {}) => {
    out = { text, ...extra };
  };

  const words = text.trim().split(' ').filter(Boolean);
  const termKey = matchTerm(text);
  const panchangKey = matchFrom(PANCHANG_RES, text);
  const obsKey = matchFrom(OBSERVANCE_RES, text);
  const asksDefinition = DEFINE_RE.test(text);
  const faqHit = faqMatch(text);
  const productish = Boolean(faqHit) && !q.date && !(q.time && q.time.at !== undefined) && !obsKey && !panchangKey
    && (/\b(how (do|can|to|does|is|are)|where|can (i|you)|do you|does (it|this|nanneram)|is (it|this) (free|accurate|correct|safe|private)|why|what is (nanneram|this)|who|set ?up|add|change|connect|link|works?)\b/.test(text)
      || (!termKey && !q.activity && !BEST_RE.test(text)));
  const mathValue = safeMath(text
    .replace(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/g, '($1/100*$2)')
    .replace(/\b(what is|what's|calculate|compute|equals|=|please)\b/g, ''));
  const scopeHit = OUT_OF_SCOPE.find(([re]) => re.test(text));

  // A bare follow-up ("what about tomorrow?", "and in Delhi?", "at 4 pm?") repeats the previous kind of answer
  const repeat = followUp && !hasTopic && prev && ['best', 'check', 'compare', 'window', 'panchang', 'advice'].includes(prev.intent) ? prev : null;

  if (repeat && repeat.intent === 'window' && repeat.term) {
    intent = 'window';
    respond(range
      ? rangeWindows(c, Array.from({ length: Math.min(range.days, 14) }, (_, i) => toDateStr(new Date(parseDateStr(range.start).getTime() + i * 86400000))), repeat.term, range.label)
      : windowAnswer(c, repeat.term));
  } else if (repeat && repeat.intent === 'panchang') {
    intent = 'panchang';
    respond(repeat.term ? panchangAnswer(c, repeat.term) : panchangSummary(c));
  } else if (repeat && repeat.intent === 'advice') {
    intent = 'advice';
    respond(adviceAnswer(c));
  } else if (repeat && (q.time?.at !== undefined) && !q.date) {
    intent = 'check';
    const r = checkTime(c);
    respond(r.text, { slots: r.slots });
  } else if (repeat && (repeat.intent === 'best' || repeat.intent === 'check' || repeat.intent === 'compare')) {
    intent = 'best';
    const r = range ? compareDays(c, Array.from({ length: Math.min(range.days, 31) }, (_, i) => toDateStr(new Date(parseDateStr(range.start).getTime() + i * 86400000))), range.label) : bestTime({ ...c, q: { ...q, time: q.time?.at !== undefined ? null : q.time } });
    respond(r.text, { slots: r.slots });
    if (r.date) dateStr = r.date;
  } else if (!raw) {
    intent = 'other';
    respond('Ask me anything about good times: Rahu Kaalam, Nalla Neram, the best time for a meeting or event, today\'s panchang, or how Nanneram works.');
  } else if (/^\s*(hi|hello|hey|hii+|helo|vanakkam|namaste|namaskaram|good (morning|afternoon|evening)|yo|sup|hola)\b/.test(text) && words.length <= 4) {
    intent = 'now';
    respond(`Vanakkam! ${rightNow(c)}\n\nAsk me about any day, city, meeting or event.`);
  } else if (/^\s*(thanks|thank you|thx|ty|nandri|dhanyavad|great|awesome|nice|cool|perfect|ok thanks|got it)\b/.test(text) && words.length <= 5) {
    respond('You\'re welcome. Ask again any time you need a good time picked.');
  } else if (/^\s*(bye|goodbye|see you|good night|tata)\b/.test(text)) {
    respond('Goodbye! May your next start fall in a good window.');
  } else if (/\b(joke|funny|make me laugh)\b/.test(text)) {
    respond(JOKES[Math.floor(nowMs / 60000) % JOKES.length]);
  } else if (mathValue !== null && !q.time && !q.date) {
    respond(`That comes to ${bold(String(mathValue))}.`);
  } else if (/\b(what time is it|what is the time|current time|time now|time right now|today'?s date|what is the date|what date is it|what day is (it|today)|which day is today|what is today)\b/.test(text) && !termKey && !panchangKey) {
    intent = 'now';
    respond(q.places.length > 1 || q.zones.length ? convertAnswer(c) : currentClock(c));
  } else if (productish) {
    intent = 'product';
    respond(faqHit.text);
  } else if (scopeHit && !BEST_RE.test(text) && !CHECK_RE.test(text)) {
    respond(`${scopeHit[1]}\n\n${daySummary(c)}`);
  } else if (/\b(what (should|can|do) i do|any (suggestion|idea)s?|suggest something|i'?m bored|nothing to do|what now)\b/.test(text)) {
    intent = 'now';
    respond(`Here's where things stand:\n\n${rightNow(c)}\n\n${daySummary(c)}`);
  } else if ((q.zones.length && q.time && q.time.at !== undefined && !termKey && !q.activity) || ((q.zones.length || q.places.length >= 2) && /\b(convert|time difference|difference|ahead|behind|in .+ time|what time (is|will) it be|what time is .+ in|what is .+ in|when it is|when it's|equals|same as|to (ist|est|pst|gmt|cst|bst|cet|gst|sgt|aest|jst)|in (ist|est|pst|gmt|cst|bst|cet|gst|sgt|aest|jst))\b/.test(text) && !termKey && !q.activity)) {
    intent = 'other';
    respond(convertAnswer(c));
  } else if (/\bchandrashtam|\bchandrastam|\bchandra ashtam/.test(text)) {
    intent = 'panchang';
    respond(chandrashtamamAnswer(c));
  } else if (obsKey && !(asksDefinition && !/\b(when|next|date|day)\b/.test(text))) {
    intent = 'observance';
    respond(observanceAnswer(c, obsKey));
  } else if (/\bdifference\b|\bvs\b|\bversus\b|\bcompared to\b/.test(text) && GLOSSARY.filter((g) => g.re.test(text)).length >= 2) {
    intent = 'define';
    const names = GLOSSARY.filter((g) => g.re.test(text)).slice(0, 3);
    respond(`${names.map((g) => `${bold(g.name)}: ${g.text}`).join('\n\n')}\n\n${daySummary(c)}`);
  } else if (asksDefinition && (termKey || panchangKey || obsKey) && !/\b(today|tomorrow|now|tonight|when|time|this week)\b/.test(text) && !q.date) {
    intent = 'define';
    const g = GLOSSARY.find((x) => x.re.test(text));
    const live = termKey && ['rahu', 'yama', 'gulika', 'nalla', 'abhijit', 'brahma'].includes(termKey) ? `\n\n${windowAnswer(c, termKey)}` : panchangKey ? `\n\n${panchangAnswer(c, panchangKey)}` : '';
    respond(`${bold(g ? g.name : 'In short')}: ${g ? g.text : ''}${live}`);
  } else if (/\b(panchang|panchangam|panjangam|panchangamu|daily sheet|full details|everything about (today|tomorrow))\b/.test(text) && !q.activity) {
    intent = 'panchang';
    respond(panchangSummary(c));
  } else if (panchangKey && !q.activity) {
    intent = 'panchang';
    respond(panchangAnswer(c, panchangKey));
  } else if (termKey && !(q.activity && (BEST_RE.test(text) || CHECK_RE.test(text) || ADVICE_RE.test(text))) && !(q.time && q.time.at !== undefined && CHECK_RE.test(text))) {
    intent = 'window';
    if (range) {
      const days = Array.from({ length: Math.min(range.days, 14) }, (_, i) => toDateStr(new Date(parseDateStr(range.start).getTime() + i * 86400000)));
      respond(rangeWindows(c, days, termKey, range.label));
    } else if (NOW_RE.test(text) && /\b(is|are|running|now|currently)\b/.test(text) && ['rahu', 'yama', 'gulika'].includes(termKey)) {
      const day = calculateVedicDay(parseDateStr(todayStr), city);
      const w = { rahu: day.rahuKaalam, yama: day.yamagandam, gulika: day.gulikaKaalam }[termKey];
      const name = { rahu: 'Rahu Kaalam', yama: 'Yamagandam', gulika: 'Gulika Kaalam' }[termKey];
      respond(within(nowMinutes, w)
        ? `${bold(`Yes, ${name} is running now`)} in ${city.name} (${span(w)}), for another ${remaining(w.end - nowMinutes)}.`
        : `${bold(`No, ${name} is not running now`)} in ${city.name}. Today it is ${span(w)}${nowMinutes < w.start ? `, starting in ${remaining(w.start - nowMinutes)}` : ', already over'}.`);
    } else {
      respond(windowAnswer({ ...c, dateStr }, termKey));
    }
  } else if (q.time && q.time.at !== undefined && (CHECK_RE.test(text) || q.activity || /\b(okay|ok|good|fine|bad|auspicious)\b/.test(text))) {
    intent = 'check';
    const r = checkTime(c);
    respond(r.text, { slots: r.slots });
  } else if (NOW_RE.test(text) && !range && !(q.date && q.date.date && q.date.label !== 'today') && !/\b(best|from now|later|next|after now)\b/.test(text)) {
    intent = 'now';
    respond(rightNow({ ...c, activity: c.activity }));
  } else if (ADVICE_RE.test(text) && !/\b(best|good|right|auspicious) (time|day|moment)\b|\bwhen (should|can|to)\b/.test(text)) {
    intent = 'advice';
    respond(adviceAnswer(c));
  } else if ((range || /\b(which|what) (day|date)\b|\bbest day\b|\bgood day\b|\bwhich is better\b|\bor\b.+\b(day|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(text)) && (q.activity || BEST_RE.test(text) || CHECK_RE.test(text) || /\b(which|best|good|better)\b/.test(text))) {
    intent = 'compare';
    let dates;
    let label = range?.label;
    const weekdayHits = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].filter((d) => text.includes(d));
    if (weekdayHits.length >= 2) {
      dates = weekdayHits.map((w) => findDate(w, todayStr).date);
      label = weekdayHits.join(' vs ');
    } else if (range) {
      dates = Array.from({ length: Math.min(range.days, 31) }, (_, i) => toDateStr(new Date(parseDateStr(range.start).getTime() + i * 86400000)));
    } else {
      dates = Array.from({ length: 7 }, (_, i) => toDateStr(new Date(parseDateStr(todayStr).getTime() + i * 86400000)));
      label = 'over the next 7 days';
    }
    const r = compareDays(c, dates, label);
    respond(r.text, { slots: r.slots });
    if (r.date) dateStr = r.date;
  } else if (q.activity || BEST_RE.test(text) || (CHECK_RE.test(text) && (q.date || q.time))) {
    intent = 'best';
    if (q.activity && q.activity.strict && !q.date && !q.time) {
      // Big events with no date: search the coming weeks, not just today
      intent = 'compare';
      const span = q.activity.kind === 'ritual' ? 30 : 14;
      const dates = Array.from({ length: span }, (_, i) => toDateStr(new Date(parseDateStr(todayStr).getTime() + i * 86400000)));
      const r = compareDays(c, dates, `over the next ${span} days`);
      respond(r.text, { slots: r.slots });
      if (r.date) dateStr = r.date;
    } else if (q.activity && /\b(is|will|would|was) (today|tomorrow|it|this|that|\w+day|the \d+\w*|\d+\w*)\b.*\b(good|ok|okay|fine|auspicious|bad|right)\b|\b(good|auspicious|right) day\b/.test(text) && !q.time) {
      // "is tomorrow good for buying gold?" -> day verdict + slots
      const dp = dayPanchang(city, dateStr);
      const f = dayFactors(dp, c.activity);
      const r = bestTime(c);
      const verdict = f.bad.length === 0 ? `${bold('Yes')}, ${dayWord(dateStr, todayStr)} looks good for ${c.activity.label}${f.good.length ? ` (${f.good.join(', ')})` : ''}.`
        : f.bad.length === 1 && !c.activity.strict ? `${bold('It is fine')}, with one caution: ${f.bad[0]}.`
          : `${bold('Not the strongest day')} for ${c.activity.label}: ${f.bad.join('; ')}.`;
      respond(`${verdict}\n\n${r.text}`, { slots: r.slots });
    } else {
      const r = bestTime(c);
      const calm = /\b(nervous|anxious|scared|worried|stress|tension|afraid)\b/.test(text) ? 'Feeling nervous is normal; choosing a calm, favourable window is one thing you can control.\n\n' : '';
      respond(calm + r.text, { slots: r.slots });
      if (r.date) dateStr = r.date;
    }
  } else {
    const faq = faqMatch(text);
    const scope = OUT_OF_SCOPE.find(([re]) => re.test(text));
    const g = GLOSSARY.find((x) => x.re.test(text));
    if (faq) {
      intent = 'product';
      respond(faq.text);
    } else if (scope) {
      respond(`${scope[1]}\n\n${daySummary(c)}`);
    } else if (g) {
      intent = 'define';
      respond(`${bold(g.name)}: ${g.text}`);
    } else if (CHECK_RE.test(text) || /\b(should|can|shall) i\b/.test(text)) {
      intent = 'best';
      const r = bestTime(c);
      respond(r.text, { slots: r.slots });
    } else if (/\b(nervous|anxious|scared|worried|stress|tension|afraid)\b/.test(text)) {
      intent = 'best';
      const r = bestTime(c);
      respond(`Being nervous is normal; picking a calm, good window is one thing you can control.\n\n${r.text}`, { slots: r.slots });
    } else if (q.places.length || q.date) {
      intent = 'window';
      respond(daySummary(c));
    } else {
      respond(`I mostly answer questions about timing, and I couldn't connect this one to a time or a feature. Here is today for ${city.name} in case it helps:\n\n${daySummary(c)}\n\nYou can ask things like "best time to sign a contract on Friday", "is 4 PM okay for a call?", "Rahu Kaalam in Dubai tomorrow" or "when is the next Pournami?".`);
    }
  }

  let answer = out.text;
  if (opts.mode === 'genz') answer = genz(answer, nowMs);
  return {
    answer,
    slots: out.slots || null,
    suggestions: suggestionsFor(intent, c),
    meta: {
      intent,
      city: city.name,
      date: dateStr,
      activity: activity ? activity.id : null,
      time: q.time || null,
      term: intent === 'window' ? (termKey || repeat?.term || null) : intent === 'panchang' ? (panchangKey || repeat?.term || null) : null
    }
  };
}

/* ------------------------------------------------------------------ */
/* Tone                                                               */
/* ------------------------------------------------------------------ */

const GENZ_OPENERS = ['ok so', 'real talk:', 'bet,', 'no cap,', 'lowkey,'];

function genz(text, seed) {
  const opener = GENZ_OPENERS[Math.floor(seed / 1000) % GENZ_OPENERS.length];
  return `${opener} ${text[0].toLowerCase()}${text.slice(1)}`
    .replace(/Avoid starting anything important in it\./g, 'Don\'t start anything big then, it\'s an L window.')
    .replace(/\(best\)/g, '(the move)')
    .replace(/Yes, that is a good time/g, 'Yes, that time slaps')
    .replace(/Better to avoid/g, 'Nah, skip it')
    .replace(/Not ideal/g, 'Kinda mid');
}

export { normalize };
