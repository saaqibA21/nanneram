import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, ShieldAlert, CheckCircle2, Video, Zap, Sparkles, 
  Copy, ExternalLink, Check, ChevronRight, Info, Globe, Lock, 
  ArrowRight, Compass, ShieldCheck, Flame, Layers, AlertTriangle, 
  X, Share2, HelpCircle, Download, Sliders
} from 'lucide-react';
import { 
  CITIES, calculateVedicDay, findOptimalMeetingSlots, formatTime, formatDuration, HORA_METADATA 
} from './utils/vedicTiming';
import HorologyClockHero from './components/HorologyClockHero';
import CosmicDeck from './components/CosmicDeck';
import OracleChatbot from './components/OracleChatbot';
import ZoomConnectModal from './components/ZoomConnectModal';
import { 
  loadZoomConfig, 
  getZoomJoinUrl, 
  formatZoomId, 
  generateICSContent, 
  downloadICSFile,
  handleZoomOAuthCallback
} from './utils/zoomIntegration';

export default function App() {
  // State
  const [selectedCity, setSelectedCity] = useState(CITIES[0]); // Chennai
  const [targetDateStr, setTargetDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [meetingPurpose, setMeetingPurpose] = useState('VC Pitch / Investor Call');
  const [platform, setPlatform] = useState('Google Meet');
  const [durationMins, setDurationMins] = useState(30);
  const [selectedSlotForModal, setSelectedSlotForModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectedCalendar, setConnectedCalendar] = useState(false);
  const [zoomConfig, setZoomConfig] = useState(() => loadZoomConfig());
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Zoom OAuth Callback on mount (for any user worldwide)
  useEffect(() => {
    const updated = handleZoomOAuthCallback();
    if (updated) {
      setZoomConfig(updated);
      setPlatform('Zoom');
      triggerToast('🎉 Zoom Video Apparatus successfully connected to your account!');
    }
  }, []);

  // Memoized Vedic Calculation
  const vedicData = useMemo(() => {
    const d = new Date(targetDateStr + 'T00:00:00');
    return calculateVedicDay(d, selectedCity);
  }, [targetDateStr, selectedCity]);

  // Memoized Optimal Slots
  const optimalSlots = useMemo(() => {
    return findOptimalMeetingSlots(vedicData, meetingPurpose, durationMins);
  }, [vedicData, meetingPurpose, durationMins]);

  // Presets for quick selection
  const presets = [
    { title: 'VC Pitch / Investor Call' },
    { title: 'Salary / Compensation Negotiation' },
    { title: 'Client Contract Sign-off' },
    { title: 'Executive Hiring Interview' },
    { title: 'Creative UX / Brand Review' }
  ];

  // Dynamic Meeting Join URL helper
  const getCurrentMeetingUrl = () => {
    return platform === 'Zoom'
      ? getZoomJoinUrl(zoomConfig)
      : 'https://meet.google.com/nan-neram-882';
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (slot) => {
    const d = new Date(targetDateStr + 'T00:00:00');
    const startHour = Math.floor(slot.startMin / 60);
    const startMins = slot.startMin % 60;
    const endHour = Math.floor(slot.endMin / 60);
    const endMins = slot.endMin % 60;

    const pad = (n) => n.toString().padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());

    const startISO = `${y}${m}${day}T${pad(startHour)}${pad(startMins)}00`;
    const endISO = `${y}${m}${day}T${pad(endHour)}${pad(endMins)}00`;
    const meetingUrl = getCurrentMeetingUrl();

    const title = encodeURIComponent(`${meetingPurpose} (${platform}) - Nanneram Auspicious Window`);
    const details = encodeURIComponent(
      `Timed for peak success via Nanneram Horology.\n` +
      `• Auspicious Start: ${slot.startTimeFormatted}\n` +
      `• Graceful Exit Window: ${slot.gracefulExitWindow} (Wrap before planetary shift)\n` +
      `• Active Transit: ${slot.hora.name} & ${slot.gowri.name}\n` +
      `• Astronomical Strategy: ${slot.recommendation}\n\n` +
      `Join ${platform}: ${meetingUrl}`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}`;
  };

  const copyInviteText = (slot) => {
    const meetingUrl = getCurrentMeetingUrl();
    const invite = 
      `Astronomical Appointment: ${meetingPurpose}\n` +
      `Platform: ${platform}\n` +
      `Date: ${vedicData.dayName}, ${targetDateStr}\n` +
      `Auspicious Window: ${slot.startTimeFormatted} – ${slot.endTimeFormatted} (Observatory: ${selectedCity.name})\n` +
      `Graceful Exit Window: ${slot.gracefulExitWindow}\n` +
      `Ruling Planet: ${slot.hora.name} | ${slot.gowri.name}\n` +
      `Meeting Pass: ${meetingUrl}\n\n` +
      `*Timed via Nanneram Horologium — Calibrated to NOAA Solar Equations & NASA JPL Ephemeris.*`;

    navigator.clipboard.writeText(invite);
    setCopied(true);
    triggerToast('Appointment invite copied to parchment!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Apple Calendar (.ics) download for iOS / macOS / Outlook
  const handleDownloadAppleCalendar = (slot) => {
    const meetingUrl = getCurrentMeetingUrl();
    const icsContent = generateICSContent({
      meetingPurpose,
      platform,
      slot,
      targetDateStr,
      selectedCityName: selectedCity.name,
      meetingUrl
    });
    const filename = `Nanneram_${meetingPurpose.replace(/[^a-zA-Z0-9]/g, '_')}_${targetDateStr}.ics`;
    downloadICSFile(icsContent, filename);
    triggerToast('Apple Calendar (.ics) pass downloaded!');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--aged-parchment)' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          background: 'var(--ink-border-heavy)', color: '#f5edd6', border: '2px solid var(--antique-brass)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
          padding: '0.9rem 1.4rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.6rem',
          fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-antique-serif)'
        }}>
          <Clock size={16} color="var(--antique-brass)" />
          {toastMessage}
        </div>
      )}

      {/* VINTAGE HOROLOGICAL TICKER TAPE */}
      <div className="ticker-tape" style={{
        background: 'var(--ink-border-heavy)', color: 'var(--antique-brass-light)',
        borderBottom: '2px solid #000', padding: '0.55rem 0',
        fontFamily: 'var(--font-antique-serif)', fontWeight: 800, letterSpacing: '1.5px',
        overflow: 'hidden', whiteSpace: 'nowrap'
      }}>
        <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'ticker 40s linear infinite' }}>
          ✦ OBSERVATORY SUNRISE {formatTime(vedicData.sunriseMin)} • SUNSET {formatTime(vedicData.sunsetMin)} ✦ RAHU KAALAM {formatTime(vedicData.rahuKaalam.start)} – {formatTime(vedicData.rahuKaalam.end)} (AVOID COMMENCING VENTURES) ✦ {selectedCity.name.toUpperCase()} EPHEMERIS ✦ BUDHA HORA (MERCURY) ACTIVE • CLOSING VELOCITY ✦ 100% DETERMINISTIC CELESTIAL HOROLOGY ✦ TEMPUS OMNIA VINCIT ✦&nbsp;
        </div>
      </div>

      {/* VINTAGE MASTER NAVIGATION BAR */}
      <nav className="site-nav" style={{
        background: 'var(--aged-paper-card)', borderBottom: '2px solid var(--ink-border-heavy)',
        padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '6px', background: 'var(--ink-border-heavy)',
            border: '2px solid var(--antique-brass)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--antique-brass-light)', fontWeight: 900, fontSize: '1.15rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)', flexShrink: 0
          }}>
            ☿
          </div>
          <div>
            <span style={{ fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', letterSpacing: '0.04em', color: 'var(--walnut-ink)' }}>
              NANNERAM<span style={{ color: 'var(--antique-brass)' }}>.HORA</span>
            </span>
            <span className="nav-brand-sub" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: 'var(--sepia-faded)', letterSpacing: '1px' }}>
              ANCIENT ASTRONOMICAL CHRONOMETER
            </span>
          </div>
        </div>

        {/* Center Live Coordinates */}
        <div className="nav-live-coords" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="wax-seal-tag">
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--patina-sage)' }} />
            <span>{selectedCity.name}: {formatTime(vedicData.sunriseMin)} DAWN</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button
            onClick={() => {
              const el = document.getElementById('oracle-advisor-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="wax-seal-tag"
            style={{ cursor: 'pointer', background: 'var(--aged-parchment-dark)', color: 'var(--walnut-ink)' }}
          >
            <Sparkles size={14} color="var(--antique-brass-deep)" />
            <span className="nav-btn-text">AI Meeting Oracle</span>
            <span className="nav-btn-short">AI Oracle</span>
          </button>

          <button
            onClick={() => setShowProofModal(true)}
            className="wax-seal-tag"
            style={{ cursor: 'pointer', background: '#fff' }}
          >
            <ShieldCheck size={14} color="var(--antique-brass)" />
            <span className="nav-btn-text">Examine Ephemeris</span>
            <span className="nav-btn-short">Ephemeris</span>
          </button>

          <button
            onClick={() => setShowConnectModal(true)}
            className={connectedCalendar ? "wax-seal-tag" : "btn-walnut"}
            style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
          >
            {connectedCalendar ? (
              <>
                <CheckCircle2 size={15} color="var(--patina-sage)" />
                <span className="nav-btn-text">CHRONO-SYNCED</span>
                <span className="nav-btn-short">SYNCED</span>
              </>
            ) : (
              <>
                <Compass size={15} color="var(--antique-brass)" />
                <span className="nav-btn-text">SYNCHRONIZE CALENDAR</span>
                <span className="nav-btn-short">SYNC CALENDAR</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* 1. MASTER HOROLOGICAL CLOCK & ASTROLABE HERO */}
      <HorologyClockHero 
        vedicData={vedicData}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        targetDateStr={targetDateStr}
        setTargetDateStr={setTargetDateStr}
        onOpenScheduleModal={() => {
          const el = document.getElementById('scheduler-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else if (optimalSlots.length > 0) setSelectedSlotForModal(optimalSlots[0]);
        }}
        onConnectCalendar={() => setShowConnectModal(true)}
        onOpenProofModal={() => setShowProofModal(true)}
      />

      {/* 2. THE DAILY EPHEMERIS & HOROLOGICAL REGISTER */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 3.5rem) clamp(1rem, 4vw, 1.5rem)', background: 'var(--aged-paper-card)', borderBottom: '2.5px solid var(--ink-border-heavy)' }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="wax-seal-tag" style={{ marginBottom: '0.4rem', background: 'var(--aged-parchment-dark)' }}>
                FOLIO DECREE • {vedicData.dayName.toUpperCase()}
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontFamily: 'var(--font-antique-serif)', fontWeight: 800 }}>
                The Daily Ephemeris Register
              </h2>
              <p style={{ color: 'var(--sepia-medium)', fontSize: '0.92rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                Solar Transit Duration: {formatDuration(vedicData.dinamana)} • Octants Calculated via NOAA Solar Equations
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', width: 'auto' }}>
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  const found = CITIES.find(c => c.name === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                style={{
                  border: '2px solid var(--ink-border-heavy)', padding: '0.5rem 0.9rem', borderRadius: '6px',
                  fontWeight: 800, fontSize: '0.85rem', background: 'var(--aged-parchment)', cursor: 'pointer',
                  fontFamily: 'var(--font-antique-serif)', maxWidth: '100%'
                }}
              >
                {CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Antique Parchment Cards */}
          <div className="stat-grid" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            {/* Rahu Kaalam Card */}
            <div className="antique-card" style={{ padding: '1.5rem', borderLeft: '6px solid var(--wax-seal-crimson)', background: 'var(--wax-seal-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.6rem' }}>
                <span className="wax-seal-tag" style={{ background: 'var(--wax-seal-crimson)', color: '#ffffff', borderColor: '#000' }}>
                  WAX SEAL AVOIDANCE
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-chrono-mono)' }}>OCTANT {Math.round((vedicData.rahuKaalam.start - vedicData.sunriseMin) / vedicData.partDuration) + 1}/8</span>
              </div>
              <div style={{ fontSize: 'clamp(1.4rem, 5vw, 1.7rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', margin: '0.2rem 0', color: 'var(--wax-seal-crimson)' }}>
                {formatTime(vedicData.rahuKaalam.start)} – {formatTime(vedicData.rahuKaalam.end)}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#5c1b1b', lineHeight: 1.4, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                <strong>Rahu Kaalam (ராகு காலம்):</strong> The window of eclipse shadow. Never initiate contracts or pitch terms during these minutes.
              </p>
            </div>

            {/* Nalla Neram Card */}
            <div className="antique-card" style={{ padding: '1.5rem', borderLeft: '6px solid var(--antique-brass)', background: 'var(--aged-parchment-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.6rem' }}>
                <span className="wax-seal-tag" style={{ background: 'var(--antique-brass)', color: '#171109' }}>
                  ✦ NALLA NERAM
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--antique-brass)' }}>PEAK HARMONY</span>
              </div>
              <div style={{ fontSize: 'clamp(1.4rem, 5vw, 1.7rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', margin: '0.2rem 0', color: 'var(--walnut-ink)' }}>
                {formatTime(vedicData.nallaNeramMorning.start)} – {formatTime(vedicData.nallaNeramMorning.end)}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--sepia-medium)', lineHeight: 1.4, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                <strong>Morning Golden Window:</strong> Classical auspicious minutes for signing contracts, sending bids, and leadership appointments.
              </p>
            </div>

            {/* Yamagandam */}
            <div className="antique-card" style={{ padding: '1.5rem', borderLeft: '6px solid var(--ink-border-heavy)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.6rem' }}>
                <span className="wax-seal-tag">
                  YAMAGANDAM
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--antique-copper)' }}>LOSS RISK</span>
              </div>
              <div style={{ fontSize: 'clamp(1.4rem, 5vw, 1.7rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', margin: '0.2rem 0', color: 'var(--walnut-ink)' }}>
                {formatTime(vedicData.yamagandam.start)} – {formatTime(vedicData.yamagandam.end)}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--sepia-faded)', lineHeight: 1.4 }}>
                Avoid inaugurations or financial outlays. Actions initiated in Yamagandam encounter heavy friction.
              </p>
            </div>

            {/* Gulika Kaalam */}
            <div className="antique-card" style={{ padding: '1.5rem', borderLeft: '6px solid var(--ink-border-heavy)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.6rem' }}>
                <span className="wax-seal-tag">
                  GULIKA KAALAM
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>RECURRING CYCLE</span>
              </div>
              <div style={{ fontSize: 'clamp(1.4rem, 5vw, 1.7rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', margin: '0.2rem 0', color: 'var(--walnut-ink)' }}>
                {formatTime(vedicData.gulikaKaalam.start)} – {formatTime(vedicData.gulikaKaalam.end)}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--sepia-faded)', lineHeight: 1.4 }}>
                Actions begun in Gulika repeat cyclically. Highly favorable for compounding investments; avoid disputes.
              </p>
            </div>

          </div>

          {/* 12-Hora Antique Slide Rule */}
          <div className="antique-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} color="var(--antique-brass)" />
                <span style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)' }}>
                  12-HORA DAYTIME CELESTIAL RULER
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-antique-serif)' }}>
                <span style={{ color: 'var(--antique-brass)' }}>● MERCURY (DEALS)</span>
                <span>● JUPITER (WISDOM)</span>
                <span>● SUN (AUTHORITY)</span>
                <span style={{ color: 'var(--wax-seal-crimson)' }}>● MARS/SATURN (CAUTION)</span>
              </div>
            </div>

            <div className="hora-slide-rule">
              {vedicData.horas.map((h, i) => (
                <div 
                  key={i}
                  title={`${h.name}: ${formatTime(h.start)} - ${formatTime(h.end)}`}
                  style={{
                    flex: '1 1 0%',
                    minWidth: 0,
                    background: h.planet === 'Mercury' ? 'var(--aged-parchment-dark)' : h.planet === 'Jupiter' ? '#e2d6be' : h.planet === 'Mars' || h.planet === 'Saturn' ? '#f5d5d5' : '#ffffff',
                    borderRight: i < 11 ? '1.5px solid var(--ink-border-heavy)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', color: '#000', cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span className="hora-label-full">{h.planet.substring(0, 3).toUpperCase()}</span>
                  <span className="hora-label-short">{h.planet.substring(0, 1).toUpperCase()}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--sepia-faded)', fontFamily: 'var(--font-antique-serif)', flexWrap: 'wrap', gap: '0.3rem' }}>
              <span>DAWN: {formatTime(vedicData.sunriseMin)}</span>
              <span>MERIDIAN NOON</span>
              <span>DUSK: {formatTime(vedicData.sunsetMin)}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE 6 ANCIENT CHRONOMETERS OF TIME (THE COSMIC DECK) */}
      <CosmicDeck />

      {/* 4. EXECUTIVE APPOINTMENT LEDGER (MEETING SCHEDULER) */}
      <section id="scheduler-section" style={{ padding: 'clamp(3rem, 6vw, 4.5rem) clamp(1rem, 4vw, 1.5rem)', background: 'var(--aged-parchment)', borderBottom: '2.5px solid var(--ink-border-heavy)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 2.5rem)' }}>
            <div className="wax-seal-tag" style={{ background: 'var(--aged-parchment-light)', marginBottom: '0.6rem' }}>
              ROYAL HOROLOGICAL APPOINTMENT DESK
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.4rem)', fontFamily: 'var(--font-antique-serif)', fontWeight: 800 }}>
              Dispatch an Auspicious Meeting Folio
            </h2>
            <p style={{ color: 'var(--sepia-medium)', fontSize: 'clamp(0.92rem, 3vw, 1.05rem)', maxWidth: '640px', margin: '0 auto', fontStyle: 'italic', fontFamily: 'Georgia, serif', padding: '0 0.5rem' }}>
              Declare your high-stakes negotiation or pitch. The chronometer calculates the optimal minutes, screens Rahu Kaalam, and engraves your Google Meet or Zoom pass.
            </p>
          </div>

          {/* Control Toolbar — full-width console strip, not a sidebar */}
          <div className="antique-card criteria-toolbar" style={{ padding: '1.75rem 2rem', background: 'var(--aged-paper-card)', marginBottom: '2.5rem' }}>

            {/* I. Objective */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sepia-faded)', marginBottom: '0.6rem', fontFamily: 'var(--font-antique-serif)' }}>
                <span style={{ color: 'var(--antique-brass)' }}>I.</span> Select Objective
              </label>
              <div className="preset-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMeetingPurpose(p.title)}
                    className="wax-seal-tag"
                    style={{
                      cursor: 'pointer',
                      background: meetingPurpose === p.title ? 'var(--ink-border-heavy)' : '#ffffff',
                      color: meetingPurpose === p.title ? 'var(--antique-brass-light)' : '#000000',
                      maxWidth: '100%',
                      textAlign: 'left'
                    }}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={meetingPurpose}
                onChange={(e) => setMeetingPurpose(e.target.value)}
                placeholder="Or name a custom objective..."
                style={{
                  width: '100%', padding: '0.65rem 0.9rem', background: '#ffffff',
                  border: '2px solid var(--ink-border-heavy)', borderRadius: '6px', fontSize: '0.85rem',
                  fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>

            <div className="toolbar-divider" />

            {/* II. Conference Apparatus */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sepia-faded)', marginBottom: '0.6rem', fontFamily: 'var(--font-antique-serif)' }}>
                <span style={{ color: 'var(--antique-brass)' }}>II.</span> Conference Apparatus
              </label>
              <div className="apparatus-toggle" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  onClick={() => setPlatform('Google Meet')}
                  className="wax-seal-tag"
                  style={{
                    padding: '0.65rem', justifyContent: 'center', cursor: 'pointer',
                    background: platform === 'Google Meet' ? 'var(--ink-border-heavy)' : '#ffffff',
                    color: platform === 'Google Meet' ? '#ffffff' : '#000000'
                  }}
                >
                  Google Meet
                </button>
                <button
                  onClick={() => setPlatform('Zoom')}
                  className="wax-seal-tag"
                  style={{
                    padding: '0.65rem', justifyContent: 'center', cursor: 'pointer',
                    background: platform === 'Zoom' ? 'var(--ink-border-heavy)' : '#ffffff',
                    color: platform === 'Zoom' ? '#ffffff' : '#000000'
                  }}
                >
                  Zoom Video
                </button>

                {platform === 'Zoom' && (
                  <div style={{
                    marginTop: '0.2rem',
                    padding: '0.45rem 0.75rem',
                    background: '#ffffff',
                    border: '1.5px solid var(--antique-brass-light)',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    fontSize: '0.72rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, overflow: 'hidden' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: zoomConfig.connected ? '#16a34a' : '#ea580c',
                        flexShrink: 0
                      }} />
                      <span style={{ fontWeight: 800, color: 'var(--walnut-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {zoomConfig.connected ? `PMI: ${formatZoomId(zoomConfig.pmi)}` : 'Default Test Room'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowZoomModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--antique-brass-deep)',
                        fontWeight: 900,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: '0.72rem'
                      }}
                    >
                      Configure ⚙️
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="toolbar-divider" />

            {/* III. Duration */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sepia-faded)', marginBottom: '0.6rem', fontFamily: 'var(--font-antique-serif)' }}>
                <span style={{ color: 'var(--antique-brass)' }}>III.</span> Duration
              </label>
              <div className="duration-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationMins(mins)}
                    className="wax-seal-tag"
                    style={{
                      padding: '0.5rem 0', justifyContent: 'center', cursor: 'pointer',
                      background: durationMins === mins ? 'var(--antique-brass)' : '#ffffff',
                      color: durationMins === mins ? '#171109' : '#000000',
                      fontWeight: 900
                    }}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-divider" />

            {/* IV. Status readout */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sepia-faded)', marginBottom: '0.6rem', fontFamily: 'var(--font-antique-serif)' }}>
                <span style={{ color: 'var(--antique-brass)' }}>IV.</span> Filing Status
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span className="wax-seal-tag" style={{ background: 'var(--patina-sage)', color: '#fff' }}>
                  Rahu Filtered
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--sepia-medium)', fontFamily: 'var(--font-antique-serif)', fontWeight: 800 }}>
                  {vedicData.dayName.toUpperCase()} FOLIO
                </span>
              </div>
            </div>

          </div>

          {/* Results: Antique Appointment Folios, full width */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', marginBottom: '1.2rem' }}>
              Astronomical Appointments ({vedicData.dayName})
            </h3>

            {optimalSlots.length === 0 ? (
              <div className="antique-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <h4 style={{ color: 'var(--wax-seal-crimson)' }}>No Favorable Passes Available</h4>
                <p style={{ color: 'var(--sepia-faded)', fontSize: '0.9rem' }}>Choose an alternate date or adjust meeting duration.</p>
              </div>
            ) : (
              <div className="appointments-grid" style={{ gap: '1.2rem' }}>
                {optimalSlots.map((slot, idx) => (
                  <div key={idx} className="antique-card" style={{ padding: '1.5rem', background: '#ffffff', borderLeft: '6px solid var(--antique-brass)' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.6rem' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--sepia-faded)', fontFamily: 'var(--font-antique-serif)', letterSpacing: '1px' }}>
                            FOLIO APPOINTMENT #00{idx + 1} • {platform.toUpperCase()}
                          </span>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', color: 'var(--walnut-ink)' }}>
                            {slot.priorityTitle.toUpperCase()}
                          </div>
                        </div>

                        {idx === 0 ? (
                          <span className="wax-seal-tag" style={{ background: 'var(--antique-brass)', color: '#171109' }}>
                            ★ 98% HARMONY
                          </span>
                        ) : (
                          <span className="wax-seal-tag">
                            PASS APPROVED
                          </span>
                        )}
                      </div>

                      <div className="appointment-time-row" style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.4rem 0.8rem', marginBottom: '0.8rem' }}>
                        <span style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2.2rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', letterSpacing: '-0.02em' }}>
                          {slot.startTimeFormatted}
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sepia-faded)' }}>➔</span>
                        <span style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2.2rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', letterSpacing: '-0.02em' }}>
                          {slot.endTimeFormatted}
                        </span>
                        <span className="wax-seal-tag" style={{ marginLeft: 'auto', background: 'var(--aged-parchment-dark)' }}>
                          {slot.hora.planet} Hora
                        </span>
                      </div>

                      {/* Exit Window Stamp */}
                      <div style={{
                        background: 'var(--aged-parchment-light)', border: '1px solid var(--ink-border-heavy)',
                        padding: '0.55rem 0.85rem', borderRadius: '4px', marginBottom: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 800,
                        fontFamily: 'var(--font-antique-serif)'
                      }}>
                        <span><strong>Graceful Exit Window:</strong> {slot.gracefulExitWindow} (Conclude remarks before planetary flip)</span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', lineHeight: 1.5, marginBottom: '1.2rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                        {slot.recommendation}
                      </p>

                      <div className="appointment-actions" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setSelectedSlotForModal(slot)}
                          className="btn-brass" 
                          style={{ fontSize: '0.8rem', padding: '0.65rem 1.2rem', flex: '1 1 170px', justifyContent: 'center' }}
                        >
                          Issue {platform} Pass
                        </button>
                        
                        <a 
                          href={getGoogleCalendarUrl(slot)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-walnut" 
                          style={{ fontSize: '0.8rem', padding: '0.65rem 1.1rem', flex: '1 1 170px', justifyContent: 'center' }}
                        >
                          Engrave in Calendar
                        </a>
                      </div>

                    </div>
                  ))}
                </div>
              )}
          </div>

        </div>
      </section>
 
      {/* 5. PRO GUILD AI HOROLOGICAL ORACLE (MEETING & ATTIRE ADVISOR) */}
      <OracleChatbot 
        vedicData={vedicData}
        selectedCity={selectedCity}
        optimalSlots={optimalSlots}
        onIssuePass={(slot) => setSelectedSlotForModal(slot)}
        onAddToCalendar={(slot) => window.open(getGoogleCalendarUrl(slot), '_blank')}
        triggerToast={triggerToast}
      />

      {/* 6. THE GUILD MEMBERSHIP LEDGER (PRICING) */}
      <section style={{ padding: 'clamp(3rem, 6vw, 4.5rem) clamp(1rem, 4vw, 1.5rem)', background: 'var(--aged-paper-card)', borderBottom: '2.5px solid var(--ink-border-heavy)' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <div className="wax-seal-tag" style={{ background: 'var(--aged-parchment-dark)', marginBottom: '0.6rem' }}>
              OFFICIAL GUILD LEDGER
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.6rem)', fontFamily: 'var(--font-antique-serif)', fontWeight: 800 }}>
              Invest in Auspicious Chronometry
            </h2>
            <p style={{ color: 'var(--sepia-medium)', fontSize: 'clamp(0.92rem, 3vw, 1.05rem)', margin: '0.5rem auto 0', fontStyle: 'italic', fontFamily: 'Georgia, serif', padding: '0 0.5rem' }}>
              A single contract won or dispute avoided pays for a lifetime guild subscription.
            </p>
          </div>

          <div className="pricing-grid" style={{ gap: '2rem' }}>
            
            {/* The Apprentice Folio */}
            <div className="antique-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 800 }}>The Apprentice</h3>
                  <span className="wax-seal-tag">FREE</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--sepia-faded)', marginBottom: '1.5rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  For personal career decisions and occasional job interview timing.
                </p>
                <div style={{ fontSize: 'clamp(2.2rem, 7vw, 2.8rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', marginBottom: '1.5rem', color: 'var(--walnut-ink)' }}>
                  ₹0 <span style={{ fontSize: '0.85rem', color: 'var(--sepia-faded)', fontWeight: 600 }}>/ forever</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', fontWeight: 800 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ flexShrink: 0 }} /> 3 Auto-scheduled meetings / month</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ flexShrink: 0 }} /> Full Rahu Kaalam & Nalla Neram folios</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ flexShrink: 0 }} /> 11 Global Observatory Hubs</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}><span style={{ flexShrink: 0, width: '16px', textAlign: 'center' }}>✕</span> Live In-Call Chronometer Extension</li>
                </ul>
              </div>

              <button 
                onClick={() => triggerToast('You hold the Apprentice Pass.')}
                className="btn-walnut" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '2.5rem' }}
              >
                Current Guild Level
              </button>
            </div>

            {/* The Master Horologist Pass (FEATURED WAX SEAL) */}
            <div className="antique-card" style={{
              padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              background: '#fcf8ee', border: '3px solid var(--ink-border-heavy)',
              boxShadow: '0 20px 40px rgba(31,24,19,0.28), 0 6px 16px rgba(31,24,19,0.18)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 900 }}>Master Horologist</h3>
                  <span className="wax-seal-tag" style={{ background: 'var(--antique-brass)', color: '#171109' }}>PRO GUILD</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', marginBottom: '1.5rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  For founders, sales executives, consultants & serious deal closers.
                </p>
                <div style={{ fontSize: 'clamp(2.2rem, 7vw, 2.8rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', marginBottom: '1.5rem', color: 'var(--walnut-ink)' }}>
                  ₹599 <span style={{ fontSize: '0.85rem', color: 'var(--sepia-faded)', fontWeight: 600 }}>/ month ($15/mo)</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', fontWeight: 800 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} color="var(--patina-sage)" style={{ flexShrink: 0 }} /> <strong>Unlimited</strong> Auto-Scheduled Google Meet & Zoom calls</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} color="var(--patina-sage)" style={{ flexShrink: 0 }} /> <strong>AI Vedic Meeting & Attire Advisor</strong> (Color, Direction, Script)</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} color="var(--patina-sage)" style={{ flexShrink: 0 }} /> <strong>Two-Way Calendar Sync</strong> (Auto-filters Rahu Kaalam)</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} color="var(--patina-sage)" style={{ flexShrink: 0 }} /> Graceful Exit Window alert notifications</li>
                </ul>
              </div>

              <button 
                onClick={() => {
                  const el = document.getElementById('oracle-advisor-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  triggerToast('Master Horologist Advisor Unlocked: Welcome to the AI Oracle!');
                }}
                className="btn-brass" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '2.5rem' }}
              >
                Launch AI Meeting Advisor
              </button>
            </div>

            {/* The Sovereign Guild Pass */}
            <div className="antique-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 800 }}>Sovereign Guild</h3>
                  <span className="wax-seal-tag">ENTERPRISE</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--sepia-faded)', marginBottom: '1.5rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  For real estate brokerages, venture funds & trading partnerships.
                </p>
                <div style={{ fontSize: 'clamp(2.2rem, 7vw, 2.8rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', marginBottom: '1.5rem', color: 'var(--walnut-ink)' }}>
                  ₹2,499 <span style={{ fontSize: '0.85rem', color: 'var(--sepia-faded)', fontWeight: 600 }}>/ month ($49/mo)</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', fontWeight: 800 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ flexShrink: 0 }} /> Up to 5 team seats included</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ flexShrink: 0 }} /> Multi-party Chart & Kundli Harmony matching</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ flexShrink: 0 }} /> Custom company booking link (`nanneram.ai/brand`)</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ flexShrink: 0 }} /> Dedicated WhatsApp alert chronometer</li>
                </ul>
              </div>

              <button 
                onClick={() => triggerToast('Contact sales: founders@nanneram.ai')}
                className="btn-walnut" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '2.5rem' }}
              >
                Request Guild Charter
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* GENERATE MEETING LINK MODAL */}
      {selectedSlotForModal && (
        <div className="modal-backdrop">
          <div className="antique-card modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--ink-border-heavy)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Video size={22} color="var(--antique-brass)" />
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 900 }}>
                  {platform.toUpperCase()} APPOINTMENT PASS
                </h3>
              </div>
              <button onClick={() => setSelectedSlotForModal(null)} style={{ padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{
              background: 'var(--aged-parchment-light)', border: '2px solid var(--ink-border-heavy)', padding: '1.2rem',
              borderRadius: '6px', marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 800 }}>
                <span>Certified Window:</span>
                <span>{selectedSlotForModal.startTimeFormatted} – {selectedSlotForModal.endTimeFormatted}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--wax-seal-crimson)' }}>
                <span>Graceful Exit Window:</span>
                <span>{selectedSlotForModal.gracefulExitWindow}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}>
                <span>Ruling Planet:</span>
                <span>{selectedSlotForModal.hora.name}</span>
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'var(--font-antique-serif)' }}>
              CONFERENCE LINK:
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff',
              border: '2px solid var(--ink-border-heavy)', padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '1rem'
            }}>
              <input 
                readOnly
                value={getCurrentMeetingUrl()}
                style={{ background: 'transparent', border: 'none', flex: 1, fontSize: '0.85rem', fontWeight: 800, color: '#000', minWidth: 0 }}
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(getCurrentMeetingUrl());
                  triggerToast('Meeting URL copied!');
                }}
                className="wax-seal-tag" style={{ padding: '0.35rem 0.75rem', cursor: 'pointer', flexShrink: 0 }}
              >
                Copy
              </button>
            </div>

            {platform === 'Zoom' && (
              <div style={{
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                background: '#f5edd6',
                padding: '0.5rem 0.8rem',
                borderRadius: '5px',
                border: '1.5px solid var(--antique-brass-light)'
              }}>
                <span style={{ color: 'var(--walnut-ink)', fontWeight: 700 }}>
                  Zoom Apparatus: {zoomConfig.connected ? `PMI (${formatZoomId(zoomConfig.pmi)})` : 'Default Test Room'}
                </span>
                <button
                  onClick={() => setShowZoomModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--antique-brass-deep)',
                    textDecoration: 'underline',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Configure Zoom ⚙️
                </button>
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => copyInviteText(selectedSlotForModal)}
                  className="btn-brass" 
                  style={{ flex: '1 1 140px', justifyContent: 'center' }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Invitation'}
                </button>
                <a 
                  href={getGoogleCalendarUrl(selectedSlotForModal)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-walnut" 
                  style={{ flex: '1 1 140px', justifyContent: 'center' }}
                >
                  <Calendar size={16} color="var(--antique-brass)" />
                  Google Calendar
                </a>
              </div>

              <button
                onClick={() => handleDownloadAppleCalendar(selectedSlotForModal)}
                className="wax-seal-tag"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.7rem 1rem',
                  background: '#ffffff',
                  cursor: 'pointer',
                  border: '1.5px solid var(--ink-border-heavy)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download size={15} color="var(--antique-brass)" />
                Apple Calendar (.ics) / Outlook Pass
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SCIENTIFIC PROOF MODAL */}
      {showProofModal && (
        <div className="modal-backdrop">
          <div className="antique-card modal-card" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--ink-border-heavy)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={24} color="var(--antique-brass)" />
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 900 }}>
                  OBSERVATORY EPHEMERIS AUDIT
                </h3>
              </div>
              <button onClick={() => setShowProofModal(false)} style={{ padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            <p style={{ color: 'var(--sepia-medium)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.92rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              Nanneram Horologium strictly relies on <strong>empirical solar physics and ancient astronomical treatises</strong>. We reject all algorithmic guessing.
            </p>

            <div style={{ background: 'var(--aged-parchment-light)', padding: '1.2rem', borderRadius: '6px', border: '2px solid var(--ink-border-heavy)', marginBottom: '1.2rem' }}>
              <h4 style={{ marginBottom: '0.4rem', fontSize: '1rem', fontFamily: 'var(--font-antique-serif)' }}>1. NOAA Solar Equations (NASA JPL Benchmark)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', lineHeight: 1.5 }}>
                Sunrise and Sunset are computed using the NOAA solar geometry equation with a 90.833° solar zenith angle (accounting for atmospheric refraction).
                <br />
                <code>Dinamana (Solar Day Length) = Sunset - Sunrise</code>
                <br />
                <code>Ashtama-Bhaga = Dinamana / 8 equal divisions</code>
              </p>
            </div>

            <div style={{ background: 'var(--aged-parchment-light)', padding: '1.2rem', borderRadius: '6px', border: '2px solid var(--ink-border-heavy)', marginBottom: '1.2rem' }}>
              <h4 style={{ marginBottom: '0.4rem', fontSize: '1rem', fontFamily: 'var(--font-antique-serif)' }}>2. Classical Treatises & Citations</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--sepia-medium)' }}>
                <li>• <strong>Kalaprakasika (Chapter 2):</strong> Exact definitions of Rahu Kaalam octants and avoidance rules.</li>
                <li>• <strong>Muhurtha Chintamani (Chapter 3):</strong> Rules for commercial transactions, signing agreements, and trade during Budha (Mercury) Hora.</li>
                <li>• <strong>Brihat Samhita (Varahamihira):</strong> Chaldean hourly lordship sequence starting at local sunrise.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--aged-parchment-light)', padding: '1.2rem', borderRadius: '6px', border: '2px solid var(--ink-border-heavy)', marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.4rem', fontSize: '1rem', fontFamily: 'var(--font-antique-serif)' }}>3. Live Observatory Audit ({selectedCity.name})</h4>
              <div className="audit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-chrono-mono)' }}>
                <div>Latitude: {selectedCity.lat}°</div>
                <div>Longitude: {selectedCity.lng}°</div>
                <div>Calculated Dawn: {formatTime(vedicData.sunriseMin)}</div>
                <div>Calculated Dusk: {formatTime(vedicData.sunsetMin)}</div>
                <div>Rahu Kaalam: {formatTime(vedicData.rahuKaalam.start)} – {formatTime(vedicData.rahuKaalam.end)}</div>
                <div>Day Length: {formatDuration(vedicData.dinamana)}</div>
              </div>
            </div>

            <button 
              onClick={() => setShowProofModal(false)}
              className="btn-walnut" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Audited & Understood
            </button>
          </div>
        </div>
      )}

      {/* CONNECT CALENDAR MODAL */}
      {showConnectModal && (
        <div className="modal-backdrop">
          <div className="antique-card modal-card" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--ink-border-heavy)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Compass size={22} color="var(--antique-brass)" />
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 900 }}>
                  CHRONO-SYNCHRONIZATION
                </h3>
              </div>
              <button onClick={() => setShowConnectModal(false)} style={{ padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            <p style={{ color: 'var(--sepia-medium)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              Synchronize Nanneram with your Google Calendar, Microsoft Outlook, or Zoom Video apparatus. The chronometer will automatically flag inauspicious hours (Rahu Kaalam) directly upon your calendar parchment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => {
                  setConnectedCalendar(true);
                  setShowConnectModal(false);
                  triggerToast('Google Calendar synced with Rahu Kaalam blocker!');
                }}
                className="btn-walnut" 
                style={{ padding: '0.85rem', justifyContent: 'center', gap: '0.8rem' }}
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google" style={{ width: '20px' }} />
                Continue with Google Calendar
              </button>
              
              <button 
                onClick={() => {
                  setConnectedCalendar(true);
                  setShowConnectModal(false);
                  triggerToast('Microsoft Outlook Calendar synchronized!');
                }}
                className="wax-seal-tag" 
                style={{ padding: '0.85rem', justifyContent: 'center', gap: '0.8rem', cursor: 'pointer' }}
              >
                <Calendar size={18} color="#0078d4" />
                Continue with Outlook Calendar
              </button>

              <div style={{ margin: '0.3rem 0', borderTop: '1px dashed var(--ink-border-heavy)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)', background: '#faf4e6', padding: '0 0.5rem', fontSize: '0.68rem', color: 'var(--sepia-faded)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                  Video Apparatus & Apple
                </span>
              </div>

              <button 
                onClick={() => {
                  setShowConnectModal(false);
                  setShowZoomModal(true);
                }}
                className="wax-seal-tag" 
                style={{
                  padding: '0.85rem', justifyContent: 'center', gap: '0.8rem', cursor: 'pointer',
                  background: zoomConfig.connected ? '#e8f5e9' : '#ffffff',
                  border: zoomConfig.connected ? '2px solid #2e7d32' : '2px solid var(--ink-border-heavy)'
                }}
              >
                <Video size={18} color="#2D8CFF" />
                <span style={{ fontWeight: 800 }}>
                  {zoomConfig.connected ? `Zoom Apparatus Linked (${formatZoomId(zoomConfig.pmi)})` : 'Configure Zoom Video Apparatus'}
                </span>
              </button>

              <div style={{
                padding: '0.65rem 0.85rem', background: 'var(--aged-parchment-light)',
                border: '1.5px solid var(--ink-border-heavy)', borderRadius: '6px',
                fontSize: '0.78rem', color: 'var(--sepia-medium)', display: 'flex', alignItems: 'center', gap: '0.6rem'
              }}>
                <span style={{ fontSize: '1.15rem' }}>🍎</span>
                <span><strong>Apple Users (iOS / macOS):</strong> Meeting passes include a native <code>.ics</code> download that opens instantly in Apple Calendar with a pre-configured exit alert.</span>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--sepia-faded)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Lock size={12} />
              <span>Private calendar data is never harvested or sold. DPDP 2023 & GDPR compliant.</span>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM CONNECT MODAL */}
      <ZoomConnectModal
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        zoomConfig={zoomConfig}
        setZoomConfig={setZoomConfig}
        triggerToast={triggerToast}
      />

      {/* VINTAGE COLOPHON & FOOTER */}
      <footer style={{ marginTop: 'auto', background: 'var(--ink-border-heavy)', color: '#f5edd6', padding: '4rem 1.5rem 2.5rem' }}>
        <div className="container footer-grid" style={{ gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--antique-brass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#171109', fontWeight: 900 }}>
                ☿
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', fontFamily: 'var(--font-antique-serif)', letterSpacing: '0.04em' }}>NANNERAM.HORA</span>
            </div>
            <p style={{ color: '#b5a593', fontSize: '0.85rem', lineHeight: 1.6, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              Vedic astronomical chronometry for high-stakes executive meetings, contract negotiations, and career moves.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-antique-serif)', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--antique-brass)' }}>OBSERVATORIES</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#d3c5b5' }}>
              <li>Chennai • Bengaluru • Mumbai</li>
              <li>New Delhi • Hyderabad • Kolkata</li>
              <li>San Francisco • New York • London</li>
              <li>Dubai • Singapore</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-antique-serif)', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--antique-brass)' }}>APPARATUS INTEGRATIONS</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#d3c5b5' }}>
              <li>Google Meet Chrono-Pass</li>
              <li>Zoom Marketplace Companion</li>
              <li>Google Calendar 2-Way Synchronization</li>
              <li>WhatsApp Daily Astrolabe Bot</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-antique-serif)', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--antique-brass)' }}>JURISPRUDENCE & STATUTES</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#d3c5b5' }}>
              <li><button onClick={() => setShowProofModal(true)} style={{ color: 'inherit', cursor: 'pointer' }}>Ephemeris Methodology</button></li>
              <li>Google API Limited Use Disclosure</li>
              <li>DPDP Act 2023 & GDPR Privacy Charter</li>
              <li>Terms of Service & Entertainment Disclaimer</li>
            </ul>
          </div>
        </div>

        <div className="container" style={{ borderTop: '1px solid rgba(184, 147, 71, 0.25)', paddingTop: '1.5rem', fontSize: '0.75rem', color: '#9c8c7c', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>LEGAL & REGULATORY NOTICE:</strong> All timing calculations, Horas, Gowri states, and recommendations generated by Nanneram Horologium are provided strictly for strategic productivity and informational guidance. Nanneram does not provide financial, legal, or medical advice, nor does it guarantee specific business transaction outcomes, job hires, or contract profits.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span>© 2026 Nanneram Horological Guild Inc. All rights reserved.</span>
            <span>Calibrated with precision solar mathematics.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
