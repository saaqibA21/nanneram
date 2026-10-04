import React from 'react';
import { CalendarPlus, Download, Copy, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * One recommended meeting window with the actions to put it in a calendar.
 */
export default function SlotCard({ slot, purpose, badge, featured = false, hideLinkWarning = false }) {
  const {
    platform, selectedCity, getRealMeetingUrl, getGoogleCalendarUrl, copyInvite, downloadIcs,
    openZoomSetup, openGmeetSetup, appMode
  } = useApp();
  const isGenZ = appMode === 'genz';
  const hasLink = Boolean(getRealMeetingUrl());

  return (
    <article className={`card slot${featured ? ' slot-best' : ''}`}>
      <div className="slot-top">
        <span className="eyebrow">{slot.priorityTitle}</span>
        {badge && <span className={`badge ${featured ? 'badge-accent' : ''}`}>{badge}</span>}
      </div>

      <div className="slot-time">
        <strong>{slot.startTimeFormatted} – {slot.endTimeFormatted}</strong>
        <span>{selectedCity.name} time</span>
      </div>

      <div className="slot-tags">
        <span className="badge badge-accent">{slot.hora.planet} {isGenZ ? 'Aura' : 'Hora'}</span>
        <span className="badge badge-good">{slot.gowri.name}</span>
        <span className="badge">{isGenZ ? `Dip out before ${slot.gracefulExitWindow.split(' – ')[0]}` : `Wrap up by ${slot.gracefulExitWindow.split(' – ')[0]}`}</span>
      </div>

      <p className="slot-why">{slot.recommendation}</p>

      <div className="slot-actions">
        <a
          className="btn btn-primary"
          href={getGoogleCalendarUrl(slot, purpose)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CalendarPlus size={16} /> {isGenZ ? 'Lock In (Google Cal)' : 'Add to Google Calendar'}
        </a>
        <button className="btn btn-secondary" onClick={() => downloadIcs(slot, purpose)}>
          <Download size={16} /> {isGenZ ? 'Export .ics' : 'Apple / Outlook (.ics)'}
        </button>
        <button className="btn btn-ghost" onClick={() => copyInvite(slot, purpose)}>
          <Copy size={16} /> {isGenZ ? 'Copy Pitch' : 'Copy invite'}
        </button>
      </div>

      {!hasLink && !hideLinkWarning && (
        <div className="slot-warn">
          <AlertTriangle size={15} />
          <span>
            No {platform} link yet, so the invite will not include one.{' '}
            <button className="link-btn" onClick={platform === 'Zoom' ? openZoomSetup : openGmeetSetup}>
              Set up {platform}
            </button>
          </span>
        </div>
      )}
    </article>
  );
}
