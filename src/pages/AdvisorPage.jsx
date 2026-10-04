import React, { useState } from 'react';
import { Copy, Check, Clock, Shirt, Compass, Armchair, Zap } from 'lucide-react';
import { generateOracleConsultation } from '../utils/oracleConsultant';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/layout/PageHeader';
import SlotCard from '../components/SlotCard';

const CLASSIC_SCENARIOS = [
  {
    label: 'VC investor pitch',
    text: 'Seed round pitch to lead partner at venture fund. Demanding $12M pre-money valuation without governance concessions. Leading with 3.2x ARR growth, enterprise pipeline, and 2-week commitment deadline.'
  },
  {
    label: 'Salary and equity raise',
    text: 'Annual executive compensation negotiation with VP. Demanding 35% base compensation increase plus 0.25% refresh equity. Quantifying infrastructure revenue impact, anchoring high, and using strategic silence.'
  },
  {
    label: 'Enterprise contract close',
    text: 'Final commercial sign-off with enterprise CFO. Target: Close $85,000 annual contract before quarter-end without price discounting, trading scope for multi-year lock-in.'
  },
  {
    label: 'Co-founder conversation',
    text: 'Equity & operational ownership realignment with co-founder. Establishing clear CEO decision-making primacy and formalizing 4-year milestone vesting.'
  }
];

const GENZ_SCENARIOS = [
  {
    label: '💖 Texting my crush',
    text: 'Sliding into my crush’s DMs after they posted a story. Want maximum rizz, witty banter, and zero awkward left-on-read energy.'
  },
  {
    label: '👻 Re-texting after no reply / read',
    text: 'My crush didn’t reply to my previous text. Still left on read. When to re-text, what exact line to send to reset momentum, and how to keep my aura high?'
  },
  {
    label: '👨‍👩‍👧 Asking parents for permission & cash',
    text: 'Asking my strict parents for permission to go on a weekend road trip with friends and loan me $150. Need maximum generosity mode and zero anger.'
  },
  {
    label: '📚 Exam cramming & submission',
    text: 'Need 3 hours of hyper-focused study cramming before my final exam, plus the exact golden minute to submit my assignment without wifi glitches or mistakes.'
  },
  {
    label: '🎮 Ranked gaming clutch lobby',
    text: 'Playing competitive ranked placement matches in Valorant with my squad. Need peak reflex speed, clutch focus, and zero tilt or rage-quits.'
  }
];

function buildCopyText(c, isGenZ = false) {
  let scriptsBlock = '';
  if (c.openingOptions && c.openingOptions.length > 1) {
    scriptsBlock = c.openingOptions
      .map(o => `• ${o.label}:\n  ${o.script}\n  (Why: ${o.why})`)
      .join('\n\n');
  } else {
    scriptsBlock = c.openingScript;
  }

  return (
    `${isGenZ ? '⚡ NANNERAM AURA & TACTICAL PLAYBOOK' : 'NANNERAM ADVICE DECREE'}\n` +
    `Situation: ${c.topic}\n` +
    `City: ${c.city} · Date: ${c.dateStr}\n\n` +
    `${isGenZ ? 'CERTIFIED AURA WINDOW' : 'TIMING'}\n` +
    (c.slot
      ? `• Window: ${c.slot.startTimeFormatted} – ${c.slot.endTimeFormatted} (${c.city} time)\n` +
        `• Action window: ${c.slot.gracefulExitWindow}\n` +
        `• Ruling energy: ${c.attire.planet}\n` +
        `• Alignment: ${c.slot.recommendation}\n`
      : `• No clear window found on this date. Try another date.\n`) +
    `• Chaos Hour (Rahu Kaalam) to avoid: ${c.rahuAvoidance}\n\n` +
    `${isGenZ ? 'DRIP & PSYCHOLOGY FRAME' : 'PRESENTATION & ATTIRE'}\n` +
    `• Palette: ${c.attire.recommendedPalette}\n` +
    `• Avoid: ${c.attire.avoidColors}\n` +
    `• Details: ${c.attire.fabrics}\n` +
    `• Protocol: ${c.attire.metalAndWatch}\n\n` +
    `${isGenZ ? 'POWER DIRECTION' : 'WHICH WAY TO FACE'}\n` +
    `• ${c.attire.direction}: ${c.attire.directionMeaning}\n\n` +
    `${isGenZ ? 'TACTICAL SCRIPTS / OPENERS' : 'OPENING SCRIPTS'}\n${scriptsBlock}\n\n` +
    `${isGenZ ? 'THE TACTICAL PLAYBOOK' : 'HOW TO RUN IT'}\n${c.tacticalAdvice}\n\n` +
    `${isGenZ ? 'VIBE & ENVIRONMENT PROTOCOL' : 'SETTING & ENVIRONMENT'}\n${c.deskRitual}`
  );
}

