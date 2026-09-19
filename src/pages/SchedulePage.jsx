import React, { useMemo } from 'react';
import { CheckCircle2, CircleAlert, Info } from 'lucide-react';
import { findOptimalMeetingSlots, formatTime } from '../utils/vedicTiming';
import { describeZoomRoom } from '../utils/zoomIntegration';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/layout/PageHeader';
import Segmented from '../components/ui/Segmented';
import SlotCard from '../components/SlotCard';

const formatLongDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

const PRESETS = [
  'VC Pitch / Investor Call',
  'Salary / Compensation Negotiation',
  'Client Contract Sign-off',
  'Executive Hiring Interview',
  'Creative UX / Brand Review'
];

export default function SchedulePage() {
  const {
    vedicData: v, selectedCity,
    meetingPurpose, setMeetingPurpose, durationMins, setDurationMins,
    platform, setPlatform, zoomConfig, gmeetLink, openZoomSetup, openGmeetSetup
  } = useApp();

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
        title="Schedule a meeting"
        description="Choose the kind of meeting and how long it runs. Nanneram skips Rahu Kaalam and Yamagandam and ranks the best slots between 9 AM and 7 PM."
        withContext
      />

      <div className="split">
        <aside className="panel" aria-label="Meeting details">
          <section className="card card-pad-lg field-group">
            <h2 className="panel-title">1. What is the meeting?</h2>
            <div className="chips" role="group" aria-label="Meeting type">
              {PRESETS.map((p) => (
                <button key={p} className="chip" aria-pressed={meetingPurpose === p} onClick={() => setMeetingPurpose(p)}>
                  {p}
                </button>
              ))}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="purpose">Or describe it</label>
              <input
                id="purpose"
                className="input"
                value={meetingPurpose}
                onChange={(e) => setMeetingPurpose(e.target.value)}
                placeholder="e.g. Partnership call with a supplier"
              />
              <span className="hint">Words like pitch, salary, contract, interview or design change which Hora is preferred.</span>
            </div>
          </section>

          <section className="card card-pad-lg field-group">
            <h2 className="panel-title">2. How long?</h2>
            <Segmented
              label="Duration"
              value={durationMins}
              onChange={setDurationMins}
              options={[15, 30, 45, 60].map((m) => ({ value: m, label: `${m} min` }))}
            />
          </section>

          <section className="card card-pad-lg field-group">
            <h2 className="panel-title">3. Where will you meet?</h2>
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
              <h2 id="results-h">Best times on {formatLongDate(v.date)}</h2>
              <p className="small muted">{selectedCity.name} time · {durationMins}-minute {platform} call</p>
            </div>
          </div>

          <p className="note">
            <Info size={14} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />
            Skipped: Rahu Kaalam {formatTime(v.rahuKaalam.start)} – {formatTime(v.rahuKaalam.end)} and
            Yamagandam {formatTime(v.yamagandam.start)} – {formatTime(v.yamagandam.end)}. Slots also start in a favourable Gowri part.
          </p>

          {slots.length === 0 ? (
            <div className="card empty">
              <h3>No good slot on this day</h3>
              <p>Try another date or a shorter meeting length.</p>
            </div>
          ) : (
            slots.map((slot, i) => (
              <SlotCard
                key={slot.startMin}
                slot={slot}
                purpose={meetingPurpose}
                featured={i === 0}
                badge={i === 0 ? 'Best match' : `Option ${i + 1}`}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
