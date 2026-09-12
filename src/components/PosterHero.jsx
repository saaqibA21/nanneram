import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldAlert, Video, Check, Globe, Calendar, Clock, 
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { formatTime, CITIES } from '../utils/vedicTiming';

export default function PosterHero({
  vedicData,
  selectedCity,
  setSelectedCity,
  targetDateStr,
  setTargetDateStr,
  onOpenScheduleModal,
  onConnectCalendar,
  onOpenProofModal
}) {
  // Live simulated countdown for the sticker
  const [secondsLeft, setSecondsLeft] = useState(862); // ~14m 22s

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 862));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="poster-hero">
      
      {/* Top Banner Tag */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        background: '#000', color: '#fff', padding: '0.45rem 1.1rem', borderRadius: '999px',
        fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '1rem', zIndex: 5
      }}>
        <Sparkles size={14} color="var(--poster-yellow)" />
        <span>VEDIC ASTRONOMICAL ENGINE • NASA JPL BENCHMARK</span>
      </div>

      {/* GIANT TOP TITLE */}
      <div className="poster-title-top">
        ONLINE
      </div>

      {/* THE STAGE: PHONE + ORBITING STICKERS */}
      <div className="poster-stage">

        {/* 1. TOP-LEFT YELLOW STICKER (Like "SELLING FAST" in image) */}
        <div 
          className="floating-sticker sticker-yellow anim-float-a"
          style={{ top: '8%', left: '8%' }}
        >
          <div style={{ fontSize: '0.82rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            STRICT AVOIDANCE
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '0.2rem' }}>
            Rahu Kaalam: {formatTime(vedicData.rahuKaalam.start)}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.85 }}>
            Auto-blocked for all client calls
          </div>
        </div>

        {/* 2. TOP-RIGHT LAVENDER STICKER (Like "★ POPULAR" in image) */}
        <div 
          className="floating-sticker sticker-lavender anim-float-b"
          style={{ top: '6%', right: '9%', maxWidth: '210px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--poster-yellow)', fontWeight: 900, fontSize: '0.9rem'
            }}>
              ★
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>TOP TRANSIT</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>High Deal Velocity</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.3 }}>
            Mercury Hora gives <strong>+42% deal close rate</strong> in negotiations.
          </div>
        </div>

        {/* 3. MID-LEFT SETTINGS / COOKIE CARD (Like "Accept all cookies" in image) */}
        <div 
          className="floating-sticker anim-float-c"
          style={{
            top: '38%', left: '4%', background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '16px', padding: '1rem', width: '230px', boxShadow: '0 12px 35px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.6rem' }}>
            Automated Guardrails
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>+ Rahu Kaalam Blocker</span>
              <span style={{ width: '28px', height: '16px', background: '#000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '2px' }}>
                <span style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%' }} />
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>+ Mercury Hora Priority</span>
              <span style={{ width: '28px', height: '16px', background: '#000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '2px' }}>
                <span style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%' }} />
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>+ Google Meet Auto-Link</span>
              <span style={{ width: '28px', height: '16px', background: '#000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '2px' }}>
                <span style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%' }} />
              </span>
            </div>
          </div>

          <button 
            onClick={onConnectCalendar}
            style={{
              width: '100%', marginTop: '0.8rem', background: 'var(--poster-lavender)', color: '#000',
              fontWeight: 800, fontSize: '0.75rem', padding: '0.55rem', borderRadius: '8px', textTransform: 'uppercase'
            }}
          >
            Connect Calendar
          </button>
        </div>

        {/* 4. MID-RIGHT YELLOW COUNTDOWN CARD (Like "Flash Sale!" in image) */}
        <div 
          className="floating-sticker sticker-yellow anim-float-d"
          style={{ top: '44%', right: '5%', textAlign: 'center', width: '210px' }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 900 }}>
            ⏳ Golden Window Ending...
          </div>
          <div style={{
            fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace', margin: '0.4rem 0',
            letterSpacing: '1px', background: '#000', color: 'var(--poster-yellow)', padding: '0.3rem 0.5rem', borderRadius: '8px'
          }}>
            {formatCountdown(secondsLeft)}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>
            Wrap pitch before energy flips!
          </div>
        </div>

        {/* 5. BOTTOM-LEFT WHITE REVIEW BUBBLE (Like "So worth the money" in image) */}
        <div 
          className="floating-sticker sticker-review anim-float-a"
          style={{ bottom: '10%', left: '7%', maxWidth: '260px' }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem'
          }}>
            SR
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#000' }}>
              “Closed our $100k seed check at 3:22 PM sharp.”
            </div>
            <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Check size={12} /> Verified Founder
            </div>
          </div>
        </div>

        {/* 6. BOTTOM-RIGHT LAVENDER SHIPPING PILL (Like "Free Shipping" in image) */}
        <div 
          className="floating-sticker sticker-lavender anim-float-b"
          style={{ bottom: '12%', right: '8%' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 900 }}>
            <Video size={16} /> 1-Click Google Meet & Zoom
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.85, marginTop: '2px' }}>
            *Auto-timed with start & graceful exit
          </div>
        </div>

        {/* CENTERPIECE: THE SMARTPHONE MOCKUP */}
        <div className="phone-mockup">
          <div className="phone-screen">
            
            {/* Dynamic Island */}
            <div className="phone-island" />

            {/* Status Bar */}
            <div className="phone-status-bar">
              <span>9:41</span>
              <div style={{ display: 'flex', gap: '4px', fontSize: '0.7rem' }}>
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* In-Phone App Content */}
            <div style={{ padding: '0.5rem 0.85rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* Top Bar inside Phone */}
              <div style={{ textAlign: 'center', padding: '0.2rem 0 0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                  NANNERAM ✦ ONE-CLICK MEET
                </span>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                  Auspicious Cosmic Scheduler
                </div>
              </div>

              {/* City & Date selection inside phone */}
              <div style={{ display: 'flex', gap: '0.4rem', margin: '0.6rem 0' }}>
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const found = CITIES.find(c => c.name === e.target.value);
                    if (found) setSelectedCity(found);
                  }}
                  style={{
                    flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0',
                    color: '#000', borderRadius: '8px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600
                  }}
                >
                  {CITIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setTargetDateStr(new Date().toISOString().split('T')[0])}
                  style={{
                    background: '#000', color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                    padding: '0.35rem 0.6rem', borderRadius: '8px'
                  }}
                >
                  Today
                </button>
              </div>

              {/* Main Transit Card (Lavender style) */}
              <div style={{
                background: 'var(--poster-lavender)', borderRadius: '18px', padding: '0.85rem',
                marginBottom: '0.6rem', position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                    🟢 ACTIVE TRANSIT
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>98% MATCH</span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1.1, color: '#000', margin: '0.3rem 0' }}>
                  Mercury Hora (Budha)
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e1b4b', marginBottom: '0.4rem' }}>
                  Peak Deal & Contract Window
                </div>

                <div style={{ background: '#fff', padding: '0.4rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                  03:15 PM – 03:45 PM
                </div>
              </div>

              {/* Flash Countdown Card (Yellow style inside phone) */}
              <div style={{
                background: 'var(--poster-yellow)', borderRadius: '14px', padding: '0.7rem',
                textAlign: 'center', marginBottom: '0.6rem'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>
                  Golden Window Active
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#422006' }}>
                  Graceful exit countdown:
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 900, margin: '0.2rem 0',
                  background: '#000', color: 'var(--poster-yellow)', borderRadius: '6px', padding: '2px 6px', display: 'inline-block'
                }}>
                  {formatCountdown(secondsLeft)}
                </div>
              </div>

              {/* Schedule CTA inside phone */}
              <button 
                onClick={onOpenScheduleModal}
                style={{
                  marginTop: 'auto', background: '#000', color: '#fff',
                  fontWeight: 800, fontSize: '0.78rem', padding: '0.75rem', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                <Video size={14} color="var(--poster-yellow)" />
                AUTO-SCHEDULE MEET
              </button>

            </div>

          </div>
        </div>

      </div>

      {/* GIANT BOTTOM TITLE */}
      <div className="poster-title-bottom">
        MEETINGS
      </div>

      {/* Quick Jump Bar below poster */}
      <div style={{
        marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
        alignItems: 'center', justifyContent: 'center', zIndex: 10
      }}>
        <button 
          onClick={onOpenScheduleModal}
          style={{
            background: '#000', color: '#fff', fontWeight: 800, fontSize: '0.92rem',
            padding: '0.85rem 1.8rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.6rem'
          }}
        >
          <Zap size={18} color="var(--poster-yellow)" />
          Try Live Meeting Scheduler
        </button>

        <button 
          onClick={onOpenProofModal}
          style={{
            background: '#fff', color: '#000', border: '2px solid #000', fontWeight: 800, fontSize: '0.92rem',
            padding: '0.85rem 1.6rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.6rem'
          }}
        >
          <ShieldCheck size={18} />
          View Astronomical Math
        </button>
      </div>

    </section>
  );
}
