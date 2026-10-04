/**
 * Nanneram Astronomical & Vedic Timing Engine
 * Implements NOAA Solar Equation for precision Sunrise/Sunset & Vedic Ashtama-bhaga divisions
 */

// Preset global & Indian tech hubs. `timeZone` is an IANA zone; the UTC offset is
// resolved per date so daylight saving is handled correctly.
export const CITIES = [
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, timeZone: 'Asia/Kolkata' },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, timeZone: 'Asia/Kolkata' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, timeZone: 'Asia/Kolkata' },
  { name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090, timeZone: 'Asia/Kolkata' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, timeZone: 'Asia/Kolkata' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, timeZone: 'Asia/Kolkata' },
  { name: 'San Francisco', state: 'USA (Pacific)', lat: 37.7749, lng: -122.4194, timeZone: 'America/Los_Angeles' },
  { name: 'New York', state: 'USA (Eastern)', lat: 40.7128, lng: -74.0060, timeZone: 'America/New_York' },
  { name: 'London', state: 'UK', lat: 51.5074, lng: -0.1278, timeZone: 'Europe/London' },
  { name: 'Dubai', state: 'UAE (GST)', lat: 25.2048, lng: 55.2708, timeZone: 'Asia/Dubai' },
  { name: 'Singapore', state: 'Singapore (SGT)', lat: 1.3521, lng: 103.8198, timeZone: 'Asia/Singapore' },
];

/* ------------------------------------------------------------------ */
/* Time-zone helpers (Intl based, DST aware)                           */
/* ------------------------------------------------------------------ */

const zoneFormatters = new Map();

function getZoneFormatter(timeZone) {
  let formatter = zoneFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    zoneFormatters.set(timeZone, formatter);
  }
  return formatter;
}

function getZonedParts(instantMs, timeZone) {
  const parts = {};
  for (const p of getZoneFormatter(timeZone).formatToParts(new Date(instantMs))) {
    if (p.type !== 'literal') parts[p.type] = parseInt(p.value, 10);
  }
  parts.hour = parts.hour % 24;
  return parts;
}

const pad2 = (n) => n.toString().padStart(2, '0');

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

/**
 * UTC offset (hours) of a time zone on a given calendar date. Sampled at 12:00 UTC,
 * which is after every DST switch for the preset cities and before local sunrise/sunset
 * are affected.
 */
export function getUtcOffsetHours(timeZone, year, month, day) {
  const instant = Date.UTC(year, month - 1, day, 12);
  const p = getZonedParts(instant, timeZone);
  const wallAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (wallAsUtc - instant) / 3600000;
}

