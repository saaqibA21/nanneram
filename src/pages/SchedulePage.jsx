import React, { useMemo } from 'react';
import { CheckCircle2, CircleAlert, Info } from 'lucide-react';
import { findOptimalMeetingSlots, formatTime } from '../utils/vedicTiming';
import { describeZoomRoom } from '../utils/zoomIntegration';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/layout/PageHeader';
import Segmented from '../components/ui/Segmented';
import SlotCard from '../components/SlotCard';

const formatLongDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

const CLASSIC_PRESETS = [
  'VC Pitch / Investor Call',
  'Salary / Compensation Negotiation',
  'Client Contract Sign-off',
  'Executive Hiring Interview',
  'Creative UX / Brand Review'
];

const GENZ_PRESETS = [
  'Texting Crush / DM Drop',
  'Asking Parents for Permission / Cash',
  'Study & Exam Cram Sprint',
  'Ranked Gaming Clutch Match',
  'Photo Dump / Story Post Timing'
];

export default function SchedulePage() {
  const {
    vedicData: v, selectedCity,
    meetingPurpose, setMeetingPurpose, durationMins, setDurationMins,
    platform, setPlatform, zoomConfig, gmeetLink, openZoomSetup, openGmeetSetup,
    appMode
  } = useApp();
  const isGenZ = appMode === 'genz';
  const presets = isGenZ ? GENZ_PRESETS : CLASSIC_PRESETS;

  const slots = useMemo(
    () => findOptimalMeetingSlots(v, meetingPurpose, durationMins),
    [v, meetingPurpose, durationMins]
  );

  const linkReady = platform === 'Zoom' ? zoomConfig.connected : Boolean(gmeetLink);
  const linkText = platform === 'Zoom'
    ? (zoomConfig.connected ? describeZoomRoom(zoomConfig) : 'No Zoom room set')
    : (gmeetLink ? gmeetLink.replace(/^https?:\/\/(meet\.google\.com\/)?/, '') : 'No Meet room set');

  return (
    <div className="page container">
      <PageHeader
        title={isGenZ ? "Find Your Peak Aura Slot" : "Schedule a meeting"}
        description={isGenZ
          ? "Pick your mission and duration. Nanneram filters out Rahu Kaalam chaos and Yamagandam tilt, pairing your move with the most powerful planetary Hora."
          : "Choose the kind of meeting and how long it runs. Nanneram skips Rahu Kaalam and Yamagandam and ranks the best slots between 9 AM and 7 PM."
        }
        withContext
      />

      <div className="split">
        <aside className="panel" aria-label="Meeting details">
          <section className="card card-pad-lg field-group">
            <h2 className="panel-title">{isGenZ ? "1. What is the move?" : "1. What is the meeting?"}</h2>
            <div className="chips" role="group" aria-label="Meeting type">
              {presets.map((p) => (
                <button key={p} className="chip" aria-pressed={meetingPurpose === p} onClick={() => setMeetingPurpose(p)}>
                  {p}
                </button>
              ))}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="purpose">{isGenZ ? "Or describe your scenario" : "Or describe it"}</label>
              <input
                id="purpose"
                className="input"
                value={meetingPurpose}
                onChange={(e) => setMeetingPurpose(e.target.value)}
                placeholder={isGenZ ? "e.g. Asking dad for car keys, texting crush" : "e.g. Partnership call with a supplier"}
              />
              <span className="hint">
                {isGenZ
                  ? "Keywords like crush, text, parents, exam, clutch, pitch or interview adjust planet suitability."
                  : "Words like pitch, salary, contract, interview or design change which Hora is preferred."}
              </span>
            </div>
          </section>

          <section className="card card-pad-lg field-group">
            <h2 className="panel-title">{isGenZ ? "2. How long do you need?" : "2. How long?"}</h2>
            <Segmented
              label="Duration"
              value={durationMins}
              onChange={setDurationMins}
              options={[15, 30, 45, 60].map((m) => ({ value: m, label: `${m} min` }))}
            />
          </section>

          <section className="card card-pad-lg field-group">
            <h2 className="panel-title">{isGenZ ? "3. Platform / Room" : "3. Where will you meet?"}</h2>
            <Segmented
              label="Video platform"
              value={platform}
              onChange={setPlatform}
              options={[{ value: 'Google Meet', label: 'Google Meet' }, { value: 'Zoom', label: 'Zoom' }]}
            />
            <div className="link-status">
              <span className="label">
                {linkReady ? <CheckCircle2 size={16} className="status-on" /> : <CircleAlert size={16} className="status-off" />}
                <span>{linkText}</span>
              </span>
              <button className="link-btn" onClick={platform === 'Zoom' ? openZoomSetup : openGmeetSetup}>
                {linkReady ? 'Change' : 'Set up'}
              </button>
            </div>
          </section>
        </aside>

        <section className="results" aria-labelledby="results-h" aria-live="polite">
          <div className="results-head">
            <div>
              <h2 id="results-h">{isGenZ ? `Peak aura times on ${formatLongDate(v.date)}` : `Best times on ${formatLongDate(v.date)}`}</h2>
              <p className="small muted">{selectedCity.name} time · {durationMins}-minute {platform} call</p>
            </div>
          </div>

          <p className="note">
            <Info size={14} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />
            {isGenZ
              ? `Filtered out: Rahu Kaalam (${formatTime(v.rahuKaalam.start)} – ${formatTime(v.rahuKaalam.end)}) & Yamagandam (${formatTime(v.yamagandam.start)} – ${formatTime(v.yamagandam.end)}). All slots begin during an auspicious Gowri alignment.`
              : `Skipped: Rahu Kaalam ${formatTime(v.rahuKaalam.start)} – ${formatTime(v.rahuKaalam.end)} and Yamagandam ${formatTime(v.yamagandam.start)} – ${formatTime(v.yamagandam.end)}. Slots also start in a favourable Gowri part.`}
          </p>

          {slots.length === 0 ? (
            <div className="card empty">
              <h3>{isGenZ ? "No god-tier slots on this day" : "No good slot on this day"}</h3>
              <p>{isGenZ ? "Try another date or pick a shorter duration window." : "Try another date or a shorter meeting length."}</p>
            </div>
          ) : (
            slots.map((slot, i) => (
              <SlotCard
                key={slot.startMin}
                slot={slot}
                purpose={meetingPurpose}
                featured={i === 0}
                badge={i === 0 ? (isGenZ ? '👑 Peak W' : 'Best match') : `Option ${i + 1}`}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
