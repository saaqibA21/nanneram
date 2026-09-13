import React, { useState } from 'react';
import { Video, X, Check, ExternalLink, Sparkles, Trash2, Globe, ShieldCheck } from 'lucide-react';

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
    triggerToast(clean ? 'Google Meet custom link saved & calibrated!' : 'Reset to instant Google Meet generation (meet.google.com/new)');
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
    triggerToast('Reset to default instant Google Meet rooms.');
    onClose();
  };

  const handleLaunchInstant = () => {
    window.open('https://meet.google.com/new', '_blank');
    triggerToast('Launching fresh Google Meet room in new tab...');
  };

  return (
    <div className="modal-backdrop">
      <div className="antique-card modal-card" style={{ maxWidth: '560px' }}>
        
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
                GOOGLE MEET APPARATUS
              </h3>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--sepia-faded)', letterSpacing: '1px' }}>
                TELECONFERENCE ROOM CALIBRATION
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Option 1: Instant Google Meet Room */}
        <div style={{
          background: '#e8f5e9', border: '2px solid #2e7d32',
          borderRadius: '8px', padding: '1.1rem', marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', color: '#1b5e20', letterSpacing: '1px', fontFamily: 'var(--font-antique-serif)' }}>
              ★ INSTANT REAL ROOM GENERATION (DEFAULT)
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2e7d32' }}>Zero Setup Needed</span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#1b5e20', lineHeight: 1.4, marginBottom: '0.75rem' }}>
            Google Meet allows anyone with a Google account to launch a brand new live meeting in 1 second. Nanneram automatically uses this for all meeting passes by default.
          </p>

          <button
            onClick={handleLaunchInstant}
            className="btn-brass"
            style={{
              width: '100%', padding: '0.75rem', fontSize: '0.88rem',
              justifyContent: 'center', background: '#00897b', color: '#ffffff',
              border: '2px solid #005b4f', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '0.6rem', boxShadow: '0 3px 10px rgba(0, 137, 123, 0.25)'
            }}
          >
            <ExternalLink size={16} />
            <span>Launch Fresh Google Meet (meet.google.com/new)</span>
          </button>
        </div>

        {/* Separator */}
        <div style={{ position: 'relative', margin: '1.5rem 0', textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid var(--ink-border-heavy)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
          <span style={{ position: 'relative', background: '#faf4e6', padding: '0 0.75rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--sepia-faded)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            OR BIND YOUR PERMANENT GOOGLE MEET LINK
          </span>
        </div>

        {/* Option 2: Custom Google Meet Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'var(--font-antique-serif)' }}>
            Custom / Reusable Google Meet URL:
          </label>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. https://meet.google.com/abc-defg-hij"
            style={{
              width: '100%', padding: '0.65rem 0.85rem', background: '#fff',
              border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
              fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem'
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--sepia-faded)', display: 'block', lineHeight: 1.4 }}>
            💡 If your company or personal calendar already has a recurring Google Meet room, paste it here. Nanneram will embed this exact room in all passes and calendar invites.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            className="btn-brass"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Check size={16} /> Save Google Meet Link
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
              <Trash2 size={14} /> Clear Custom Link
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