export function formatUtcOffset(hours) {
  const sign = hours < 0 ? '-' : '+';
  const abs = Math.abs(hours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${h}${m ? ':' + pad2(m) : ''}`;
}

/** Current wall-clock time in a time zone. `minutes` is minutes since local midnight. */
export function getZonedNow(timeZone, nowMs = Date.now()) {
  const p = getZonedParts(nowMs, timeZone);
  return {
    dateStr: `${p.year}-${pad2(p.month)}-${pad2(p.day)}`,
    hours: p.hour,
    minutes: p.minute,
    seconds: p.second,
    minutesFromMidnight: p.hour * 60 + p.minute + p.second / 60
  };
}

export function getTodayInZone(timeZone) {
  return getZonedNow(timeZone).dateStr;
}

/** Convert "minutes since local midnight on dateStr in timeZone" to a real UTC instant. */
export function zonedMinutesToUtcDate(dateStr, timeZone, minutes) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const offsetMin = getUtcOffsetHours(timeZone, y, m, d) * 60;
  return new Date(Date.UTC(y, m - 1, d, 0, Math.round(minutes - offsetMin)));
}

/* ------------------------------------------------------------------ */
/* Solar calculation                                                   */
/* ------------------------------------------------------------------ */

/**
 * NOAA Solar Calculation to get Sunrise & Sunset in Minutes from Midnight
 */
function getSunTimes(date, lat, lng, tzOffset) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const julianCentury = (julianDay - 2451545.0) / 36525.0;

  // Solar parameters
  const geomMeanLongSun = (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360;
  const geomMeanAnomSun = 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  const eccentEarthOrbit = 0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);

  const sunEqOfCtr = Math.sin(geomMeanAnomSun * rad) * (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury))
    + Math.sin(2 * geomMeanAnomSun * rad) * (0.019993 - 0.000101 * julianCentury)
    + Math.sin(3 * geomMeanAnomSun * rad) * 0.000289;

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr;
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * julianCentury) * rad);
  const meanObliqEcliptic = 23 + (26 + ((21.448 - julianCentury * (46.815 + julianCentury * (0.00059 - julianCentury * 0.001813)))) / 60) / 60;
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos((125.04 - 1934.136 * julianCentury) * rad);

  const sunDeclin = Math.asin(Math.sin(obliqCorr * rad) * Math.sin(sunAppLong * rad)) * deg;
  const varY = Math.tan((obliqCorr / 2) * rad) * Math.tan((obliqCorr / 2) * rad);

  const eqOfTime = 4 * deg * (
    varY * Math.sin(2 * geomMeanLongSun * rad)
    - 2 * eccentEarthOrbit * Math.sin(geomMeanAnomSun * rad)
    + 4 * eccentEarthOrbit * varY * Math.sin(geomMeanAnomSun * rad) * Math.cos(2 * geomMeanLongSun * rad)
    - 0.5 * varY * varY * Math.sin(4 * geomMeanLongSun * rad)
    - 1.25 * eccentEarthOrbit * eccentEarthOrbit * Math.sin(2 * geomMeanAnomSun * rad)
  );

  // Solar zenith for sunrise/sunset (standard 90.8333 deg with atmospheric refraction)
  const zenith = 90.8333;
  const cosHA = (Math.cos(zenith * rad) / (Math.cos(lat * rad) * Math.cos(sunDeclin * rad))) - Math.tan(lat * rad) * Math.tan(sunDeclin * rad);

  let ha = 90;
  if (cosHA >= 1) ha = 0; // polar night
  else if (cosHA <= -1) ha = 180; // polar day
  else ha = Math.acos(cosHA) * deg;

  const solarNoonUTC = (720 - 4 * lng - eqOfTime);
  const sunriseUTC = solarNoonUTC - ha * 4;
  const sunsetUTC = solarNoonUTC + ha * 4;

  const sunriseMin = (sunriseUTC + tzOffset * 60 + 1440) % 1440;
  const sunsetMin = (sunsetUTC + tzOffset * 60 + 1440) % 1440;

  return { sunriseMin, sunsetMin };
}

export function formatTime(minutesFromMidnight) {
  let mins = Math.round(minutesFromMidnight);
  mins = ((mins % 1440) + 1440) % 1440;
  const hours24 = Math.floor(mins / 60);
  const m = mins % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/* ------------------------------------------------------------------ */
/* Horas                                                               */
/* ------------------------------------------------------------------ */

// Chaldean Order of Planetary Horas
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const HORA_METADATA = {
  Mercury: {
    name: 'Mercury Hora (Budha)',
    planet: 'Mercury',
    color: '#00f5ff',
    bg: 'rgba(0, 245, 255, 0.1)',
    badge: 'Deals and negotiations',
    goodFor: ['Closing Sales & Contracts', 'Price Negotiations', 'Commercial Trading', 'Client Pitching', 'Analytics Presentation'],
    avoidFor: ['Emotional conflict talks'],
    scoreBoost: 40,
    rulerMeaning: 'Governs intellect, trade, clear contracts, and persuasive articulation.'
  },
  Jupiter: {
    name: 'Jupiter Hora (Guru)',
    planet: 'Jupiter',
    color: '#ffd700',
    bg: 'rgba(255, 215, 0, 0.1)',
    badge: 'Strategy and advisory',
    goodFor: ['VC & Investor Board Meetings', 'Hiring Key Leadership', 'Legal Agreements', 'Signing Term Sheets', 'Mentorship'],
    avoidFor: ['Aggressive confrontations'],
    scoreBoost: 50,
    rulerMeaning: 'Supreme auspicious planet for wisdom, fair expansion, ethics, and wealth flow.'
  },
  Sun: {
    name: 'Sun Hora (Surya)',
    planet: 'Sun',
    color: '#ff8400',
    bg: 'rgba(255, 132, 0, 0.1)',
    badge: 'Authority and executive pitches',
    goodFor: ['Meeting C-level Executives & VCs', 'Government / Regulatory Filings', 'Public Product Launches', 'Press Releases'],
    avoidFor: ['Submissive discussions'],
    scoreBoost: 35,
    rulerMeaning: 'Governs sovereignty, authority, executive power, and decisive vision.'
  },
  Venus: {
    name: 'Venus Hora (Shukra)',
    planet: 'Venus',
    color: '#ff007f',
    bg: 'rgba(255, 0, 127, 0.1)',
    badge: 'Design, PR and partnerships',
    goodFor: ['Creative & UX Reviews', 'Strategic Alliances', 'PR & Media Interviews', 'Customer Empathy Calls', 'Team Bonding'],
    avoidFor: ['Hard numeric audits'],
    scoreBoost: 30,
    rulerMeaning: 'Governs harmony, beauty, diplomatic rapport, and win-win consensus.'
  },
  Moon: {
    name: 'Moon Hora (Chandra)',
    planet: 'Moon',
    color: '#a5b4fc',
    bg: 'rgba(165, 180, 252, 0.1)',
    badge: 'Brainstorming and check-ins',
    goodFor: ['Casual 1-on-1s', 'Creative Brainstorming', 'Product Ideation', 'Listening Sessions'],
    avoidFor: ['Permanent final decisions'],
    scoreBoost: 15,
    rulerMeaning: 'Governs mental flow, empathy, fluctuating perspectives, and imagination.'
  },
  Mars: {
    name: 'Mars Hora (Mangala)',
    planet: 'Mars',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    badge: 'Caution: friction and ego clashes',
    goodFor: ['Decisive terminations', 'Emergency crisis firefighting', 'Setting hard boundaries'],
    avoidFor: ['Investor pitches', 'Friendly negotiations', 'Salary discussions (causes resentment)'],
    scoreBoost: -40,
    rulerMeaning: 'Aggressive warrior energy. High risk of fiery debate and ego clashes.'
  },
  Saturn: {
    name: 'Saturn Hora (Shani)',
    planet: 'Saturn',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    badge: 'Caution: delays and overruns',
    goodFor: ['Labor audits', 'Long-term structural cleanups', 'Debugging legacy code'],
    avoidFor: ['Fast deal sign-offs (causes meetings to drag without resolution)', 'First impressions'],
    scoreBoost: -35,
    rulerMeaning: 'Governs karmic inertia, heavy delays, skepticism, and meticulous obstacles.'
  }
};

/* ------------------------------------------------------------------ */
/* Gowri Panchangam                                                    */
/* ------------------------------------------------------------------ */

// The five Nalla Neram states are Amirtham, Labham, Danam, Sugam and Uthi.
export const GOWRI_STATES = {
  Amirtham: { name: 'Amirtham', quality: 'Auspicious', rank: 'Best', desc: 'Divine nectar; the most favourable Gowri period', color: '#10b981' },
  Labham: { name: 'Labham', quality: 'Auspicious', rank: 'Gain', desc: 'Financial profit, positive negotiation margins', color: '#10b981' },
  Danam: { name: 'Danam', quality: 'Auspicious', rank: 'Wealth', desc: 'Cash inflow, grant approvals, invoice clears', color: '#10b981' },
  Sugam: { name: 'Sugam', quality: 'Auspicious', rank: 'Good', desc: 'Comfort, peaceful understanding and consensus', color: '#3b82f6' },
  Uthi: { name: 'Uthi', quality: 'Auspicious', rank: 'Good', desc: 'Steady, supportive energy for new beginnings', color: '#3b82f6' },
  Rogam: { name: 'Rogam', quality: 'Inauspicious', rank: 'Evil', desc: 'Fatigue, low energy, audio/video glitches', color: '#ef4444' },
  Soram: { name: 'Soram', quality: 'Inauspicious', rank: 'Bad', desc: 'Hidden motives, fine-print traps, deceit', color: '#ef4444' },
  Visham: { name: 'Visham', quality: 'Inauspicious', rank: 'Bad', desc: 'Friction and obstruction; avoid important starts', color: '#ef4444' }
};

const INAUSPICIOUS_GOWRI = new Set(['Rogam', 'Soram', 'Visham']);

// Weekday Gowri tables (index 0 = Sunday), sunrise->sunset in 8 equal parts.
// Source: published Tamil Gowri Panchangam tables (Drik Panchang; the Saturday
// rows were cross-checked against Prokerala). Saturday night genuinely lists
// Soram twice and no Rogam.
const DAY_GOWRI = [
  ['Uthi', 'Amirtham', 'Rogam', 'Labham', 'Danam', 'Sugam', 'Soram', 'Visham'], // Sun
  ['Amirtham', 'Visham', 'Rogam', 'Labham', 'Danam', 'Sugam', 'Soram', 'Uthi'], // Mon
  ['Rogam', 'Labham', 'Danam', 'Sugam', 'Soram', 'Uthi', 'Visham', 'Amirtham'], // Tue
  ['Labham', 'Danam', 'Sugam', 'Soram', 'Visham', 'Uthi', 'Amirtham', 'Rogam'], // Wed
  ['Danam', 'Sugam', 'Soram', 'Uthi', 'Amirtham', 'Visham', 'Rogam', 'Labham'], // Thu
  ['Sugam', 'Soram', 'Uthi', 'Visham', 'Amirtham', 'Rogam', 'Labham', 'Danam'], // Fri
  ['Soram', 'Uthi', 'Visham', 'Amirtham', 'Rogam', 'Labham', 'Danam', 'Sugam']  // Sat
];

// Night tables: sunset -> next sunrise in 8 equal parts, for the same Vedic weekday.
const NIGHT_GOWRI = [
  ['Danam', 'Sugam', 'Soram', 'Visham', 'Uthi', 'Amirtham', 'Rogam', 'Labham'], // Sun
  ['Sugam', 'Soram', 'Uthi', 'Amirtham', 'Visham', 'Rogam', 'Labham', 'Danam'], // Mon
  ['Soram', 'Uthi', 'Visham', 'Amirtham', 'Rogam', 'Labham', 'Danam', 'Sugam'], // Tue
  ['Uthi', 'Amirtham', 'Rogam', 'Labham', 'Danam', 'Sugam', 'Soram', 'Visham'], // Wed
  ['Amirtham', 'Visham', 'Rogam', 'Labham', 'Danam', 'Sugam', 'Soram', 'Uthi'], // Thu
  ['Rogam', 'Labham', 'Danam', 'Sugam', 'Soram', 'Uthi', 'Visham', 'Amirtham'], // Fri
  ['Labham', 'Danam', 'Sugam', 'Soram', 'Uthi', 'Visham', 'Amirtham', 'Soram']  // Sat
];

function buildGowriSlots(names, start, partDuration, isNight) {
  return names.map((state, i) => ({
    part: i + 1,
    state,
    start: start + i * partDuration,
    end: start + (i + 1) * partDuration,
    isNight,
    ...GOWRI_STATES[state]
  }));
}

/** Merge back-to-back Nalla Neram (auspicious) Gowri parts into single windows. */
function buildNallaNeramWindows(slots) {
  const windows = [];
  for (const slot of slots) {
    if (slot.quality !== 'Auspicious') continue;
    const last = windows[windows.length - 1];
    if (last && Math.abs(last.end - slot.start) < 0.001) {
      last.end = slot.end;
      last.states.push(slot.state);
    } else {
      windows.push({ start: slot.start, end: slot.end, states: [slot.state] });
    }
  }
  return windows;
}

/* ------------------------------------------------------------------ */
/* Full calculation of a Vedic day (sunrise -> next sunrise)           */
/* ------------------------------------------------------------------ */

export function calculateVedicDay(targetDate, city) {
  const date = new Date(targetDate);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const utcOffsetHours = getUtcOffsetHours(city.timeZone, date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { sunriseMin, sunsetMin } = getSunTimes(date, city.lat, city.lng, utcOffsetHours);

  // The Vedic day runs sunrise -> next sunrise, so the night needs tomorrow's dawn.
  // Times are wall-clock minutes; on a DST switch night the real duration is +-1h.
  const nextDate = addDays(date, 1);
  const nextOffset = getUtcOffsetHours(city.timeZone, nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate());
  const nextSunrise = getSunTimes(nextDate, city.lat, city.lng, nextOffset).sunriseMin;
  const nextSunriseMin = nextSunrise + 1440;

  const dinamana = sunsetMin > sunriseMin ? (sunsetMin - sunriseMin) : (sunsetMin + 1440 - sunriseMin);
  const ratrimana = nextSunriseMin - sunsetMin;
  const partDuration = dinamana / 8;
  const nightPartDuration = ratrimana / 8;

  // Rahu Kaalam Part indices (1-based: Sunday=8, Monday=2, Tuesday=7, Wed=5, Thu=6, Fri=4, Sat=3)
  const rahuParts = [8, 2, 7, 5, 6, 4, 3];
  const rahuIndex = rahuParts[dayOfWeek] - 1;
  const rahuStart = sunriseMin + rahuIndex * partDuration;
  const rahuEnd = rahuStart + partDuration;

  // Yamagandam Parts (Sun=5, Mon=4, Tue=3, Wed=2, Thu=1, Fri=7, Sat=6)
  const yamaParts = [5, 4, 3, 2, 1, 7, 6];
  const yamaIndex = yamaParts[dayOfWeek] - 1;
  const yamaStart = sunriseMin + yamaIndex * partDuration;
  const yamaEnd = yamaStart + partDuration;

  // Gulika Kaalam Parts (Sun=7, Mon=6, Tue=5, Wed=4, Thu=3, Fri=2, Sat=1)
  const gulikaParts = [7, 6, 5, 4, 3, 2, 1];
  const gulikaIndex = gulikaParts[dayOfWeek] - 1;
  const gulikaStart = sunriseMin + gulikaIndex * partDuration;
  const gulikaEnd = gulikaStart + partDuration;

  // 12 daytime Horas (Dinamana / 12) followed by 12 night Horas (Ratrimana / 12).
  // The Chaldean sequence simply continues through the night.
  const dayHoraDuration = dinamana / 12;
  const nightHoraDuration = ratrimana / 12;
  const dayLord = WEEKDAY_LORDS[dayOfWeek];
  const startLordIndex = CHALDEAN_ORDER.indexOf(dayLord);

  const horas = [];
  const nightHoras = [];
  for (let i = 0; i < 24; i++) {
    const isNight = i >= 12;
    const horaLord = CHALDEAN_ORDER[(startLordIndex + i) % 7];
    const hStart = isNight ? sunsetMin + (i - 12) * nightHoraDuration : sunriseMin + i * dayHoraDuration;
    const hEnd = hStart + (isNight ? nightHoraDuration : dayHoraDuration);
    (isNight ? nightHoras : horas).push({
      index: i + 1,
      lord: horaLord,
      start: hStart,
      end: hEnd,
      isNight,
      ...HORA_METADATA[horaLord]
    });
  }

  // Gowri Panchangam: 8 day parts and 8 night parts
  const gowriSlots = buildGowriSlots(DAY_GOWRI[dayOfWeek], sunriseMin, partDuration, false);
  const nightGowriSlots = buildGowriSlots(NIGHT_GOWRI[dayOfWeek], sunsetMin, nightPartDuration, true);

  // Nalla Neram = the auspicious Gowri periods (Amirtham, Labham, Danam, Sugam, Uthi)
  const nallaNeramDay = buildNallaNeramWindows(gowriSlots);
  const nallaNeramNight = buildNallaNeramWindows(nightGowriSlots);

  return {
    date,
    city,
    dayOfWeek,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    utcOffsetHours,
    sunriseMin,
    sunsetMin,
    nextSunriseMin,
    dinamana,
    ratrimana,
    partDuration,
    rahuKaalam: { start: rahuStart, end: rahuEnd, title: 'Rahu Kaalam' },
    yamagandam: { start: yamaStart, end: yamaEnd, title: 'Yamagandam' },
    gulikaKaalam: { start: gulikaStart, end: gulikaEnd, title: 'Gulika Kaalam' },
    horas,
    nightHoras,
    allHoras: [...horas, ...nightHoras],
    gowriSlots,
    nightGowriSlots,
    allGowriSlots: [...gowriSlots, ...nightGowriSlots],
    nallaNeramDay,
    nallaNeramNight
  };
}

/**
 * The Hora that is running right now in a city. Before local sunrise the Vedic day
 * is still the previous calendar day, so that day's night Horas are used.
 */
export function getLiveHora(city, nowMs = Date.now()) {
  const now = getZonedNow(city.timeZone, nowMs);
  const today = parseLocalDate(now.dateStr);
  let day = calculateVedicDay(today, city);
  let minutes = now.minutesFromMidnight;

  if (minutes < day.sunriseMin) {
    day = calculateVedicDay(addDays(today, -1), city);
    minutes += 1440;
  }

  const hora = day.allHoras.find(h => minutes >= h.start && minutes < h.end) || day.allHoras[0];
  const gowri = day.allGowriSlots.find(g => minutes >= g.start && minutes < g.end) || day.allGowriSlots[0];
  return { hora, gowri, day, minutes };
}

/* ------------------------------------------------------------------ */
/* Meeting slot finder                                                 */
/* ------------------------------------------------------------------ */

// Business hours scanned for meeting slots (minutes from local midnight)
const BUSINESS_START = 9 * 60;
const BUSINESS_END = 19 * 60;

/**
 * Intelligent Meeting Slot Finder
 * Finds optimal Google Meet / Zoom window for high-stakes business goals
 */
export function findOptimalMeetingSlots(vedicDay, purpose, durationMins = 30) {
  const { sunriseMin, rahuKaalam, yamagandam, allHoras, allGowriSlots } = vedicDay;
  const candidates = [];
  const lower = purpose.toLowerCase();

  // Determine preferred Horas and priority title based on scenario/purpose
  let preferredHoras = ['Mercury', 'Jupiter', 'Sun'];
  let priorityTitle = 'Strategic Timing & Alignment';
  let scenarioType = 'general';

  const isCrushOrPartner = lower.includes('crush') || lower.includes('girlfriend') || lower.includes('boyfriend') || lower.includes('her') || lower.includes('his') || lower.includes('partner') || lower.includes('in-law');
  const isParentFigure = lower.includes('dad') || lower.includes('father') || lower.includes('mom') || lower.includes('mother') || lower.includes('parent') || lower.includes('family');

  if ((lower.includes('crush') && isParentFigure) || (isCrushOrPartner && isParentFigure) || lower.includes('meet the parents')) {
    preferredHoras = ['Sun', 'Jupiter', 'Mercury'];
    priorityTitle = "Meeting Partner's / Crush's Parents";
    scenarioType = 'crush_parents';
  } else if (lower.includes('crush') || lower.includes('rizz') || lower.includes('dating') || lower.includes('first date') || lower.includes('dm') || lower.includes('flirt')) {
    preferredHoras = ['Venus', 'Mercury'];
    priorityTitle = 'Crush DM & Rizz Alignment';
    scenarioType = 'crush_rizz';
  } else if (lower.includes('parent') || lower.includes('mom') || lower.includes('dad') || lower.includes('curfew') || lower.includes('allowance') || lower.includes('permission')) {
    preferredHoras = ['Jupiter', 'Sun'];
    priorityTitle = 'Parent Permission & Negotiation';
    scenarioType = 'parent_permission';
  } else if (lower.includes('exam') || lower.includes('study') || lower.includes('cram') || lower.includes('homework') || lower.includes('assignment') || lower.includes('revision') || lower.includes('test')) {
    preferredHoras = ['Mercury', 'Jupiter', 'Saturn'];
    priorityTitle = 'Deep Study & Focus Sprint';
    scenarioType = 'study';
  } else if (lower.includes('game') || lower.includes('gaming') || lower.includes('ranked') || lower.includes('clutch') || lower.includes('valorant') || lower.includes('bgmi') || lower.includes('cs2')) {
    preferredHoras = ['Mars', 'Sun'];
    priorityTitle = 'Ranked Clutch & Kinetic Reflex';
    scenarioType = 'gaming';
  } else if (lower.includes('teacher') || lower.includes('professor') || lower.includes('grade') || lower.includes('dean') || lower.includes('principal') || lower.includes('marks')) {
    preferredHoras = ['Jupiter', 'Mercury'];
    priorityTitle = 'Academic Authority & Faculty Sync';
    scenarioType = 'teacher';
  } else if (lower.includes('friend') || lower.includes('beef') || lower.includes('drama') || lower.includes('apolog') || lower.includes('argument')) {
    preferredHoras = ['Moon', 'Mercury'];
    priorityTitle = 'Friendship Sync & De-escalation';
    scenarioType = 'friend';
  } else if (lower.includes('pitch') || lower.includes('investor') || lower.includes('vc') || lower.includes('seed')) {
    preferredHoras = ['Jupiter', 'Sun', 'Mercury'];
    priorityTitle = 'VC Pitching & Term Sheets';
    scenarioType = 'pitch';
  } else if (lower.includes('salary') || lower.includes('raise') || lower.includes('compensation') || lower.includes('appraisal')) {
    preferredHoras = ['Mercury', 'Jupiter'];
    priorityTitle = 'Salary & Financial Negotiation';
    scenarioType = 'salary';
  } else if (lower.includes('contract') || lower.includes('deal') || lower.includes('client') || lower.includes('closing') || lower.includes('sign')) {
    preferredHoras = ['Mercury', 'Jupiter'];
    priorityTitle = 'Client Closing & Deal Sign-off';
    scenarioType = 'deal';
  } else if (lower.includes('interview') || lower.includes('hiring') || lower.includes('job') || lower.includes('placement')) {
    preferredHoras = ['Sun', 'Jupiter', 'Mercury'];
    priorityTitle = 'Interview & Executive Assessment';
    scenarioType = 'interview';
  } else if (lower.includes('design') || lower.includes('creative') || lower.includes('partner') || lower.includes('brand')) {
    preferredHoras = ['Venus', 'Mercury'];
    priorityTitle = 'Creative Alignment & Partnerships';
    scenarioType = 'creative';
  }

  // Scan business hours (never before local sunrise). Evening slots fall in the
  // night Horas / night Gowri, which are part of the same Vedic day.
  const dayStart = Math.max(BUSINESS_START, Math.ceil(sunriseMin));
  const dayEnd = BUSINESS_END;

  for (let time = dayStart; time <= dayEnd - durationMins; time += 15) {
    const slotStart = time;
    const slotEnd = time + durationMins;

    // Rahu Kaalam is a strict blocker; Yamagandam is avoided
    const overlapsRahu = Math.max(slotStart, rahuKaalam.start) < Math.min(slotEnd, rahuKaalam.end);
    if (overlapsRahu) continue;
    const overlapsYama = Math.max(slotStart, yamagandam.start) < Math.min(slotEnd, yamagandam.end);
    if (overlapsYama) continue;

    const currentHora = allHoras.find(h => slotStart >= h.start && slotStart < h.end);
    const currentGowri = allGowriSlots.find(g => slotStart >= g.start && slotStart < g.end);
    if (!currentHora || !currentGowri) continue;

    // Skip inauspicious Gowri
    if (INAUSPICIOUS_GOWRI.has(currentGowri.state)) continue;

    // Scoring
    let score = 50;
    if (preferredHoras.includes(currentHora.lord)) {
      score += currentHora.lord === preferredHoras[0] ? 40 : 25;
    }
    if (currentGowri.state === 'Amirtham') score += 30;
    if (currentGowri.state === 'Labham') score += 25;
    if (currentGowri.state === 'Sugam' || currentGowri.state === 'Danam' || currentGowri.state === 'Uthi') score += 20;

    // Proximity buffer before energy changes
    const minsToHoraEnd = currentHora.end - slotEnd;
    if (minsToHoraEnd < 5) score -= 15; // too close to boundary

    // Slot runs into an inauspicious Gowri part
    const spillsIntoBadGowri = allGowriSlots.some(
      g => INAUSPICIOUS_GOWRI.has(g.state) && g.start < slotEnd && g.end > slotStart
    );
    if (spillsIntoBadGowri) score -= 20;

    let recommendation = `Optimal alignment with ${currentHora.name} & ${currentGowri.name}. Plan your key sync between ${formatTime(slotStart + 5)} and ${formatTime(slotEnd - 5)}.`;
    if (scenarioType === 'crush_parents') {
      recommendation = `Optimal solar dignity with ${currentHora.name} & ${currentGowri.name}. Make your respectful approach between ${formatTime(slotStart + 5)} and ${formatTime(slotEnd - 5)}.`;
    } else if (scenarioType === 'crush_rizz') {
      recommendation = `Peak charm & witty magnetism with ${currentHora.name} & ${currentGowri.name}. Drop your text or make your move between ${formatTime(slotStart + 5)} and ${formatTime(slotEnd - 5)}.`;
    } else if (scenarioType === 'parent_permission') {
      recommendation = `Benevolent alignment with ${currentHora.name} & ${currentGowri.name}. Present your request between ${formatTime(slotStart + 5)} and ${formatTime(slotEnd - 5)}.`;
    } else if (scenarioType === 'study') {
      recommendation = `Peak synaptic focus window with ${currentHora.name} & ${currentGowri.name}. Run your focus sprint between ${formatTime(slotStart + 5)} and ${formatTime(slotEnd - 5)}.`;
    } else if (scenarioType === 'gaming') {
      recommendation = `Peak kinetic reaction speed and clutch composure with ${currentHora.name} & ${currentGowri.name}. Queue up between ${formatTime(slotStart + 5)} and ${formatTime(slotEnd - 5)}.`;
    }

    candidates.push({
      startMin: slotStart,
      endMin: slotEnd,
      startTimeFormatted: formatTime(slotStart),
      endTimeFormatted: formatTime(slotEnd),
      gracefulExitWindow: `${formatTime(slotEnd - 5)} – ${formatTime(slotEnd)}`,
      hora: currentHora,
      gowri: currentGowri,
      score,
      priorityTitle,
      recommendation
    });
  }

  // Sort descending by score (earlier slot wins ties)
  candidates.sort((a, b) => b.score - a.score || a.startMin - b.startMin);

  // Pick top 3 spaced out recommendations
  const topSlots = [];
  for (const cand of candidates) {
    const overlaps = topSlots.some(s => Math.abs(s.startMin - cand.startMin) < 45);
    if (!overlaps) {
      topSlots.push(cand);
    }
    if (topSlots.length >= 3) break;
  }

  return topSlots;
}
