import React, { useState, useEffect } from 'react';
import { formatTime, CITIES } from '../utils/vedicTiming';

export default function HorologyClockHero({
  vedicData,
  selectedCity,
  setSelectedCity,
  targetDateStr,
  setTargetDateStr,
  onOpenScheduleModal,
  onConnectCalendar,
  onOpenProofModal
}) {
  // Real-time live ticking clock for the antique face
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Hand rotations
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minDeg = minutes * 6 + seconds * 0.1;
  const secDeg = seconds * 6;

  // Find current active hora
  const currentMinutesFromMidnight = hours * 60 + minutes;
  const activeHora = vedicData.horas.find(h => currentMinutesFromMidnight >= h.start && currentMinutesFromMidnight < h.end) || vedicData.horas[0];

  return (
    <section className="cosmic-hero" style={{
      borderBottom: '3px solid var(--ink-border-heavy)',
      padding: '3.5rem 1.5rem 4.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>


      {/* Cosmic Animated Video Backdrop — framed to feature celestial dial & rishis while masking top text */}
      <video
        className="cosmic-video-bg"
        src="/assets/video/nalla-neram-hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="cosmic-video-overlay" />
      <div className="container" style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
        <div className="ornate-rule" style={{
          maxWidth: '620px', margin: '0 auto 1.5rem', color: 'var(--cosmic-gold)',
          fontFamily: 'var(--font-antique-serif)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px'
        }}>
          <span>Established on Vedic Solar Astronomy · 100% Deterministic Celestial Time</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.75rem, 5.5vw, 4.2rem)',
          fontWeight: 900,
          color: 'var(--cosmic-cream)',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          textShadow: '0 0 30px rgba(215, 169, 79, 0.5), 0 0 70px rgba(215, 169, 79, 0.22)'
        }}>
          The Astronomical Chronometer of Fate.
        </h1>

        <div aria-hidden="true" style={{ color: 'var(--cosmic-gold)', fontSize: '0.9rem', letterSpacing: '0.4rem', marginBottom: '1.25rem' }}>
          ✦
        </div>

        <p style={{
          fontSize: 'clamp(0.92rem, 3.5vw, 1.15rem)',
          color: 'var(--cosmic-lavender)',
          maxWidth: '720px',
          margin: '0 auto 2rem',
          lineHeight: 1.6,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic'
        }}>
          “Every hour is ruled by a celestial lord. The ancients never negotiated in Rahu Kaalam, nor signed agreements outside of Budha Hora. We synchronize your Google Meet & Zoom appointments with the auspicious seconds of victory.”
        </p>

        {/* Old-Gold Coordinate Tuner (City & Date) */}
        <div className="hero-tuner cosmic-card" style={{
          display: 'inline-flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--cosmic-gold-soft)',
          padding: '0.9rem 1.6rem', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 30px rgba(215,169,79,0.14)'
        }}>
          <div className="tuner-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="tuner-control" style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cosmic-lavender)' }}>OBSERVATORY LOCATION</label>
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  const found = CITIES.find(c => c.name === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                style={{
                  background: 'transparent', border: 'none', borderBottom: '1px solid var(--cosmic-gold-soft)',
                  fontSize: '0.95rem', fontWeight: 800, color: 'var(--cosmic-cream)', cursor: 'pointer', padding: '2px 0'
                }}
              >
                {CITIES.map(c => (
                  <option key={c.name} value={c.name} style={{ color: '#111' }}>{c.name} ({c.lat}° N, {c.lng}° E)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tuner-divider" style={{ width: '1px', height: '32px', background: 'var(--cosmic-gold-soft)' }} />

          <div className="tuner-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="tuner-control" style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cosmic-lavender)' }}>CHRONO-DATE</label>
              <input
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', borderBottom: '1px solid var(--cosmic-gold-soft)',
                  fontSize: '0.95rem', fontWeight: 800, color: 'var(--cosmic-cream)', cursor: 'pointer', padding: '2px 0',
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* THE MASTER HOROLOGICAL CLOCK & ASTROLABE STAGE */}
      <div className="container" style={{ maxWidth: '1040px', position: 'relative', zIndex: 1 }}>
        <div className="hero-stage-grid">

          {/* LEFT: THE ASTRONOMICAL MASTER CLOCK */}
          <div className="clock-assembly">

            <div className="cosmic-clock-glow" />

            <div style={{
              width: '320px', height: '320px', borderRadius: '50%',
              background: 'radial-gradient(circle, #fcf3dc 45%, #dcb977 90%, #8a6024 100%)',
              border: '6px solid var(--ink-border-heavy)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 24px 48px rgba(31,24,19,0.28), 0 8px 20px rgba(0,0,0,0.18)',
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>

              {/* Outer Roman Numerals & Planetary Ring */}
              <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: '1px dashed var(--antique-brass)' }} />

              {/* Roman Numerals */}
              {[
                { label: 'XII', deg: 0 },
                { label: 'I', deg: 30 },
                { label: 'II', deg: 60 },
                { label: 'III', deg: 90 },
                { label: 'IV', deg: 120 },
                { label: 'V', deg: 150 },
                { label: 'VI', deg: 180 },
                { label: 'VII', deg: 210 },
                { label: 'VIII', deg: 240 },
                { label: 'IX', deg: 270 },
                { label: 'X', deg: 300 },
                { label: 'XI', deg: 330 },
              ].map((num, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    fontFamily: 'var(--font-antique-serif)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: 'var(--walnut-ink)',
                    transform: `rotate(${num.deg}deg) translateY(-132px) rotate(-${num.deg}deg)`
                  }}
                >
                  {num.label}
                </span>
              ))}

              {/* Center Astrolabe Seal */}
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                border: '1.5px solid var(--antique-brass)',
                background: 'radial-gradient(circle, rgba(169, 124, 63, 0.16) 0%, transparent 80%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', zIndex: 1
              }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--sepia-faded)' }}>NANNERAM</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--walnut-ink)', margin: '2px 0' }}>HORA</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--antique-brass)' }}>{activeHora ? activeHora.planet.toUpperCase() : 'BUDHA'}</span>
              </div>

              {/* Antique Hour Hand */}
              <div style={{
                position: 'absolute', bottom: '50%', left: '50%', width: '6px', height: '78px',
                background: 'var(--ink-border-heavy)', borderRadius: '4px',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${hourDeg}deg)`,
                zIndex: 4
              }} />

              {/* Antique Minute Hand */}
              <div style={{
                position: 'absolute', bottom: '50%', left: '50%', width: '4px', height: '110px',
                background: 'var(--antique-brass)', borderRadius: '3px',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${minDeg}deg)`,
                zIndex: 5
              }} />

              {/* Second Hand */}
              <div style={{
                position: 'absolute', bottom: '50%', left: '50%', width: '1.5px', height: '125px',
                background: 'var(--wax-seal-crimson)',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${secDeg}deg)`,
                zIndex: 6
              }} />

              {/* Brass Center Pivot */}
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: 'radial-gradient(circle, #e8c06a 0%, #8a6024 100%)',
                border: '2px solid var(--ink-border-heavy)',
                position: 'absolute', zIndex: 10
              }} />

            </div>

            {/* Pendulum underneath */}
            <div className="pendulum-anim" style={{ marginTop: '-15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '3px', height: '70px', background: 'var(--antique-brass)' }} />
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'radial-gradient(circle, #e8c06a 0%, #8a6024 100%)',
                border: '2px solid var(--ink-border-heavy)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.35)'
              }} />
            </div>

          </div>

          {/* Quick Actions — Centered below clock */}
          <div className="hero-quick-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              onClick={onOpenScheduleModal}
              className="btn-brass"
              style={{ boxShadow: '0 3px 10px rgba(31,24,19,0.35), 0 0 26px rgba(215,169,79,0.55)' }}
            >
              Open Appointment Ledger
            </button>

            <button
              onClick={onOpenProofModal}
              className="btn-walnut"
              style={{ border: '2px solid var(--cosmic-gold-soft)' }}
            >
              Examine Solar Physics
            </button>
          </div>

        </div>
      </div>

    </section>
  );
}
