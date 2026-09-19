import React, { useState } from 'react';
import { Check, ExternalLink, Lock } from 'lucide-react';
import Modal from './ui/Modal';
import {
  getZoomJoinUrl, formatZoomId, saveZoomConfig, clearZoomConfig, describeZoomRoom, DEFAULT_ZOOM_CONFIG
} from '../utils/zoomIntegration';

function ZoomRoomForm({ onClose, zoomConfig, setZoomConfig, triggerToast }) {
  const [meetingId, setMeetingId] = useState(zoomConfig.meetingId || '');
  const [passcode, setPasscode] = useState(zoomConfig.passcode || '');
  const [vanityUrl, setVanityUrl] = useState(zoomConfig.vanityUrl || '');
  const [hostName, setHostName] = useState(zoomConfig.hostName || '');

  // '' until a valid room is entered
  const previewUrl = getZoomJoinUrl({ vanityUrl, meetingId, passcode });

  const handleSave = () => {
    if (!previewUrl) {
      triggerToast('Enter a 9–11 digit Meeting ID or a Zoom personal link first.');
      return;
    }
    if (vanityUrl.trim()) {
      try {
        new URL(previewUrl);
      } catch {
        triggerToast('That personal link is not a valid URL.');
        return;
      }
    }

    const updated = {
      ...DEFAULT_ZOOM_CONFIG,
      connected: true,
      meetingId: meetingId.trim(),
      passcode: passcode.trim(),
      vanityUrl: vanityUrl.trim(),
      hostName: hostName.trim(),
      lastTestedAt: zoomConfig.lastTestedAt
    };

    setZoomConfig(updated);
    saveZoomConfig(updated);
    triggerToast('Zoom room saved. It will be added to your invites.');
    onClose();
  };

  const handleRemove = () => {
    clearZoomConfig();
    setZoomConfig({ ...DEFAULT_ZOOM_CONFIG });
    triggerToast('Saved Zoom room removed.');
    onClose();
  };

  const handleTest = () => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      title="Zoom room"
      subtitle="Nanneram does not connect to your Zoom account. It puts the room you enter here into every invite."
      onClose={onClose}
      width={540}
    >
      <div className={`callout ${zoomConfig.connected ? 'callout-good' : 'callout-warn'}`}>
        {zoomConfig.connected ? <Check size={16} /> : <Lock size={16} />}
        <span>{zoomConfig.connected ? `Saved room: ${describeZoomRoom(zoomConfig)}` : 'No Zoom room saved yet.'}</span>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="zoom-host">Host name (optional)</label>
        <input id="zoom-host" className="input" value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="e.g. Dr. Saaqib" />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'end' }}>
        <div className="field">
          <label className="field-label" htmlFor="zoom-id">Meeting ID (PMI)</label>
          <input id="zoom-id" className="input" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} placeholder="984 210 7452" inputMode="numeric" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="zoom-pass">Passcode (optional)</label>
          <input id="zoom-pass" className="input" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="882719" />
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="zoom-link">Or your personal link</label>
        <input id="zoom-link" className="input" value={vanityUrl} onChange={(e) => setVanityUrl(e.target.value)} placeholder="https://zoom.us/my/yourname" />
        <span className="hint">Your Meeting ID is under Meetings in the Zoom app. If both are filled, the personal link is used.</span>
      </div>

      <div className="field">
        <span className="field-label">
          Join link{meetingId && !vanityUrl.trim() ? ` (${formatZoomId(meetingId)})` : ''}
        </span>
        <div className="preview">{previewUrl || 'Enter a Meeting ID or personal link to see the join link.'}</div>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={handleTest} disabled={!previewUrl}>
            <ExternalLink size={14} /> Open room to test
          </button>
        </div>
      </div>

      <p className="hint">
        <Lock size={12} style={{ verticalAlign: '-1px' }} /> Saved only in this browser. Nothing is sent to a server. A passcode inside the link is visible to anyone you send it to.
      </p>

      <div className="modal-actions">
        {zoomConfig.connected && (
          <button className="btn btn-danger" onClick={handleRemove} style={{ marginRight: 'auto' }}>Remove room</button>
        )}
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Zoom room</button>
      </div>
    </Modal>
  );
}

// The form owns its own state, so it is mounted only while the dialog is open.
export default function ZoomConnectModal({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <ZoomRoomForm {...props} />;
}
