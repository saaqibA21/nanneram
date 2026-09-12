/**
 * Nanneram Astronomical & Vedic Timing Engine
 * Implements NOAA Solar Equation for precision Sunrise/Sunset & Vedic Ashtama-bhaga divisions
 */

// Preset global & Indian tech hubs
export const CITIES = [
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, tz: 5.5 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090, tz: 5.5 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, tz: 5.5 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, tz: 5.5 },
  { name: 'San Francisco', state: 'USA (PST)', lat: 37.7749, lng: -122.4194, tz: -7.0 },
  { name: 'New York', state: 'USA (EST)', lat: 40.7128, lng: -74.0060, tz: -4.0 },
  { name: 'London', state: 'UK (GMT/BST)', lat: 51.5074, lng: -0.1278, tz: 1.0 },
  { name: 'Dubai', state: 'UAE (GST)', lat: 25.2048, lng: 55.2708, tz: 4.0 },
  { name: 'Singapore', state: 'Singapore (SGT)', lat: 1.3521, lng: 103.8198, tz: 8.0 },
];

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
  mins = (mins + 1440) % 1440;
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

// Chaldean Order of Planetary Horas
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const HORA_METADATA = {
  Mercury: {
    name: 'Mercury Hora (புதன்)',
    planet: 'Mercury',
    color: '#00f5ff',
    bg: 'rgba(0, 245, 255, 0.1)',
    badge: 'Deal Closer & Negotiations',
    goodFor: ['Closing Sales & Contracts', 'Price Negotiations', 'Commercial Trading', 'Client Pitching', 'Analytics Presentation'],
    avoidFor: ['Emotional conflict talks'],
    scoreBoost: 40,
    rulerMeaning: 'Governs intellect, trade, clear contracts, and persuasive articulation.'
  },
  Jupiter: {
    name: 'Jupiter Hora (குரு)',
    planet: 'Jupiter',
    color: '#ffd700',
    bg: 'rgba(255, 215, 0, 0.1)',
    badge: 'High-Level Strategy & Advisory',
    goodFor: ['VC & Investor Board Meetings', 'Hiring Key Leadership', 'Legal Agreements', 'Signing Term Sheets', 'Mentorship'],
    avoidFor: ['Aggressive confrontations'],
    scoreBoost: 50,
    rulerMeaning: 'Supreme auspicious planet for wisdom, fair expansion, ethics, and wealth flow.'
  },
  Sun: {
    name: 'Sun Hora (சூரியன்)',
    planet: 'Sun',
    color: '#ff8400',
    bg: 'rgba(255, 132, 0, 0.1)',
    badge: 'Authority & Executive Pitching',
    goodFor: ['Meeting C-level Executives & VCs', 'Government / Regulatory Filings', 'Public Product Launches', 'Press Releases'],
    avoidFor: ['Submissive discussions'],
    scoreBoost: 35,
    rulerMeaning: 'Governs sovereignty, authority, executive power, and decisive vision.'
  },
  Venus: {
    name: 'Venus Hora (சுக்கிரன்)',
    planet: 'Venus',
    color: '#ff007f',
    bg: 'rgba(255, 0, 127, 0.1)',
    badge: 'Design, PR & Partnerships',
    goodFor: ['Creative & UX Reviews', 'Strategic Alliances', 'PR & Media Interviews', 'Customer Empathy Calls', 'Team Bonding'],
    avoidFor: ['Hard numeric audits'],
    scoreBoost: 30,
    rulerMeaning: 'Governs harmony, beauty, diplomatic rapport, and win-win consensus.'
  },
  Moon: {
    name: 'Moon Hora (சந்திரன்)',
    planet: 'Moon',
    color: '#a5b4fc',
    bg: 'rgba(165, 180, 252, 0.1)',
    badge: 'Brainstorming & Syncs',
    goodFor: ['Casual 1-on-1s', 'Creative Brainstorming', 'Product Ideation', 'Listening Sessions'],
    avoidFor: ['Permanent final decisions'],
    scoreBoost: 15,
    rulerMeaning: 'Governs mental flow, empathy, fluctuating perspectives, and imagination.'
  },
  Mars: {
    name: 'Mars Hora (செவ்வாய்)',
    planet: 'Mars',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    badge: '🔴 Caution: Friction & Ego Clashes',
    goodFor: ['Decisive terminations', 'Emergency crisis firefighting', 'Setting hard boundaries'],
    avoidFor: ['Investor pitches', 'Friendly negotiations', 'Salary discussions (causes resentment)'],
    scoreBoost: -40,
    rulerMeaning: 'Aggressive warrior energy. High risk of fiery debate and ego clashes.'
  },
  Saturn: {
    name: 'Saturn Hora (சனி)',
    planet: 'Saturn',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    badge: '🔴 Caution: Delays & Overruns',
    goodFor: ['Labor audits', 'Long-term structural cleanups', 'Debugging legacy code'],
    avoidFor: ['Fast deal sign-offs (causes meetings to drag without resolution)', 'First impressions'],
    scoreBoost: -35,
    rulerMeaning: 'Governs karmic inertia, heavy delays, skepticism, and meticulous obstacles.'
  }
};