export default function AdvisorPage() {
  const { vedicData, selectedCity, triggerToast, appMode } = useApp();
  const isGenZ = appMode === 'genz';
  const scenarios = isGenZ ? GENZ_SCENARIOS : CLASSIC_SCENARIOS;

  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const consult = (text) => {
    const value = (text ?? prompt).trim();
    if (!value) {
      triggerToast(isGenZ ? 'Describe your situation or drama first.' : 'Describe your meeting first.');
      return;
    }
    setResult(generateOracleConsultation({ prompt: value, vedicData, selectedCity }));
    setCopied(false);
  };

  const applyScenario = (s) => {
    setPrompt(s.text);
    consult(s.text);
  };

  const copyAdvice = () => {
    if (!result) return;
    navigator.clipboard.writeText(buildCopyText(result, isGenZ)).then(
      () => {
        setCopied(true);
        triggerToast(isGenZ ? 'Aura playbook copied.' : 'Advice copied.');
        setTimeout(() => setCopied(false), 2500);
      },
      () => triggerToast('Could not copy. Your browser blocked clipboard access.')
    );
  };

  return (
    <div className="page container">
      <PageHeader
        title={isGenZ ? '⚡ Aura & Rizz Advisor' : 'Meeting advisor'}
        description={
          isGenZ
            ? 'Describe your high-stakes situation (crush, strict parents, exam cram, gaming lobby). The Oracle calculates your peak aura window, what drip to wear, which way to face, and your opening text.'
            : 'Describe the meeting. You get the best window on the selected date, what to wear, which way to face, and how to open. The advice comes from fixed traditional rules, not a live AI model.'
        }
        withContext
      />

      <div className="advisor-intro">
        <section className="card card-pad-lg field-group" style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <span className="field-label">{isGenZ ? 'Pick a scenario to autofill' : 'Start from an example'}</span>
            <div className="chips" style={{ marginTop: '0.5rem' }}>
              {scenarios.map((s) => (
                <button key={s.label} className="chip" onClick={() => applyScenario(s)}>
                  <Zap size={13} /> {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="brief">
              {isGenZ
                ? 'Your situation, who it is with, and what you want to happen'
                : 'Your meeting, who it is with, and what you want from it'}
            </label>
            <textarea
              id="brief"
              className="textarea"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isGenZ
                  ? 'e.g. Asking my strict parents for permission to go on a weekend trip with friends and loan me $150. Need maximum generosity mode and zero anger...'
                  : 'e.g. Pitch to the lead partner at a seed fund. Asking for a term sheet at a $12M pre-money valuation.'
              }
            />
          </div>

          <div className="advisor-submit-row">
            <span className="small muted">Uses {selectedCity.name} solar ephemeris for {vedicData.dayName}.</span>
            <button className="btn btn-primary" onClick={() => consult()}>
              {isGenZ ? '⚡ Calculate Aura Playbook' : 'Get advice'}
            </button>
          </div>
        </section>

        <div className="portrait" aria-hidden="true">
          <img src="/assets/kala-bhairava-advisor.jpeg" alt="" loading="lazy" />
        </div>
      </div>

      {result && (
        <section className="decree section" aria-labelledby="advice-h" aria-live="polite">
          <div className="decree-head">
            <div>
              <span className="eyebrow">{result.city} · {result.dateStr}</span>
              <h2 id="advice-h" style={{ marginTop: '0.2rem' }}>Your meeting advice</h2>
              <p className="small muted" style={{ maxWidth: '70ch', marginTop: '0.25rem' }}>
                "{result.topic.length > 140 ? `${result.topic.slice(0, 140)}…` : result.topic}"
              </p>
            </div>
            <button className="btn btn-secondary" onClick={copyAdvice}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy all'}
            </button>
          </div>

          {result.slot ? (
            <SlotCard slot={result.slot} purpose={result.topic.slice(0, 60)} badge={isGenZ ? "👑 Peak Aura Window" : "Recommended window"} featured hideLinkWarning />
          ) : (
            <div className="card empty">
              <h3>No clear window on this date</h3>
              <p>Pick another date above and ask again. The rest of the advice below still applies.</p>
            </div>
          )}

          <div className="grid-2">
            <article className="card card-pad-lg">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Shirt size={18} /> {
                  result.contextType === 'digital_messaging'
                    ? (isGenZ ? '⚡ Aura & Digital Composure' : 'Vibe & Digital Frame')
                    : result.contextType === 'study_sprint'
                    ? (isGenZ ? '🧠 Cognitive Drip & Monk Mode' : 'Study Attire & Focus Setup')
                    : result.contextType === 'gaming'
                    ? (isGenZ ? '🎮 Clutch Drip & Ergonomics' : 'Gaming Gear & Posture')
                    : (isGenZ ? 'Drip & Attire Strategy' : 'What to wear')
                }
              </h3>
              <div className="swatches" style={{ marginBottom: '0.75rem' }}>
                {result.attire.colorSwatches.map((hex) => (
                  <span key={hex} className="swatch" style={{ background: hex }} title={hex} />
                ))}
              </div>
              <dl className="kv">
                <div><dt>{result.contextType === 'digital_messaging' ? (isGenZ ? 'Aesthetic Palette' : 'Colours') : 'Colours'}</dt><dd>{result.attire.recommendedPalette}</dd></div>
                <div><dt>Avoid</dt><dd>{result.attire.avoidColors}</dd></div>
                <div><dt>{result.contextType === 'digital_messaging' ? (isGenZ ? 'Physical Frame' : 'Comfort & Posture') : result.contextType === 'study_sprint' ? 'Layers & Comfort' : result.contextType === 'gaming' ? 'Jersey & Mobility' : 'Fabric'}</dt><dd>{result.attire.fabrics}</dd></div>
                <div><dt>{result.contextType === 'digital_messaging' ? (isGenZ ? 'Device & Notification Rule' : 'Device protocol') : result.contextType === 'study_sprint' ? 'Analog Tool' : result.contextType === 'gaming' ? 'Wrist & Gear' : 'Metal and watch'}</dt><dd>{result.attire.metalAndWatch}</dd></div>
              </dl>
            </article>

            <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
              <article className="card card-pad-lg">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Compass size={18} /> {isGenZ ? (result.contextType === 'digital_messaging' ? 'Power Direction While Typing' : 'Power Seating Direction') : 'Which way to face'}
                </h3>
                <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)' }}>{result.attire.direction}</p>
                <p className="small">{result.attire.directionMeaning}</p>
              </article>

              <article className="card card-pad-lg">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Armchair size={18} /> {isGenZ ? 'Vibe & Setting Protocol' : 'Setting & Environment'}
                </h3>
                <p className="small">{result.deskRitual}</p>
                <p className="small muted" style={{ marginTop: '0.5rem' }}>Energy: {result.attire.energy}</p>
              </article>

              <article className="card card-pad-lg">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={18} /> Avoid
                </h3>
                <p className="small">Rahu Kaalam: {result.rahuAvoidance.replace(' (avoid this window)', '')}</p>
              </article>
            </div>
          </div>

          <article className="card card-pad-lg">
            <span className="eyebrow">{isGenZ ? '⚡ Tactical Scripts & High-Aura Openers' : 'Opening scripts & options'}</span>
            
            {result.openingOptions && result.openingOptions.length > 1 ? (
              <div style={{ display: 'grid', gap: '0.9rem', margin: '0.75rem 0 1.5rem' }}>
                {result.openingOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--copper, #d97706)' }}>
                        {opt.label}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem' }}
                        onClick={() => {
                          navigator.clipboard.writeText(opt.script.replace(/^"|"$/g, ''));
                          triggerToast('Script copied to clipboard!');
                        }}
                      >
                        <Copy size={13} /> Copy text
                      </button>
                    </div>
                    <blockquote className="quote" style={{ margin: '0 0 0.45rem', fontSize: '1.02rem', fontStyle: 'italic', color: 'var(--ink)' }}>
                      {opt.script}
                    </blockquote>
                    <p className="small muted" style={{ margin: 0, fontSize: '0.82rem' }}>
                      💡 {opt.why}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <blockquote className="quote" style={{ margin: '0.6rem 0 1.25rem' }}>{result.openingScript}</blockquote>
            )}

            <span className="eyebrow">{isGenZ ? '🎯 The Tactical Playbook' : 'How to run it'}</span>
            <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-line', lineHeight: 1.68, fontSize: '0.95rem' }}>
              {result.tacticalAdvice}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}
