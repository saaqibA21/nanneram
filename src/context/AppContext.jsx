import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  CITIES, calculateVedicDay, getTodayInZone, getLiveHora, zonedMinutesToUtcDate, formatUtcOffset
} from '../utils/vedicTiming';
import {
  loadZoomConfig, getZoomJoinUrl, generateICSContent, downloadICSFile
} from '../utils/zoomIntegration';
import ZoomConnectModal from '../components/ZoomConnectModal';
import GmeetConnectModal from '../components/GmeetConnectModal';
import { Check } from 'lucide-react';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

const readStored = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode or storage blocked: the preference just isn't remembered */
  }
};

const toCalendarStamp = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

export function AppProvider({ children }) {
  // Where and when
  const [selectedCity, setSelectedCityState] = useState(
    () => CITIES.find((c) => c.name === readStored('nanneram_city', '')) || CITIES[0]
  );
  const [targetDateStr, setTargetDateStr] = useState(() => getTodayInZone(selectedCity.timeZone));
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Meeting preferences (kept while moving between pages)
  const [meetingPurpose, setMeetingPurpose] = useState('VC Pitch / Investor Call');
  const [durationMins, setDurationMins] = useState(30);
  const [platform, setPlatformState] = useState(() => (readStored('nanneram_platform', 'Google Meet') === 'Zoom' ? 'Zoom' : 'Google Meet'));
  const [zoomConfig, setZoomConfig] = useState(() => loadZoomConfig());
  const [gmeetLink, setGmeetLinkState] = useState(() => readStored('nanneram_gmeet_link', ''));
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showGmeetModal, setShowGmeetModal] = useState(false);

  // Audience mode: 'normal' (Classic Executive) vs 'genz' (Aura / Teen)
  const [appMode, setAppModeState] = useState(() => readStored('nanneram_app_mode', 'normal'));

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const triggerToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const setSelectedCity = useCallback((city) => {
    setSelectedCityState(city);
    writeStored('nanneram_city', city.name);
  }, []);

  const setPlatform = useCallback((p) => {
    setPlatformState(p);
    writeStored('nanneram_platform', p);
  }, []);

  const setGmeetLink = useCallback((link) => setGmeetLinkState(link), []);

  const setAppMode = useCallback((mode) => {
    setAppModeState(mode);
    writeStored('nanneram_app_mode', mode);
    try { document.documentElement.setAttribute('data-mode', mode); } catch {}
  }, []);

  const toggleAppMode = useCallback(() => {
    setAppModeState((prev) => {
      const next = prev === 'normal' ? 'genz' : 'normal';
      writeStored('nanneram_app_mode', next);
      try { document.documentElement.setAttribute('data-mode', next); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    try { document.documentElement.setAttribute('data-mode', appMode); } catch {}
  }, [appMode]);

  // Calculations
  const vedicData = useMemo(
    () => calculateVedicDay(new Date(targetDateStr + 'T00:00:00'), selectedCity),
    [targetDateStr, selectedCity]
  );
  const liveHora = useMemo(() => getLiveHora(selectedCity, nowMs), [selectedCity, nowMs]);

  // Meeting links and calendar exports
  const getRealMeetingUrl = () => (platform === 'Zoom' ? getZoomJoinUrl(zoomConfig) : gmeetLink.trim());

  const getMeetingLine = () => {
    const url = getRealMeetingUrl();
    if (url) return url;
    return platform === 'Zoom'
      ? 'Zoom room not set (add your personal room under "Set up Zoom")'
      : 'Google Meet link not set (add a shared room, or use "Add Google Meet" in Google Calendar)';
  };

  const zoneLabel = `${selectedCity.name} time, ${formatUtcOffset(vedicData.utcOffsetHours)}`;

  const getSlotInstants = (slot) => ({
    start: zonedMinutesToUtcDate(targetDateStr, selectedCity.timeZone, slot.startMin),
    end: zonedMinutesToUtcDate(targetDateStr, selectedCity.timeZone, slot.endMin)
  });

  const getSlotDetails = (slot) =>
    `Timed via Nanneram.\n` +
    `• Window: ${slot.startTimeFormatted} – ${slot.endTimeFormatted} (${zoneLabel})\n` +
    `• Wrap up by: ${slot.gracefulExitWindow}\n` +
    `• Hora and Gowri: ${slot.hora.name} & ${slot.gowri.name}\n` +
    `• Why this time: ${slot.recommendation}\n\n` +
    `Conference: ${getMeetingLine()}`;

  const eventTitle = (purpose) => {
    const hasRoom = Boolean(getRealMeetingUrl());
    return hasRoom ? `${purpose} (${platform}) - Nanneram` : `${purpose} - Nanneram`;
  };

  const getGoogleCalendarUrl = (slot, purpose = meetingPurpose) => {
    const { start, end } = getSlotInstants(slot);
    const realUrl = getRealMeetingUrl();
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventTitle(purpose),
      dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
      details: getSlotDetails(slot)
    });
    if (realUrl) params.set('location', realUrl);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const copyInvite = (slot, purpose = meetingPurpose) => {
    const invite =
      `Meeting: ${purpose}\n` +
      `Platform: ${platform}\n` +
      `Date: ${vedicData.dayName}, ${targetDateStr}\n` +
      `Window: ${slot.startTimeFormatted} – ${slot.endTimeFormatted} (${zoneLabel})\n` +
      `Wrap up by: ${slot.gracefulExitWindow}\n` +
      `Hora and Gowri: ${slot.hora.name} | ${slot.gowri.name}\n` +
      `Link: ${getMeetingLine()}\n\n` +
      `Timed with Nanneram, using NOAA solar equations and the Tamil Gowri Panchangam.`;

    navigator.clipboard.writeText(invite).then(
      () => triggerToast('Invite text copied.'),
      () => triggerToast('Could not copy. Your browser blocked clipboard access.')
    );
  };

  const downloadIcs = (slot, purpose = meetingPurpose) => {
    const { start, end } = getSlotInstants(slot);
    const realUrl = getRealMeetingUrl();
    const ics = generateICSContent({
      title: eventTitle(purpose),
      description: getSlotDetails(slot),
      location: realUrl || platform,
      url: realUrl,
      start,
      end
    });
    downloadICSFile(`Nanneram_${purpose.replace(/[^a-zA-Z0-9]/g, '_')}_${targetDateStr}.ics`, ics);
    triggerToast('Calendar file downloaded. Open it in Apple Calendar or Outlook.');
  };

  const value = {
    selectedCity, setSelectedCity,
    targetDateStr, setTargetDateStr,
    vedicData, liveHora, nowMs,
    meetingPurpose, setMeetingPurpose,
    durationMins, setDurationMins,
    platform, setPlatform,
    zoomConfig, setZoomConfig,
    gmeetLink,
    openZoomSetup: () => setShowZoomModal(true),
    openGmeetSetup: () => setShowGmeetModal(true),
    triggerToast,
    appMode, setAppMode, toggleAppMode,
    getRealMeetingUrl, getMeetingLine, zoneLabel,
    getGoogleCalendarUrl, copyInvite, downloadIcs
  };

  return (
    <AppContext.Provider value={value}>
      {children}

      <ZoomConnectModal
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        zoomConfig={zoomConfig}
        setZoomConfig={setZoomConfig}
        triggerToast={triggerToast}
      />
      <GmeetConnectModal
        isOpen={showGmeetModal}
        onClose={() => setShowGmeetModal(false)}
        gmeetLink={gmeetLink}
        setGmeetLink={setGmeetLink}
        triggerToast={triggerToast}
      />

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={16} />
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}