// Gowri Panchangam States
export const GOWRI_STATES = {
  Amirtham: { name: 'Amirtham (அமிர்தம்)', quality: 'Auspicious', desc: 'Supreme divine nectar; deal sign-off guaranteed', color: '#10b981' },
  Labham: { name: 'Labham (லாபம்)', quality: 'Auspicious', desc: 'Financial profit, positive negotiation margins', color: '#10b981' },
  Sugam: { name: 'Sugam / Uthi (சுகம்)', quality: 'Auspicious', desc: 'Comfort, peaceful understanding and consensus', color: '#3b82f6' },
  Danam: { name: 'Danam (தனம்)', quality: 'Auspicious', desc: 'Cash inflow, grant approvals, invoice clears', color: '#10b981' },
  Shubham: { name: 'Shubham (சுபம்)', quality: 'Auspicious', desc: 'General auspicious harmony', color: '#3b82f6' },
  Rogam: { name: 'Rogam (ரோகம்)', quality: 'Inauspicious', desc: 'Fatigue, low energy, audio/video glitches', color: '#ef4444' },
  Soram: { name: 'Soram (சோரம்)', quality: 'Inauspicious', desc: 'Hidden motives, fine-print traps, deceit', color: '#ef4444' },
  Visham: { name: 'Visham (விஷம்)', quality: 'Inauspicious', desc: 'Toxic friction, complete deal collapse', color: '#ef4444' }
};

// Day Gowri table per weekday (8 parts of day)
const DAY_GOWRI = [
  // Sun
  ['Sugam', 'Visham', 'Labham', 'Soram', 'Danam', 'Amirtham', 'Rogam', 'Shubham'],
  // Mon
  ['Amirtham', 'Rogam', 'Shubham', 'Sugam', 'Visham', 'Labham', 'Soram', 'Danam'],
  // Tue
  ['Danam', 'Amirtham', 'Rogam', 'Shubham', 'Sugam', 'Visham', 'Labham', 'Soram'],
  // Wed
  ['Soram', 'Danam', 'Amirtham', 'Rogam', 'Shubham', 'Sugam', 'Visham', 'Labham'],
  // Thu
  ['Labham', 'Soram', 'Danam', 'Amirtham', 'Rogam', 'Shubham', 'Sugam', 'Visham'],
  // Fri
  ['Visham', 'Labham', 'Soram', 'Danam', 'Amirtham', 'Rogam', 'Shubham', 'Sugam'],
  // Sat
  ['Rogam', 'Shubham', 'Sugam', 'Visham', 'Labham', 'Soram', 'Danam', 'Amirtham']
];

/**
 * Full calculation of Vedic Day & Intervals
 */
export function calculateVedicDay(targetDate, city) {
  const date = new Date(targetDate);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const { sunriseMin, sunsetMin } = getSunTimes(date, city.lat, city.lng, city.tz);

  const dinamana = sunsetMin > sunriseMin ? (sunsetMin - sunriseMin) : (sunsetMin + 1440 - sunriseMin);
  const partDuration = dinamana / 8;

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

  // 12 Horas of Daytime (Dinamana / 12)
  const dayHoraDuration = dinamana / 12;
  const dayLord = WEEKDAY_LORDS[dayOfWeek];
  const startLordIndex = CHALDEAN_ORDER.indexOf(dayLord);

  const horas = [];
  for (let i = 0; i < 12; i++) {
    const horaLord = CHALDEAN_ORDER[(startLordIndex + i) % 7];
    const hStart = sunriseMin + i * dayHoraDuration;
    const hEnd = hStart + dayHoraDuration;
    horas.push({
      index: i + 1,
      lord: horaLord,
      start: hStart,
      end: hEnd,
      ...HORA_METADATA[horaLord]
    });
  }

  // Gowri Panchangam Daytime slots (8 equal slots)
  const gowriSlots = [];
  const gowriList = DAY_GOWRI[dayOfWeek];
  for (let i = 0; i < 8; i++) {
    const gStart = sunriseMin + i * partDuration;
    const gEnd = gStart + partDuration;
    const stateKey = gowriList[i];
    gowriSlots.push({
      part: i + 1,
      state: stateKey,
      start: gStart,
      end: gEnd,
      ...GOWRI_STATES[stateKey]
    });
  }

  // Identify Top Auspicious Windows (Nalla Neram)
  // Traditional Tamil Nalla Neram Morning & Evening
  const nallaNeramMorning = {
    start: sunriseMin + partDuration * 1.5,
    end: sunriseMin + partDuration * 2.5,
    label: 'Morning Nalla Neram (கால நேரம்)'
  };
  const nallaNeramEvening = {
    start: sunriseMin + partDuration * 6.5,
    end: sunriseMin + partDuration * 7.5,
    label: 'Evening Nalla Neram (மாலை நேரம்)'
  };

  return {
    date,
    city,
    dayOfWeek,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    sunriseMin,
    sunsetMin,
    dinamana,
    partDuration,
    rahuKaalam: { start: rahuStart, end: rahuEnd, title: 'Rahu Kaalam (ராகு காலம்)' },
    yamagandam: { start: yamaStart, end: yamaEnd, title: 'Yamagandam (எமகண்டம்)' },
    gulikaKaalam: { start: gulikaStart, end: gulikaEnd, title: 'Gulika Kaalam (குளிகை காலம்)' },
    horas,
    gowriSlots,
    nallaNeramMorning,
    nallaNeramEvening
  };
}

