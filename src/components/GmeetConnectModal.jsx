import React, { useState } from 'react';
import { Video, X, Check, ExternalLink, Sparkles, Trash2, Globe, ShieldCheck, AlertCircle } from 'lucide-react';

export default function GmeetConnectModal({
  isOpen,
  onClose,
  gmeetLink,
  setGmeetLink,
  triggerToast
}) {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState(gmeetLink || '');

  const handleSave = () => {
    let clean = inputUrl.trim();
    if (clean && !clean.startsWith('http')) {
      clean = 'https://' + clean;
    }
    setGmeetLink(clean);
    try {
      if (clean) {
        localStorage.setItem('nanneram_gmeet_link', clean);
      } else {
        localStorage.removeItem('nanneram_gmeet_link');
      }
    } catch (e) {
      console.error(e);
    }
    triggerToast(clean ? 'Google Meet room link saved!' : 'Reset to Google Calendar auto-attachment');
    onClose();
  };

  const handleReset = () => {
    setInputUrl('');
    setGmeetLink('');
    try {
      localStorage.removeItem('nanneram_gmeet_link');
    } catch (e) {
      console.error(e);
    }
    triggerToast('Cleared custom Google Meet link.');
    onClose();
  };

  const handleOpenMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
    triggerToast('Opening Google Meet to create your room code...');
  };

  return (
    <div className="modal-backdrop">
      <div className="antique-card modal-card" style={{ maxWidth: '580px' }}>
        
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '2px solid var(--ink-border-heavy)', paddingBottom: '0.85rem', marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '6px', background: '#00897b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Video size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 900 }}>
                GOOGLE MEET SHARED ROOM SETUP
              </h3>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--sepia-faded)', letterSpacing: '1px' }}>
                ENSURE ALL INVITEES JOIN THE SAME CALL
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Notice explaining how Google Meet works */}
        <div style={{
          background: '#fff8e1', border: '1.5px solid #f59e0b', borderRadius: '8px',
          padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem'
        }}>
          <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.45 }}>
            <strong>Why a shared room link is needed:</strong><br />
            Unlike Zoom (which has permanent 10-digit IDs), Google Meet generates a unique 10-letter room code (like <code>meet.google.com/abc-defg-hij</code>). Both you and your invitees must have the <strong>same room code</strong> to join together!
          </div>
        </div>

        {/* Step 1: Generate or Copy a Room */}
        <div style={{
          background: 'var(--aged-parchment-light)', border: '1.5px solid var(--ink-border-heavy)',
          borderRadius: '8px', padding: '1.1rem', marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--antique-brass-deep)', marginBottom: '0.4rem', fontFamily: 'var(--font-antique-serif)' }}>
            STEP 1: CREATE A NEW GOOGLE MEET ROOM (OR USE AN EXISTING ONE)
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--sepia-medium)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
            Click below to open Google Meet. Google will generate a live room code. Copy the link from the browser bar or from the "Meeting details" popup.
          </p>
          <button
            onClick={handleOpenMeet}
            className="btn-brass"
            style={{
              padding: '0.65rem 1rem', fontSize: '0.82rem',
              justifyContent: 'center', background: '#00897b', color: '#ffffff',
              border: '1.5px solid #005b4f', cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', gap: '0.5rem'
            }}
          >
            <ExternalLink size={15} />
            <span>Generate Room on Google Meet</span>
          </button>
        </div>

        {/* Step 2: Paste the Room Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--walnut-ink)', fontFamily: 'var(--font-antique-serif)' }}>
            STEP 2: PASTE YOUR SHARED GOOGLE MEET ROOM LINK:
          </label>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. https://meet.google.com/xyz-pqrs-tuv"
            style={{
              width: '100%', padding: '0.7rem 0.9rem', background: '#fff',
              border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
              fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem'
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--sepia-faded)', display: 'block', lineHeight: 1.4 }}>
            Once pasted and saved, Nanneram embeds this exact URL into your passes, WhatsApp invites, and Apple/Google Calendar events so everyone enters the same room.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            className="btn-brass"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Check size={16} /> Save & Bind Google Meet Room
          </button>

          {gmeetLink && (
            <button
              onClick={handleReset}
              className="wax-seal-tag"
              style={{
                padding: '0.6rem 1rem', cursor: 'pointer', background: '#ffffff',
                border: '1.5px solid var(--ink-border-heavy)', color: '#c62828',
                fontWeight: 800, fontSize: '0.78rem'
              }}
            >
              <Trash2 size={14} /> Clear Room
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
