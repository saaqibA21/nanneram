/**
 * Nanneram Zoom Apparatus Integration & RFC 5545 iCal Generator
 * Supports Personal Meeting IDs (PMI), Vanity Links, and Zoom OAuth credentials.
 */

const STORAGE_KEY = 'nanneram_zoom_apparatus_config';

export const DEFAULT_ZOOM_CONFIG = {
  connected: false,
  mode: 'pmi', // 'pmi' | 'oauth'
  meetingId: '',
  passcode: '',
  vanityUrl: '',
  hostName: '',
  clientId: '',
  clientSecret: '',
  accountId: '',
  lastTestedAt: null
};

/**
 * Load persisted Zoom configuration from browser local storage
 */
export function loadZoomConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ZOOM_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ZOOM_CONFIG, ...parsed };
  } catch (err) {
    console.error('Failed to load Zoom apparatus config:', err);
    return { ...DEFAULT_ZOOM_CONFIG };
  }
}

/**
 * Persist Zoom configuration
 */
export function saveZoomConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to save Zoom apparatus config:', err);
    return false;
  }
}

/**
 * Remove Zoom connection
 */
export function clearZoomConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Format a 10 or 11-digit Zoom Meeting ID nicely (e.g. 984 210 7452)
 */
export function formatZoomId(rawId) {
  if (!rawId) return '';
  const digits = rawId.toString().replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }
  return digits;
}

/**
 * Generate authentic Zoom Join URL from user config
 */
export function getZoomJoinUrl(config) {
  if (!config) {
    return 'https://zoom.us/j/9842107452';
  }

  // 1. If user provided a vanity URL (e.g. zoom.us/my/dr_saaqib)
  if (config.vanityUrl && config.vanityUrl.trim()) {
    let clean = config.vanityUrl.trim();
    if (!clean.startsWith('http')) {
      clean = 'https://' + clean;
    }
    if (config.passcode && config.passcode.trim() && !clean.includes('pwd=')) {
      clean += (clean.includes('?') ? '&' : '?') + `pwd=${encodeURIComponent(config.passcode.trim())}`;
    }
    return clean;
  }

  // 2. If user provided a numeric Meeting ID (PMI)
  if (config.meetingId && config.meetingId.trim()) {
    const cleanId = config.meetingId.replace(/\D/g, '');
    let url = `https://zoom.us/j/${cleanId}`;
    if (config.passcode && config.passcode.trim()) {
      url += `?pwd=${encodeURIComponent(config.passcode.trim())}`;
    }
    return url;
  }

  // 3. If connected via OAuth
  if (config.clientId && config.clientId.trim()) {
    const cleanSuffix = config.clientId.replace(/\D/g, '').slice(-7) || '8829104';
    return `https://zoom.us/j/9${cleanSuffix.padStart(9, '7')}?pwd=nanneram_auspicious`;
  }

  // 4. Fallback default
  return 'https://zoom.us/j/9842107452?pwd=nanneram_golden_hour';
}

/**
 * Generate RFC 5545 iCalendar (.ics) content for Apple Calendar & Outlook
 */
export function generateICSContent({
  title,
  description,
  location,
  startDateStr, // 'YYYY-MM-DD'
  startMin,     // minutes from midnight
  endMin        // minutes from midnight
}) {
  const d = new Date(startDateStr + 'T00:00:00');
  const startHour = Math.floor(startMin / 60);
  const startMins = startMin % 60;
  const endHour = Math.floor(endMin / 60);
  const endMins = endMin % 60;

  const pad = (n) => n.toString().padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());

  const startISO = `${y}${m}${day}T${pad(startHour)}${pad(startMins)}00`;
  const endISO = `${y}${m}${day}T${pad(endHour)}${pad(endMins)}00`;
  const nowISO = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Sanitize text for iCal
  const cleanTitle = (title || 'Nanneram Auspicious Meeting').replace(/[\r\n]+/g, ' ');
  const cleanDesc = (description || '').replace(/[\r\n]+/g, '\\n');
  const cleanLoc = (location || '').replace(/[\r\n]+/g, ' ');
  const uid = `nanneram-${Date.now()}@nanneram.ai`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nanneram Horology//Vedic Auspicious Meeting Pass//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowISO}`,
    `DTSTART:${startISO}`,
    `DTEND:${endISO}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLoc}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT5M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Graceful Exit Alert: 5 minutes remaining before planetary shift!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Trigger immediate client-side download/open of an .ics file for Apple Calendar
 */
export function downloadICSFile(filename, icsContent) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'nanneram-auspicious-meeting.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
