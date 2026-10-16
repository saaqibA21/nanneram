/**
 * Question-answering tools shared by the /api/ask serverless function (as Claude
 * tools) and the in-browser offline answerer. Every timing comes from the same
 * deterministic engine the rest of the site uses, so answers never guess times.
 */

import {
  CITIES, calculateVedicDay, findOptimalMeetingSlots, formatTime, formatDuration,
  formatUtcOffset, getZonedNow, getLiveHora, HORA_METADATA, GOWRI_STATES
} from './vedicTiming.js';
import { generateOracleConsultation } from './oracleConsultant.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const isValidZone = (tz) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/**
 * Resolve a place. Preset cities match by name; any other place needs latitude,
 * longitude and an IANA time zone (Claude supplies these for unlisted cities).
 */
export function resolveLocation({ city, latitude, longitude, timeZone } = {}) {
  const name = (city || '').trim();
  const preset = CITIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (preset) return { ok: true, city: preset };

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 66 && Math.abs(lng) <= 180 && timeZone && isValidZone(timeZone)) {
    return { ok: true, city: { name: name || `${lat.toFixed(2)}, ${lng.toFixed(2)}`, state: '', lat, lng, timeZone } };
  }
  if (Number.isFinite(lat) && Math.abs(lat) > 66) {
    return { ok: false, error: 'Places beyond 66° latitude are not supported: the sun may not rise or set there on some days.' };
  }
  return {
    ok: false,
    error: `Unknown place "${name}". Preset cities: ${CITIES.map((c) => c.name).join(', ')}. For any other place pass latitude, longitude and an IANA timeZone.`
  };
}

const parseDate = (dateStr) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) || d.getMonth() !== Number(m[2]) - 1 ? null : d;
};

const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const span = (w) => `${formatTime(w.start)} – ${formatTime(w.end)}`;

function loadDay(args) {
  const loc = resolveLocation(args);
  if (!loc.ok) return { error: loc.error };
  const date = args.date ? parseDate(args.date) : parseDate(getZonedNow(loc.city.timeZone).dateStr);
  if (!date) return { error: `Invalid date "${args.date}". Use YYYY-MM-DD.` };
  return { city: loc.city, date, day: calculateVedicDay(date, loc.city) };
}

/* ------------------------------------------------------------------ */
/* Tool implementations (plain JSON in, plain JSON out)                 */
/* ------------------------------------------------------------------ */

export function getDayTimings(args) {
  const r = loadDay(args);
  if (r.error) return r;
  const { city, date, day } = r;
  return {
    city: city.name,
    date: toDateStr(date),
    weekday: day.dayName,
    timeZone: `${city.timeZone} (${formatUtcOffset(day.utcOffsetHours)})`,
    sunrise: formatTime(day.sunriseMin),
    sunset: formatTime(day.sunsetMin),
    nextSunrise: formatTime(day.nextSunriseMin),
    dayLength: formatDuration(day.dinamana),
    nightLength: formatDuration(day.ratrimana),
    rahuKaalam: span(day.rahuKaalam),
    yamagandam: span(day.yamagandam),
    gulikaKaalam: span(day.gulikaKaalam),
    nallaNeramDay: day.nallaNeramDay.map((w) => `${span(w)} (${w.states.join(' + ')})`),
    nallaNeramNight: day.nallaNeramNight.map((w) => `${span(w)} (${w.states.join(' + ')})`),
    gowriDay: day.gowriSlots.map((g) => `${span(g)} ${g.name} (${g.quality})`),
    gowriNight: day.nightGowriSlots.map((g) => `${span(g)} ${g.name} (${g.quality})`),
    horasDay: day.horas.map((h) => `${span(h)} ${h.planet}`),
    horasNight: day.nightHoras.map((h) => `${span(h)} ${h.planet}`)
  };
}

export function findMeetingSlots(args) {
  const r = loadDay(args);
  if (r.error) return r;
  const { city, date, day } = r;
  const duration = [15, 30, 45, 60, 90, 120].includes(Number(args.durationMinutes)) ? Number(args.durationMinutes) : 30;
  const purpose = (args.purpose || 'Important meeting').slice(0, 300);
  const slots = findOptimalMeetingSlots(day, purpose, duration);
  return {
    city: city.name,
    presetCity: CITIES.some((c) => c.name === city.name),
    date: toDateStr(date),
    weekday: day.dayName,
    purpose,
    durationMinutes: duration,
    searchedWindow: '9:00 AM – 7:00 PM local time',
    skipped: { rahuKaalam: span(day.rahuKaalam), yamagandam: span(day.yamagandam) },
    slots: slots.map((s, i) => ({
      rank: i + 1,
      start: s.startTimeFormatted,
      end: s.endTimeFormatted,
      startMin: s.startMin,
      wrapUpBy: s.gracefulExitWindow.split(' – ')[0],
      hora: s.hora.planet,
      gowri: s.gowri.name,
      why: s.recommendation
    }))
  };
}

