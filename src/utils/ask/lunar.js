/**
 * Sun and Moon positions (Meeus, "Astronomical Algorithms", truncated series)
 * and the panchang elements built on them: tithi, nakshatra, yoga, karana,
 * moon sign and sun sign. Accuracy is about a minute or two for end times,
 * which matches published panchangs closely enough for planning.
 */

const RAD = Math.PI / 180;
const norm = (deg) => ((deg % 360) + 360) % 360;

// Delta T (TT - UT) for the 2020s, in days
const DELTA_T_DAYS = 69 / 86400;

const julianCenturies = (ms) => ((ms / 86400000 + 2440587.5 + DELTA_T_DAYS) - 2451545.0) / 36525;

/** Apparent tropical longitude of the Sun in degrees. */
export function sunLongitude(ms) {
  const T = julianCenturies(ms);
  const L0 = 280.46646 + T * (36000.76983 + T * 0.0003032);
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T))
    + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T)
    + Math.sin(3 * M * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  return norm(L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD));
}

// [D, M, M', F, coefficient (1e-6 deg)] — the largest terms of Meeus table 47.A
const MOON_TERMS = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294]
];

/** Apparent tropical longitude of the Moon in degrees. */
export function moonLongitude(ms) {
  const T = julianCenturies(ms);
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000;
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.290 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  let sum = 0;
  for (const [d, m, mp, f, c] of MOON_TERMS) {
    const e = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
    sum += c * e * Math.sin((d * D + m * M + mp * Mp + f * F) * RAD);
  }
  sum += 3958 * Math.sin(A1 * RAD) + 1962 * Math.sin((Lp - F) * RAD) + 318 * Math.sin(A2 * RAD);

  const omega = 125.04452 - 1934.136261 * T;
  return norm(Lp + sum / 1e6 - 0.00478 * Math.sin(omega * RAD));
}

/** Lahiri (Chitrapaksha) ayanamsa in degrees. */
export function ayanamsa(ms) {
  const years = (ms - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000);
  return 23.8636 + years * (50.2787 / 3600);
}

export const TITHI_NAMES = [
  'Prathamai', 'Dwitiyai', 'Tritiyai', 'Chaturthi', 'Panchami', 'Shashti', 'Saptami', 'Ashtami',
  'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'
];
export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Thiruvathirai (Ardra)', 'Punarvasu', 'Pushya (Poosam)',
  'Ashlesha (Ayilyam)', 'Magha', 'Purva Phalguni (Pooram)', 'Uttara Phalguni (Uthiram)', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha (Kettai)', 'Mula', 'Purva Ashadha (Pooradam)', 'Uttara Ashadha (Uthiradam)',
  'Shravana (Thiruvonam)', 'Dhanishta (Avittam)', 'Shatabhisha (Sadayam)', 'Purva Bhadrapada (Poorattathi)',
  'Uttara Bhadrapada (Uthirattathi)', 'Revati'
];
export const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula',
  'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];
export const RASI_NAMES = [
  'Mesha (Aries)', 'Rishabha (Taurus)', 'Mithuna (Gemini)', 'Kataka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
  'Thula (Libra)', 'Vrischika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];
export const TAMIL_MONTHS = [
  'Chithirai', 'Vaikasi', 'Aani', 'Aadi', 'Avani', 'Purattasi', 'Aippasi', 'Karthigai', 'Margazhi', 'Thai', 'Maasi', 'Panguni'
];
const MOVABLE_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];

// Yogas and tithis traditionally avoided for new beginnings
export const INAUSPICIOUS_YOGAS = new Set(['Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti']);
export const RIKTA_TITHIS = new Set([4, 9, 14, 19, 24, 29]); // Chaturthi, Navami, Chaturdashi

export const tithiName = (n) => {
  if (n === 15) return 'Pournami (Full Moon)';
  if (n === 30) return 'Amavasai (New Moon)';
  return TITHI_NAMES[(n - 1) % 15];
};
export const pakshaOf = (n) => (n <= 15 ? 'Shukla Paksha (waxing)' : 'Krishna Paksha (waning)');

export const karanaName = (k) => {
  if (k === 0) return 'Kimstughna';
  if (k >= 57) return ['Shakuni', 'Chatushpada', 'Naga'][k - 57];
  return MOVABLE_KARANAS[(k - 1) % 7];
};

const elongation = (ms) => norm(moonLongitude(ms) - sunLongitude(ms));
const siderealMoon = (ms) => norm(moonLongitude(ms) - ayanamsa(ms));
const siderealSun = (ms) => norm(sunLongitude(ms) - ayanamsa(ms));
const yogaAngle = (ms) => norm(siderealMoon(ms) + siderealSun(ms));

const ELEMENTS = {
  tithi: { fn: elongation, size: 12 },
  karana: { fn: elongation, size: 6 },
  nakshatra: { fn: siderealMoon, size: 360 / 27 },
  yoga: { fn: yogaAngle, size: 360 / 27 },
  moonSign: { fn: siderealMoon, size: 30 },
  sunSign: { fn: siderealSun, size: 30 }
};

const indexAt = (kind, ms) => Math.floor(ELEMENTS[kind].fn(ms) / ELEMENTS[kind].size);

/** When the element running at `ms` ends (ms timestamp). */
export function endOf(kind, ms) {
  const start = indexAt(kind, ms);
  let lo = ms;
  let hi = ms + 3600000;
  let guard = 0;
  while (indexAt(kind, hi) === start && guard++ < 24 * 40) {
    lo = hi;
    hi += 3600000;
  }
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (indexAt(kind, mid) === start) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** Panchang elements at a moment, with when each one ends. */
export function panchangAt(ms) {
  const tithiIdx = indexAt('tithi', ms);
  const nak = indexAt('nakshatra', ms);
  const yoga = indexAt('yoga', ms);
  const karana = indexAt('karana', ms);
  const tithiNum = tithiIdx + 1;
  return {
    tithi: { number: tithiNum, name: tithiName(tithiNum), paksha: pakshaOf(tithiNum), endsAt: endOf('tithi', ms) },
    nakshatra: { number: nak + 1, name: NAKSHATRA_NAMES[nak], endsAt: endOf('nakshatra', ms) },
    yoga: { number: yoga + 1, name: YOGA_NAMES[yoga], endsAt: endOf('yoga', ms) },
    karana: { name: karanaName(karana), endsAt: endOf('karana', ms) },
    moonSign: { index: indexAt('moonSign', ms), name: RASI_NAMES[indexAt('moonSign', ms)], endsAt: endOf('moonSign', ms) },
    sunSign: { index: indexAt('sunSign', ms), name: RASI_NAMES[indexAt('sunSign', ms)] },
    tamilMonth: TAMIL_MONTHS[indexAt('sunSign', ms)],
    nextTithi: tithiName(((tithiIdx + 1) % 30) + 1),
    nextNakshatra: NAKSHATRA_NAMES[(nak + 1) % 27]
  };
}

export const tithiNumberAt = (ms) => indexAt('tithi', ms) + 1;
export const moonSignIndexAt = (ms) => indexAt('moonSign', ms);

/** Cheap snapshot (no end-time searches) for scoring many candidate times. */
export function quickAt(ms) {
  return {
    tithi: indexAt('tithi', ms) + 1,
    karana: karanaName(indexAt('karana', ms)),
    yoga: YOGA_NAMES[indexAt('yoga', ms)],
    nakshatra: indexAt('nakshatra', ms)
  };
}