/**
 * Intelligent Meeting Slot Finder
 * Finds optimal Google Meet / Zoom window for high-stakes business goals
 */
export function findOptimalMeetingSlots(vedicDay, purpose, durationMins = 30) {
  const { sunriseMin, sunsetMin, rahuKaalam, yamagandam, horas, gowriSlots } = vedicDay;
  const candidates = [];

  // Determine preferred Horas based on meeting purpose
  let preferredHoras = ['Mercury', 'Jupiter'];
  let priorityTitle = 'Sales & Strategic Deals';

  if (purpose.toLowerCase().includes('pitch') || purpose.toLowerCase().includes('investor') || purpose.toLowerCase().includes('vc')) {
    preferredHoras = ['Jupiter', 'Sun', 'Mercury'];
    priorityTitle = 'VC Pitching & Term Sheets';
  } else if (purpose.toLowerCase().includes('salary') || purpose.toLowerCase().includes('raise') || purpose.toLowerCase().includes('contract') || purpose.toLowerCase().includes('sign')) {
    preferredHoras = ['Mercury', 'Jupiter'];
    priorityTitle = 'Financial Gain & Contract Closing';
  } else if (purpose.toLowerCase().includes('design') || purpose.toLowerCase().includes('creative') || purpose.toLowerCase().includes('partner')) {
    preferredHoras = ['Venus', 'Mercury'];
    priorityTitle = 'Creative Alignment & Partnerships';
  } else if (purpose.toLowerCase().includes('interview') || purpose.toLowerCase().includes('hiring')) {
    preferredHoras = ['Jupiter', 'Sun'];
    priorityTitle = 'Executive Hiring & Assessment';
  }

  // Scan business day: from 09:00 AM (540 mins) to 06:30 PM (1110 mins)
  const dayStart = Math.max(540, sunriseMin + 30);
  const dayEnd = Math.min(1140, sunsetMin - 15);

  for (let time = dayStart; time <= dayEnd - durationMins; time += 15) {
    const slotStart = time;
    const slotEnd = time + durationMins;

    // Check collision with Rahu Kaalam (Strict Blocker)
    const overlapsRahu = Math.max(slotStart, rahuKaalam.start) < Math.min(slotEnd, rahuKaalam.end);
    if (overlapsRahu) continue;

    // Check collision with Yamagandam (Avoid)
    const overlapsYama = Math.max(slotStart, yamagandam.start) < Math.min(slotEnd, yamagandam.end);
    if (overlapsYama) continue;

    // Find active Hora
    const currentHora = horas.find(h => slotStart >= h.start && slotStart < h.end) || horas[0];

    // Find active Gowri
    const currentGowri = gowriSlots.find(g => slotStart >= g.start && slotStart < g.end) || gowriSlots[0];

    // Skip inauspicious Gowri
    if (currentGowri.state === 'Visham' || currentGowri.state === 'Rogam' || currentGowri.state === 'Soram') {
      continue;
    }

    // Scoring
    let score = 50;
    if (preferredHoras.includes(currentHora.lord)) {
      score += currentHora.lord === preferredHoras[0] ? 40 : 25;
    }
    if (currentGowri.state === 'Amirtham') score += 30;
    if (currentGowri.state === 'Labham') score += 25;
    if (currentGowri.state === 'Sugam' || currentGowri.state === 'Danam') score += 20;

    // Proximity buffer before energy changes
    const minsToHoraEnd = currentHora.end - slotEnd;
    if (minsToHoraEnd < 5) score -= 15; // too close to boundary

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
      recommendation: `Optimal alignment with ${currentHora.name} & ${currentGowri.name}. Plan strategic ask between ${formatTime(slotStart + 5)} and ${formatTime(slotEnd - 5)}.`
    });
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

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
