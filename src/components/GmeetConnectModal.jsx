import React, { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import Modal from './ui/Modal';

const STORAGE_KEY = 'nanneram_gmeet_link';

function GmeetForm({ onClose, gmeetLink, setGmeetLink, triggerToast }) {
  const [inputUrl, setInputUrl] = useState(gmeetLink || '');

  const persist = (value) => {
    setGmeetLink(value);
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    let clean = inputUrl.trim();
    if (clean && !clean.startsWith('http')) clean = 'https://' + clean;
    persist(clean);
    triggerToast(clean ? 'Google Meet room saved.' : 'Meet room cleared. Google Calendar will add its own link.');
    onClose();
  };

  const handleClear = () => {
    persist('');
    triggerToast('Google Meet room cleared.');
    onClose();
  };

  return (
    <Modal
      title="Google Meet room"
      subtitle="Everyone in an invite has to join the same room."
      onClose={onClose}
      width={540}
    >
      <div className="callout callout-warn">
        <Info size={16} />
        <span>
          Unlike Zoom, Google Meet has no permanent ID. Each room has its own code (like <code>abc-defg-hij</code>), so create a room once and save its link here.
        </span>
      </div>

      <div className="field">
        <span className="field-label">Step 1. Create a room</span>
        <div>
          <a className="btn btn-secondary" href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} /> Create a room on Google Meet
          </a>
        </div>
        <span className="hint">Copy the link from the address bar or the "Meeting details" panel.</span>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="gmeet-link">Step 2. Paste the room link</label>
        <input
          id="gmeet-link"
          className="input"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://meet.google.com/xyz-pqrs-tuv"
        />
        <span className="hint">It is added to your calendar events, .ics files and copied invites.</span>
      </div>

      <div className="modal-actions">
        {gmeetLink && (
          <button className="btn btn-danger" onClick={handleClear} style={{ marginRight: 'auto' }}>Clear room</button>
        )}
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Meet room</button>
      </div>
    </Modal>
  );
}

export default function GmeetConnectModal({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <GmeetForm {...props} />;
}
