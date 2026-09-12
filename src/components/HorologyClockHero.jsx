import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Compass, ShieldAlert, Video, Calendar, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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
    <section style={{
      background: 'var(--aged-parchment)',
      borderBottom: '3px solid var(--ink-border-heavy)',
      padding: '3.5rem 1.5rem 4.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Antique Header Ribbon */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="wax-seal-tag" style={{ marginBottom: '1rem', background: 'var(--aged-parchment-light)' }}>
          <Compass size={14} color="var(--antique-brass)" />
          <span>ESTABLISHED ON VEDIC SOLAR ASTRONOMY • 100% DETERMINISTIC CELESTIAL TIME</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 900,
          color: 'var(--walnut-ink)',
          lineHeight: 1.15,
          marginBottom: '1rem'
        }}>
          The Astronomical Chronometer of Fate.
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--sepia-medium)',
          maxWidth: '720px',
          margin: '0 auto 2rem',
          lineHeight: 1.6,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic'
        }}>
          “Every hour is ruled by a celestial lord. The ancients never negotiated in Rahu Kaalam, nor signed agreements outside of Budha Hora. We synchronize your Google Meet & Zoom appointments with the auspicious seconds of victory.”
        </p>

        {/* Vintage Brass Coordinate Tuner (City & Date) */}
        <div style={{
          display: 'inline-flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'center',
          background: 'var(--aged-paper-card)', border: '2px solid var(--ink-border-heavy)',
          padding: '0.9rem 1.6rem', borderRadius: '8px', boxShadow: '4px 4px 0px var(--ink-border-heavy)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="var(--antique-brass)" />
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sepia-faded)' }}>OBSERVATORY LOCATION</label>
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  const found = CITIES.find(c => c.name === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                style={{
                  background: 'transparent', border: 'none', borderBottom: '1px solid var(--ink-border-heavy)',
                  fontSize: '0.95rem', fontWeight: 800, color: 'var(--walnut-ink)', cursor: 'pointer', padding: '2px 0'
                }}
              >
                {CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.lat}° N, {c.lng}° E)</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', background: 'var(--ink-hairline)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--antique-brass)" />
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sepia-faded)' }}>CHRONO-DATE</label>
              <input 
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', borderBottom: '1px solid var(--ink-border-heavy)',
                  fontSize: '0.95rem', fontWeight: 800, color: 'var(--walnut-ink)', cursor: 'pointer', padding: '2px 0'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* THE MASTER HOROLOGICAL CLOCK & ASTROLABE STAGE */}
      <div className="container" style={{ maxWidth: '1040px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem', alignItems: 'center'
        }}>
          
          {/* LEFT: THE ASTRONOMICAL MASTER CLOCK */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{
              width: '320px', height: '320px', borderRadius: '50%',
              background: 'radial-gradient(circle, #fcf8ee 50%, #e2d6be 95%, #bfa15f 100%)',
              border: '6px solid var(--ink-border-heavy)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 8px 8px 0px var(--ink-border-heavy), 0 20px 40px rgba(0,0,0,0.15)',
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
                background: 'radial-gradient(circle, rgba(184, 147, 71, 0.12) 0%, transparent 80%)',
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
                background: 'radial-gradient(circle, #f5d77f 0%, #a48135 100%)',
                border: '2px solid var(--ink-border-heavy)',
                position: 'absolute', zIndex: 10
              }} />

            </div>

            {/* Pendulum underneath */}
            <div className="pendulum-anim" style={{ marginTop: '-15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '3px', height: '70px', background: 'var(--antique-brass)' }} />
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'radial-gradient(circle, #f5d77f 0%, #a48135 100%)',
                border: '2px solid var(--ink-border-heavy)',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.3)'
              }} />
            </div>

          </div>

          {/* RIGHT: VINTAGE CHRONO-REGISTER CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Card 1: Active Hour of Negotiation */}
            <div className="antique-card" style={{ padding: '1.5rem', background: '#ffffff', borderLeft: '6px solid var(--antique-brass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="wax-seal-tag" style={{ background: 'var(--aged-parchment)' }}>
                  ACTIVE PLANETARY HOUR
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--antique-brass)' }}>98% HARMONY</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--walnut-ink)', marginBottom: '0.2rem' }}>
                {activeHora ? activeHora.name : 'Mercury Hora (Budha)'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                The hour of trade, intellect, clear contracts, and persuasive articulation. Ideal for sales pitches and contract closures.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem',
                background: 'var(--aged-parchment)', padding: '0.3rem 0.7rem', borderRadius: '4px', border: '1px solid var(--ink-border-heavy)'
              }}>
                <Clock size={14} />
                <span>ACTIVE WINDOW: {formatTime(activeHora.start)} – {formatTime(activeHora.end)}</span>
              </div>
            </div>

            {/* Card 2: Rahu Kaalam Avoidance Decree */}
            <div className="antique-card" style={{ padding: '1.5rem', background: 'var(--wax-seal-bg)', borderLeft: '6px solid var(--wax-seal-crimson)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="wax-seal-tag" style={{ background: 'var(--wax-seal-crimson)', color: '#ffffff', borderColor: '#000' }}>
                  WAX SEAL AVOIDANCE DECREE
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--wax-seal-crimson)' }}>OCTANT {Math.round((vedicData.rahuKaalam.start - vedicData.sunriseMin) / vedicData.partDuration) + 1}/8</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--wax-seal-crimson)', marginBottom: '0.2rem' }}>
                Rahu Kaalam: {formatTime(vedicData.rahuKaalam.start)} – {formatTime(vedicData.rahuKaalam.end)}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#5c1b1b', lineHeight: 1.4 }}>
                Under ancient Vedic statutes, meetings initiated during this window encounter disputes, technical failures, or stalled contracts. Our engine guarantees no Google Meet will ever be booked here.
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button 
                onClick={onOpenScheduleModal}
                className="btn-brass"
              >
                <Zap size={16} />
                Open Appointment Ledger
              </button>

              <button 
                onClick={onOpenProofModal}
                className="btn-walnut"
              >
                <ShieldCheck size={16} color="var(--antique-brass)" />
                Examine Solar Physics
              </button>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
