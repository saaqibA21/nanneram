import React, { useState } from 'react';
import { 
  Sparkles, Compass, Clock, ShieldCheck, Copy, Check, Calendar, 
  Send, RefreshCw, Shirt, Award, AlertCircle, ChevronRight, Zap
} from 'lucide-react';
import { generateOracleConsultation } from '../utils/oracleConsultant';

export default function OracleChatbot({ 
  vedicData, 
  selectedCity, 
  optimalSlots = [], 
  onIssuePass,
  onAddToCalendar,
  triggerToast 
}) {
  const [prompt, setPrompt] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      label: 'VC Investor Pitch',
      text: 'Seed round pitch to lead partner at venture fund. Demanding $12M pre-money valuation without governance concessions. Leading with 3.2x ARR growth, enterprise pipeline, and 2-week commitment deadline.'
    },
    {
      label: 'Salary & Equity Hike',
      text: 'Annual executive compensation negotiation with VP. Demanding 35% base compensation increase plus 0.25% refresh equity. Quantifying infrastructure revenue impact, anchoring high, and using strategic silence.'
    },
    {
      label: 'Enterprise Contract Close',
      text: 'Final commercial sign-off with enterprise CFO. Target: Close $85,000 annual contract before quarter-end without price discounting, trading scope for multi-year lock-in.'
    },
    {
      label: 'Co-Founder Demarcation',
      text: 'Equity & operational ownership realignment with co-founder. Establishing clear CEO decision-making primacy and formalizing 4-year milestone vesting.'
    }
  ];

  const handleConsult = (customText = null) => {
    const inputVal = customText !== null ? customText : prompt;

    if (!inputVal || !inputVal.trim()) {
      triggerToast?.('Please describe your meeting or objective.');
      return;
    }

    setIsConsulting(true);
    setConsultation(null);

    // Astronomical calculation suspense
    setTimeout(() => {
      const result = generateOracleConsultation({
        prompt: inputVal.trim(),
        vedicData,
        selectedCity,
        optimalSlots
      });
      setConsultation(result);
      setIsConsulting(false);
      triggerToast?.('Astronomical Consultation Folio issued!');
    }, 900);
  };

  const handleApplyPreset = (p) => {
    setPrompt(p.text);
    handleConsult(p.text);
  };

  const copyFolioText = () => {
    if (!consultation) return;
    const text = 
      `📜 NANNERAM ROYAL CONSULTATION DECREE\n` +
      `Objective: ${consultation.topic}\n` +
      `Target Goal: ${consultation.goal}\n` +
      `Observatory: ${consultation.city} • Date: ${consultation.dateStr}\n\n` +
      `✦ SACRED TIMING WINDOW:\n` +
      `• Auspicious Hours: ${consultation.slot.startTimeFormatted} – ${consultation.slot.endTimeFormatted}\n` +
      `• Graceful Exit Timestamp: ${consultation.slot.gracefulExitWindow} (Sharp conclusion)\n` +
      `• Active Transit: ${consultation.attire.planet}\n` +
      `• Solar Shadow Check: ${consultation.rahuAvoidance}\n\n` +
      `✦ PRESCRIBED ATTIRE & COLOR ASTROLOGY:\n` +
      `• Primary Palette: ${consultation.attire.recommendedPalette}\n` +
      `• Forbidden Colors: ${consultation.attire.avoidColors}\n` +
      `• Recommended Fabric: ${consultation.attire.fabrics}\n` +
      `• Metal & Timepiece: ${consultation.attire.metalAndWatch}\n\n` +
      `✦ DIRECTION OF POWER (SEATING):\n` +
      `• Face: ${consultation.attire.direction}\n` +
      `• Alignment: ${consultation.attire.directionMeaning}\n\n` +
      `✦ OPENING VERBAL HOOK:\n` +
      `${consultation.openingScript}\n\n` +
      `✦ DESK RITUAL:\n` +
      `${consultation.deskRitual}\n\n` +
      `*Timed & Calibrated via Nanneram AI Horologium*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerToast?.('Consultation parchment copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="oracle-advisor-section" style={{
      background: 'linear-gradient(180deg, #1c150f 0%, #150f0a 100%)',
      color: '#f4ebd8',
      padding: 'clamp(3rem, 6vw, 4.5rem) clamp(1rem, 4vw, 1.5rem)',
      borderBottom: '2.5px solid var(--ink-border-heavy)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Kala Bhairava in Modern Attire — Left Side Background Oracle Art */}
      <div className="oracle-left-bg" style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 'clamp(340px, 46vw, 680px)',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <img
          src="/assets/kala-bhairava-advisor.jpeg"
          alt=""
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            opacity: 0.45,
            filter: 'sepia(0.2) contrast(1.1) brightness(0.85)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.25) 78%, transparent 100%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.25) 78%, transparent 100%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'destination-in'
          }}
        />
        {/* Deep ambient walnut fade overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(28, 21, 15, 0.2) 0%, rgba(28, 21, 15, 0.6) 65%, #1c150f 100%)'
        }} />
      </div>

      {/* Decorative Gold Astrolabe Watermark */}
      <div style={{
        position: 'absolute', right: '-80px', top: '10%', width: '380px', height: '380px',
        borderRadius: '50%', border: '1px dashed rgba(215, 169, 79, 0.12)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div className="container" style={{ maxWidth: '1080px', position: 'relative', zIndex: 1 }}>

        {/* Header Title & Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 5.5vw, 3rem)',
            fontFamily: 'var(--font-antique-serif)',
            fontWeight: 900,
            color: '#fbf4e6',
            letterSpacing: '0.02em',
            lineHeight: 1.15
          }}>
            The Royal Vedic Meeting & Attire Advisor
          </h2>

          <p style={{
            color: '#c5b8a5',
            fontSize: 'clamp(0.92rem, 3vw, 1.05rem)',
            maxWidth: '720px',
            margin: '0.75rem auto 0',
            lineHeight: 1.6,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            padding: '0 0.5rem'
          }}>
            Describe your high-stakes encounter, your desired conquest, and your chosen tactic. The Oracle computes your supreme astronomical window, prescribes the exact color attire to wear, dictates your directional power orientation, and scripts your opening move.
          </p>
        </div>

        {/* Guided Archetype Presets */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{
            display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
            color: 'var(--antique-brass-light)', marginBottom: '0.6rem', fontFamily: 'var(--font-antique-serif)',
            letterSpacing: '1px'
          }}>
            ✦ Select an Auspicious Scenario to Autocomplete:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="wax-seal-tag"
                style={{
                  background: 'rgba(255,255,255,0.06)', color: '#f5edd6',
                  borderColor: 'rgba(215, 169, 79, 0.35)', cursor: 'pointer',
                  padding: '0.4rem 0.85rem'
                }}
              >
                <Zap size={12} color="var(--antique-brass-light)" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Consultation Form Console */}
        <div className="antique-card" style={{
          background: '#231a13', border: '2px solid rgba(215, 169, 79, 0.4)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.45)', padding: 'clamp(1.25rem, 4vw, 2rem)',
          marginBottom: '2.5rem'
        }}>

          {/* Single Unified Meeting Brief Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase',
              color: 'var(--antique-brass-light)', marginBottom: '0.6rem', fontFamily: 'var(--font-antique-serif)',
              letterSpacing: '1px'
            }}>
              Describe Your Meeting, Counterparty & Desired Outcome
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. VC Pitch with Benchmark lead partner. Aiming for $12M pre-money valuation term sheet without governance concessions. Leading with 3.2x ARR growth, enterprise pipeline, and a 2-week commitment deadline..."
              style={{
                width: '100%', padding: '0.9rem 1.1rem', background: '#17110c',
                border: '1.5px solid rgba(215, 169, 79, 0.35)', borderRadius: '8px',
                color: '#f8f2e4', fontSize: '0.92rem', fontWeight: 500, lineHeight: 1.6,
                resize: 'vertical', fontFamily: 'inherit',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.45)'
              }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#bcaea0', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              ✦ Calibrated to {selectedCity.name} Solar Coordinates & Active Ephemeris
            </div>

            <button
              onClick={() => handleConsult()}
              disabled={isConsulting}
              className="btn-brass"
              style={{
                padding: '0.85rem 1.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                opacity: isConsulting ? 0.7 : 1, cursor: isConsulting ? 'wait' : 'pointer'
              }}
            >
              {isConsulting ? (
                <>
                  <RefreshCw size={16} className="pendulum-anim" />
                  <span>Consulting Ephemeris...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Summon Astrological Decree</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* CONSULTATION OUTPUT DECREE */}
        {consultation && (
          <div className="antique-card" style={{
            background: '#faf4e6', color: '#1f1813', border: '3px solid var(--ink-border-heavy)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            borderRadius: '12px'
          }}>

            {/* Decree Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              borderBottom: '2px solid var(--ink-border-heavy)', paddingBottom: '1.2rem',
              marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem'
            }}>
              <div>
                <span className="wax-seal-tag" style={{ background: 'var(--antique-brass)', color: '#171109', marginBottom: '0.4rem' }}>
                  ★ ROYAL EPHEMERIS DECREE
                </span>
                <h3 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', color: 'var(--walnut-ink)' }}>
                  {consultation.topic}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  Mandate issued for {consultation.city} on {consultation.dateStr}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={copyFolioText}
                  className="btn-walnut" 
                  style={{ fontSize: '0.78rem', padding: '0.55rem 1rem' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Decree Copied' : 'Copy Parchment'}
                </button>
              </div>
            </div>

            {/* Grid of 4 Key Astrological Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Card 1: Sacred Timing & Exit Window */}
              <div style={{ background: '#ffffff', border: '2px solid var(--ink-border-heavy)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <Clock size={18} color="var(--antique-brass)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-antique-serif)' }}>
                    I. Certified Meeting Window
                  </span>
                </div>

                <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', color: 'var(--walnut-ink)', marginBottom: '0.4rem' }}>
                  {consultation.slot.startTimeFormatted} – {consultation.slot.endTimeFormatted}
                </div>

                <div style={{
                  background: 'var(--aged-parchment-light)', padding: '0.5rem 0.75rem', borderRadius: '4px',
                  border: '1px solid var(--ink-border-heavy)', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.75rem'
                }}>
                  <strong style={{ color: 'var(--wax-seal-crimson)' }}>Graceful Exit:</strong> {consultation.slot.gracefulExitWindow} (Sharp conclusion before planetary shift)
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--sepia-medium)', lineHeight: 1.4 }}>
                  <strong>Rahu Kaalam Avoidance:</strong> {consultation.rahuAvoidance}
                </p>
              </div>

              {/* Card 2: Attire & Dress Color Astrology */}
              <div style={{ background: '#ffffff', border: '2px solid var(--ink-border-heavy)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <Shirt size={18} color="var(--antique-brass)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-antique-serif)' }}>
                    II. Prescribed Attire & Colors
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {consultation.attire.colorSwatches.map((hex, i) => (
                      <div 
                        key={i} 
                        style={{
                          width: '22px', height: '22px', borderRadius: '50%', background: hex,
                          border: '1.5px solid #000', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} 
                        title={hex}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--walnut-ink)' }}>
                    {consultation.attire.primaryColor}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--sepia-medium)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                  <strong>Wear:</strong> {consultation.attire.recommendedPalette}.
                </p>

                <p style={{ fontSize: '0.78rem', color: '#781d1d', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                  <strong>Avoid:</strong> {consultation.attire.avoidColors}
                </p>

                <p style={{ fontSize: '0.78rem', color: 'var(--sepia-faded)' }}>
                  <strong>Jewelry/Watch:</strong> {consultation.attire.metalAndWatch}
                </p>
              </div>

              {/* Card 3: Seating Orientation & Power Direction */}
              <div style={{ background: '#ffffff', border: '2px solid var(--ink-border-heavy)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <Compass size={18} color="var(--antique-brass)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-antique-serif)' }}>
                    III. Seating Direction of Power
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)', color: 'var(--antique-brass-deep)' }}>
                    Face {consultation.attire.direction}
                  </span>
                  <span className="wax-seal-tag" style={{ background: 'var(--patina-sage)', color: '#fff', fontSize: '0.65rem' }}>
                    VASTU-ALIGNED
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--sepia-medium)', lineHeight: 1.45 }}>
                  {consultation.attire.directionMeaning}
                </p>
              </div>

              {/* Card 4: Desk Ritual & Virtual Ambience */}
              <div style={{ background: '#ffffff', border: '2px solid var(--ink-border-heavy)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <Award size={18} color="var(--antique-brass)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-antique-serif)' }}>
                    IV. Desk Ritual & Ambience
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', lineHeight: 1.5, marginBottom: '0.75rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  “{consultation.deskRitual}”
                </p>

                <div style={{ fontSize: '0.76rem', color: 'var(--sepia-faded)' }}>
                  <strong>Active Energy:</strong> {consultation.attire.energy}
                </div>
              </div>

            </div>

            {/* Psychological Opening Script Banner */}
            <div style={{
              background: '#f3e8d2', border: '2px solid var(--ink-border-heavy)',
              borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem'
            }}>
              <span style={{
                fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px',
                color: 'var(--antique-brass-deep)', display: 'block', marginBottom: '0.5rem'
              }}>
                ✦ VERBAL OPENING SCRIPT (FIRST 90 SECONDS):
              </span>
              <p style={{
                fontSize: '1.05rem', color: 'var(--walnut-ink)', lineHeight: 1.6,
                fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, marginBottom: '0.8rem'
              }}>
                {consultation.openingScript}
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--sepia-medium)', lineHeight: 1.5 }}>
                <strong>Tactical Execution:</strong> {consultation.tacticalAdvice}
              </p>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  if (onIssuePass) onIssuePass(consultation.slot);
                }}
                className="btn-brass"
                style={{ fontSize: '0.82rem', padding: '0.65rem 1.4rem' }}
              >
                Issue Conference Pass
              </button>

              <button
                onClick={copyFolioText}
                className="btn-walnut"
                style={{ fontSize: '0.82rem', padding: '0.65rem 1.4rem' }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Decree Copied' : 'Copy Full Decree'}
              </button>
            </div>

          </div>
        )}

      </div>

    </section>
  );
}