export function getRightNow(args) {
  const loc = resolveLocation(args);
  if (!loc.ok) return { error: loc.error };
  const city = loc.city;
  const { hora, gowri, day, minutes } = getLiveHora(city);
  const clock = getZonedNow(city.timeZone);
  const inWin = (w) => minutes >= w.start && minutes < w.end;
  let verdict = 'Good time to start things';
  if (inWin(day.rahuKaalam)) verdict = 'Rahu Kaalam is running: avoid starting important things';
  else if (inWin(day.yamagandam)) verdict = 'Yamagandam is running: use care';
  else if (gowri.quality !== 'Auspicious') verdict = `${gowri.name} Gowri is running: not favourable`;
  else if (hora.planet === 'Mars' || hora.planet === 'Saturn') verdict = `Favourable Gowri, but ${hora.planet} Hora calls for caution`;
  return {
    city: city.name,
    localTime: formatTime(clock.minutesFromMidnight),
    localDate: clock.dateStr,
    vedicWeekday: day.dayName,
    hora: `${hora.planet} (${hora.badge}), ends ${formatTime(hora.end)}`,
    gowri: `${gowri.name} (${gowri.quality}), ends ${formatTime(gowri.end)}`,
    rahuKaalamToday: span(day.rahuKaalam),
    verdict
  };
}

export function getMeetingAdvice(args) {
  const r = loadDay(args);
  if (r.error) return r;
  const c = generateOracleConsultation({ prompt: (args.description || '').slice(0, 1000), vedicData: r.day, selectedCity: r.city });
  return {
    city: c.city,
    date: toDateStr(r.date),
    meetingType: c.archetype,
    bestWindow: c.slot ? `${c.slot.startTimeFormatted} – ${c.slot.endTimeFormatted} (${c.slot.hora.planet} Hora, ${c.slot.gowri.name})` : 'No clear window that day',
    wear: c.attire.recommendedPalette,
    avoidWearing: c.attire.avoidColors,
    fabric: c.attire.fabrics,
    metalAndWatch: c.attire.metalAndWatch,
    faceDirection: `${c.attire.direction}: ${c.attire.directionMeaning}`,
    openingLine: c.openingScript,
    howToRunIt: c.tacticalAdvice,
    deskSetup: c.deskRitual,
    rahuKaalam: c.rahuAvoidance
  };
}

export function compareDays(args) {
  const loc = resolveLocation(args);
  if (!loc.ok) return { error: loc.error };
  const start = parseDate(args.startDate) || parseDate(getZonedNow(loc.city.timeZone).dateStr);
  if (!start) return { error: 'Invalid startDate. Use YYYY-MM-DD.' };
  const days = Math.min(Math.max(Number(args.days) || 7, 1), 14);
  const purpose = (args.purpose || 'Important meeting').slice(0, 300);
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const day = calculateVedicDay(d, loc.city);
    const best = findOptimalMeetingSlots(day, purpose, Number(args.durationMinutes) || 30)[0];
    out.push({
      date: toDateStr(d),
      weekday: day.dayName,
      rahuKaalam: span(day.rahuKaalam),
      bestSlot: best ? `${best.startTimeFormatted} – ${best.endTimeFormatted} (${best.hora.planet} Hora, ${best.gowri.name})` : 'none',
      bestScore: best ? best.score : 0
    });
  }
  return { city: loc.city.name, purpose, days: out };
}

export const REFERENCE = {
  terms: {
    'Rahu Kaalam': 'A weekday-fixed eighth of the daytime (about 90 minutes). Traditionally not used to begin contracts, launches, pitches or journeys.',
    Yamagandam: 'Another weekday-fixed eighth of the daytime. Starts made here are said to meet friction.',
    'Gulika Kaalam': 'A weekday-fixed eighth of the daytime. What begins here tends to repeat, so it suits routine work, not disputes.',
    Hora: 'Day and night are each split into 12 Horas ruled by planets in Chaldean order, starting with the weekday lord at sunrise.',
    'Gowri Panchangam': 'Day and night are each split into 8 parts with a fixed weekday order. Amirtham, Labham, Danam, Sugam and Uthi are favourable (Nalla Neram); Rogam, Soram and Visham are not.',
    'Nalla Neram': 'Tamil for "good time": the favourable Gowri parts of the day and night.'
  },
  horas: Object.fromEntries(Object.entries(HORA_METADATA).map(([k, v]) => [k, { goodFor: v.goodFor, avoidFor: v.avoidFor, meaning: v.rulerMeaning }])),
  gowri: Object.fromEntries(Object.entries(GOWRI_STATES).map(([k, v]) => [k, `${v.quality} (${v.rank}): ${v.desc}`])),
  method: 'Sunrise and sunset use the NOAA solar equations (90.833° zenith) with each city\'s real, daylight-saving-aware UTC offset. Meeting slots are searched 9 AM – 7 PM, skip Rahu Kaalam and Yamagandam, start in a favourable Gowri part, and are ranked by how well the Hora suits the meeting type.',
  product: {
    pages: 'Today (live status and timeline), Schedule (slot finder with Google Calendar, .ics and copy-invite), Advisor (attire, direction and opening line), Guide (method and numbers), Plans (pricing preview), Ask (this assistant).',
    cities: CITIES.map((c) => c.name),
    video: 'Set a Zoom personal room (Meeting ID or personal link) or a shared Google Meet room link from the button in the top bar. Links are saved only in your browser and added to invites. Nanneram does not sign in to Zoom or Google.',
    calendar: 'Each slot has Add to Google Calendar, an .ics file for Apple Calendar / Outlook (with a reminder 5 minutes before the end), and Copy invite. Two-way calendar sync is not available yet.',
    modes: 'Classic and Gen-Z modes change the tone and advice style, not the timings.',
    pricing: 'Everything is free during the preview. Planned: Pro ₹599/month, Team ₹2,499/month; their extra features are marked coming soon.',
    limits: 'Timings are traditional planning aids. They do not predict or guarantee outcomes and are not financial, legal or medical advice.'
  }
};

