/**
 * Day-level panchang built on the timing engine and the lunar module:
 * tithi / nakshatra / yoga / karana at sunrise, choghadiya, Abhijit and Brahma
 * muhurta, upcoming observance days and Chandrashtamam.
 */

import { calculateVedicDay, formatTime, zonedMinutesToUtcDate, getZonedNow } from '../vedicTiming.js';
import { panchangAt, tithiNumberAt, moonSignIndexAt, endOf, RASI_NAMES, NAKSHATRA_NAMES } from './lunar.js';
import { parseDateStr, toDateStr } from './parse.js';

const CHOG_ORDER = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];
const CHOG_DAY_START = [0, 3, 6, 2, 5, 1, 4];   // Sun..Sat
const CHOG_NIGHT_START = [5, 1, 4, 0, 3, 6, 2]; // Sun..Sat
export const CHOG_QUALITY = {
  Amrit: { tone: 'good', text: 'best' },
  Shubh: { tone: 'good', text: 'good' },
  Labh: { tone: 'good', text: 'gain' },
  Char: { tone: 'neutral', text: 'neutral, good for travel' },
  Udveg: { tone: 'bad', text: 'anxiety, avoid' },
  Kaal: { tone: 'bad', text: 'loss, avoid' },
  Rog: { tone: 'bad', text: 'trouble, avoid' }
};

export function choghadiya(day) {
  const dayPart = day.dinamana / 8;
  const nightPart = day.ratrimana / 8;
  const list = [];
  for (let i = 0; i < 8; i++) {
    const name = CHOG_ORDER[(CHOG_DAY_START[day.dayOfWeek] + i) % 7];
    list.push({ name, start: day.sunriseMin + i * dayPart, end: day.sunriseMin + (i + 1) * dayPart, night: false, ...CHOG_QUALITY[name] });
  }
  for (let i = 0; i < 8; i++) {
    const name = CHOG_ORDER[(CHOG_NIGHT_START[day.dayOfWeek] + 5 * i) % 7];
    list.push({ name, start: day.sunsetMin + i * nightPart, end: day.sunsetMin + (i + 1) * nightPart, night: true, ...CHOG_QUALITY[name] });
  }
  return list;
}

const loadDay = (city, dateStr) => calculateVedicDay(parseDateStr(dateStr), city);

/** Local wall-clock label for an instant in a city ("02:15 PM", or "02:15 PM (Wed 21 Oct)" on another day). */
export function localLabel(ms, city, dateStr) {
  const z = getZonedNow(city.timeZone, ms);
  const time = formatTime(z.minutesFromMidnight);
  if (z.dateStr === dateStr) return time;
  const d = parseDateStr(z.dateStr);
  return `${time} (${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })})`;
}

/** Everything about one day in one city. */
export function dayPanchang(city, dateStr) {
  const day = loadDay(city, dateStr);
  const sunriseMs = zonedMinutesToUtcDate(dateStr, city.timeZone, day.sunriseMin).getTime();
  const p = panchangAt(sunriseMs);

  const prev = loadDay(city, toDateStr(new Date(parseDateStr(dateStr).getTime() - 86400000)));
  const nightMuhurta = prev.ratrimana / 15;
  const dayMuhurta = day.dinamana / 15;

  return {
    city,
    dateStr,
    day,
    sunriseMs,
    panchang: p,
    label: (ms) => localLabel(ms, city, dateStr),
    choghadiya: choghadiya(day),
    abhijit: { start: day.sunriseMin + 7 * dayMuhurta, end: day.sunriseMin + 8 * dayMuhurta },
    brahma: { start: day.sunriseMin - 2 * nightMuhurta, end: day.sunriseMin - nightMuhurta }
  };
}

/* ------------------------------------------------------------------ */
/* Observance days                                                    */
/* ------------------------------------------------------------------ */

export const OBSERVANCES = {
  ekadashi: { label: 'Ekadashi', tithis: [11, 26], at: 'sunrise' },
  pournami: { label: 'Pournami (full moon)', tithis: [15], at: 'sunrise' },
  amavasai: { label: 'Amavasai (new moon)', tithis: [30], at: 'sunrise' },
  pradosham: { label: 'Pradosham', tithis: [13, 28], at: 'sunset' },
  sashti: { label: 'Sashti', tithis: [6], at: 'sunrise' },
  sankatahara: { label: 'Sankatahara Chaturthi', tithis: [19], at: 'night' },
  chaturthi: { label: 'Chaturthi (Vinayaka)', tithis: [4], at: 'noon' },
  ashtami: { label: 'Ashtami', tithis: [8, 23], at: 'sunrise' },
  shivaratri: { label: 'Masik Shivaratri', tithis: [29], at: 'midnight' }
};

/** Next `count` dates of an observance, starting from `fromDateStr`. */
export function nextObservances(city, key, fromDateStr, count = 3) {
  const obs = OBSERVANCES[key];
  const out = [];
  let d = parseDateStr(fromDateStr);
  for (let i = 0; i < 400 && out.length < count; i++) {
    const dateStr = toDateStr(d);
    const day = loadDay(city, dateStr);
    const minute = obs.at === 'sunset' ? day.sunsetMin
      : obs.at === 'noon' ? (day.sunriseMin + day.sunsetMin) / 2
        : obs.at === 'night' ? day.sunsetMin + 120
          : obs.at === 'midnight' ? 24 * 60
            : day.sunriseMin;
    const ms = zonedMinutesToUtcDate(dateStr, city.timeZone, minute).getTime();
    const tithi = tithiNumberAt(ms);
    if (obs.tithis.includes(tithi)) {
      const prevOut = out[out.length - 1];
      if (!prevOut || (parseDateStr(dateStr) - parseDateStr(prevOut.date)) > 2 * 86400000) {
        out.push({ date: dateStr, weekday: day.dayName, paksha: tithi <= 15 ? 'Shukla (waxing)' : 'Krishna (waning)', endsAt: endOf('tithi', ms) });
      }
    }
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Chandrashtamam                                                     */
/* ------------------------------------------------------------------ */

/** Rasi index (0-11) a nakshatra mostly falls in. */
export const rasiOfNakshatra = (nakIndex) => Math.floor(((nakIndex + 0.5) * (360 / 27)) / 30);

/** Next periods when the Moon is in the 8th sign from the given birth rasi. */
export function chandrashtamam(birthRasi, fromMs, count = 2) {
  const target = (birthRasi + 7) % 12;
  const periods = [];
  let t = fromMs;
  for (let guard = 0; guard < 24 * 70 && periods.length < count; guard++) {
    if (moonSignIndexAt(t) === target) {
      // walk back to the start of this transit
      let start = t;
      while (moonSignIndexAt(start - 3600000) === target) start -= 3600000;
      let lo = start - 3600000;
      let hi = start;
      for (let i = 0; i < 25; i++) {
        const mid = (lo + hi) / 2;
        if (moonSignIndexAt(mid) === target) hi = mid;
        else lo = mid;
      }
      const end = endOf('moonSign', t);
      periods.push({ start: hi, end, rasi: RASI_NAMES[target] });
      t = end + 3600000;
    } else {
      t += 3600000;
    }
  }
  return periods;
}

export { RASI_NAMES, NAKSHATRA_NAMES };
