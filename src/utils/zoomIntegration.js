/**
 * Nanneram Zoom room helper & RFC 5545 iCal generator.
 *
 * There is no backend, so Nanneram never talks to the Zoom API. It only embeds the
 * personal room (PMI or vanity link) the user types in, and keeps it in this browser.
 */

const STORAGE_KEY = 'nanneram_zoom_apparatus_config';

export const DEFAULT_ZOOM_CONFIG = {
  connected: false,
  meetingId: '',
  passcode: '',
  vanityUrl: '',
  hostName: '',
  lastTestedAt: null
};

// Keys written by the earlier fake OAuth flow. They must never stay in localStorage.
const LEGACY_KEYS = ['clientId', 'clientSecret', 'accountId', 'authCode', 'mode'];

/**
 * Load persisted Zoom room from browser local storage. Legacy OAuth fields
 * (including any saved client secret) are scrubbed from storage on the way in.
 */
export function loadZoomConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ZOOM_CONFIG };
    const parsed = JSON.parse(raw);

    const hadLegacy = LEGACY_KEYS.some((key) => key in parsed);
    const config = { ...DEFAULT_ZOOM_CONFIG };
    for (const key of Object.keys(DEFAULT_ZOOM_CONFIG)) {
      if (key in parsed) config[key] = parsed[key];
    }

    // The old OAuth flow marked users "connected" without any room saved.
    if (!getZoomJoinUrl(config)) config.connected = false;
    if (hadLegacy && config.hostName === 'Authenticated Zoom Member') config.hostName = '';

    if (hadLegacy) saveZoomConfig(config);
    return config;
  } catch (err) {
    console.error('Failed to load Zoom config:', err);
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
    console.error('Failed to save Zoom config:', err);
    return false;
  }
}

/**
 * Remove saved Zoom room
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
 * Join URL built from the saved room, or '' when no room is set. There is no
 * fallback link: a host-only "start meeting" URL is useless to an invitee.
 */
export function getZoomJoinUrl(config) {
  if (!config) return '';

  // 1. Vanity URL (e.g. zoom.us/my/foundername)
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

  // 2. Numeric Meeting ID (PMI)
  if (config.meetingId && config.meetingId.trim()) {
    const cleanId = config.meetingId.replace(/\D/g, '');
    if (cleanId.length >= 9) {
      let url = `https://zoom.us/j/${cleanId}`;
      if (config.passcode && config.passcode.trim()) {
        url += `?pwd=${encodeURIComponent(config.passcode.trim())}`;
      }
      return url;
    }
  }

  return '';
}

/**
 * Short label describing the saved room, for status chips
 */
export function describeZoomRoom(config) {
  if (!config || !config.connected) return 'No room set';
  if (config.vanityUrl && config.vanityUrl.trim()) {
    return config.vanityUrl.trim().replace(/^https?:\/\//, '');
  }
  return `PMI: ${formatZoomId(config.meetingId)}`;
}

/* ------------------------------------------------------------------ */
/* iCalendar                                                           */
/* ------------------------------------------------------------------ */

const toIcsUtc = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

// RFC 5545 TEXT escaping
const escapeIcsText = (text) =>
  (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

// RFC 5545 content lines are limited to 75 octets; continuation lines start with a space.
function foldIcsLine(line) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const chunks = [];
  let current = '';
  let currentBytes = 0;
  for (const ch of line) {
    const bytes = encoder.encode(ch).length;
    // continuation lines carry a leading space, so they hold 74 octets of content
    const limit = chunks.length === 0 ? 75 : 74;
    if (currentBytes + bytes > limit) {
      chunks.push(current);
      current = '';
      currentBytes = 0;
    }
    current += ch;
    currentBytes += bytes;
  }
  chunks.push(current);
  return chunks.join('\r\n ');
}

/**
 * Generate RFC 5545 iCalendar (.ics) content for Apple Calendar & Outlook.
 * `start` and `end` are real instants (Date), written in UTC so every calendar
 * shows the meeting at the right moment in the viewer's own zone.
 */
export function generateICSContent({ title, description, location, url, start, end }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nanneram Horology//Vedic Auspicious Meeting Pass//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:nanneram-${Date.now()}@nanneram.vercel.app`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText((title || 'Nanneram Auspicious Meeting').replace(/[\r\n]+/g, ' '))}`,
    `DESCRIPTION:${escapeIcsText(description)}`
  ];
  if (location) lines.push(`LOCATION:${escapeIcsText(location)}`);
  if (url) lines.push(`URL:${url}`);
  lines.push(
    'STATUS:CONFIRMED',
    // Graceful-exit reminder: 5 minutes before the END of the window
    'BEGIN:VALARM',
    'TRIGGER;RELATED=END:-PT5M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Graceful Exit: 5 minutes left before the planetary shift',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

/**
 * Trigger immediate client-side download of an .ics file
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