export const getReference = () => REFERENCE;

/* ------------------------------------------------------------------ */
/* Claude tool definitions                                              */
/* ------------------------------------------------------------------ */

const placeProps = {
  city: { type: 'string', description: `City name. Preset cities: ${CITIES.map((c) => c.name).join(', ')}. For other places also pass latitude, longitude and timeZone.` },
  latitude: { type: 'number', description: 'Latitude in degrees, only for places not in the preset list.' },
  longitude: { type: 'number', description: 'Longitude in degrees (east positive), only for places not in the preset list.' },
  timeZone: { type: 'string', description: 'IANA time zone such as "Asia/Kolkata", only for places not in the preset list.' }
};

export const TOOL_DEFINITIONS = [
  {
    name: 'get_day_timings',
    description: 'Full panchangam timings for one place and date: sunrise, sunset, Rahu Kaalam, Yamagandam, Gulika Kaalam, Nalla Neram (day and night), every Gowri part and every Hora.',
    input_schema: {
      type: 'object',
      properties: { ...placeProps, date: { type: 'string', description: 'YYYY-MM-DD. Omit for today in that place.' } },
      required: ['city']
    }
  },
  {
    name: 'find_meeting_slots',
    description: 'Ranked best meeting slots on one date for a meeting type and length. Skips Rahu Kaalam and Yamagandam, searches 9 AM – 7 PM local time.',
    input_schema: {
      type: 'object',
      properties: {
        ...placeProps,
        date: { type: 'string', description: 'YYYY-MM-DD. Omit for today in that place.' },
        purpose: { type: 'string', description: 'What the meeting is, e.g. "VC pitch", "salary negotiation", "job interview".' },
        durationMinutes: { type: 'integer', description: 'One of 15, 30, 45, 60, 90, 120. Default 30.' }
      },
      required: ['city', 'purpose']
    }
  },
  {
    name: 'compare_days',
    description: 'Best slot and Rahu Kaalam for each day over a range (up to 14 days). Use for "which day this week is best" questions.',
    input_schema: {
      type: 'object',
      properties: {
        ...placeProps,
        startDate: { type: 'string', description: 'YYYY-MM-DD. Omit for today.' },
        days: { type: 'integer', description: 'Number of days, 1-14. Default 7.' },
        purpose: { type: 'string' },
        durationMinutes: { type: 'integer' }
      },
      required: ['city']
    }
  },
  {
    name: 'get_right_now',
    description: 'What is running right now in a place: local time, current Hora, current Gowri, and whether it is a good moment to start something.',
    input_schema: { type: 'object', properties: placeProps, required: ['city'] }
  },
  {
    name: 'get_meeting_advice',
    description: 'Traditional advice for a described meeting: best window, colours to wear and avoid, fabric, which direction to face, an opening line, how to run it, and desk setup.',
    input_schema: {
      type: 'object',
      properties: { ...placeProps, date: { type: 'string', description: 'YYYY-MM-DD. Omit for today.' }, description: { type: 'string', description: 'The meeting in the user\'s words.' } },
      required: ['city', 'description']
    }
  },
  {
    name: 'get_reference',
    description: 'Definitions of Rahu Kaalam, Yamagandam, Gulika, Hora, Gowri and Nalla Neram; what each Hora and Gowri part suits; how timings are calculated; and how the Nanneram product works (pages, cities, Zoom/Meet setup, calendar export, modes, pricing, limits).',
    input_schema: { type: 'object', properties: {} }
  }
];

const IMPLEMENTATIONS = {
  get_day_timings: getDayTimings,
  find_meeting_slots: findMeetingSlots,
  compare_days: compareDays,
  get_right_now: getRightNow,
  get_meeting_advice: getMeetingAdvice,
  get_reference: getReference
};

export function runTool(name, input) {
  const fn = IMPLEMENTATIONS[name];
  if (!fn) return { error: `Unknown tool ${name}` };
  try {
    return fn(input && typeof input === 'object' ? input : {});
  } catch (err) {
    return { error: `Tool failed: ${err.message}` };
  }
}

export { DAY_NAMES, toDateStr, parseDate };
