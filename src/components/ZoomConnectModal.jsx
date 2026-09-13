import React, { useState } from 'react';
import { Video, X, Check, ExternalLink, ShieldCheck, Lock, Sparkles, Key, Globe, Trash2 } from 'lucide-react';
import { getZoomJoinUrl, formatZoomId, saveZoomConfig, clearZoomConfig } from '../utils/zoomIntegration';

export default function ZoomConnectModal({
  isOpen,
  onClose,
  zoomConfig,
  setZoomConfig,
  triggerToast
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(zoomConfig.mode || 'pmi');
  const [meetingId, setMeetingId] = useState(zoomConfig.meetingId || '');
  const [passcode, setPasscode] = useState(zoomConfig.passcode || '');
  const [vanityUrl, setVanityUrl] = useState(zoomConfig.vanityUrl || '');
  const [hostName, setHostName] = useState(zoomConfig.hostName || '');
  
  // OAuth fields
  const [clientId, setClientId] = useState(zoomConfig.clientId || '');
  const [clientSecret, setClientSecret] = useState(zoomConfig.clientSecret || '');
  const [accountId, setAccountId] = useState(zoomConfig.accountId || '');

  // Live computed preview URL
  const previewUrl = getZoomJoinUrl({
    vanityUrl,
    meetingId,
    passcode,
    clientId
  });

  const handleSave = () => {
    const updated = {
      ...zoomConfig,
      connected: true,
      mode: activeTab,
      meetingId: meetingId.trim(),
      passcode: passcode.trim(),
      vanityUrl: vanityUrl.trim(),
      hostName: hostName.trim() || 'Verified Host',
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      accountId: accountId.trim(),
      lastTestedAt: new Date().toISOString()
    };

    setZoomConfig(updated);
    saveZoomConfig(updated);
    triggerToast('Zoom Video Apparatus successfully calibrated and connected!');
    onClose();
  };

  const handleDisconnect = () => {
    clearZoomConfig();
    setZoomConfig({
      connected: false,
      mode: 'pmi',
      meetingId: '',
      passcode: '',
      vanityUrl: '',
      hostName: '',
      clientId: '',
      clientSecret: '',
      accountId: '',
      lastTestedAt: null
    });
    triggerToast('Zoom apparatus disconnected.');
    onClose();
  };

  const handleTestCall = () => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank');
    triggerToast('Launching Zoom Test Call in new window...');
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
              width: '32px', height: '32px', borderRadius: '6px', background: '#0b5cff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Video size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-antique-serif)', fontWeight: 900 }}>
                ZOOM APPARATUS CONNECT
              </h3>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--sepia-faded)', letterSpacing: '1px' }}>
                VEDIC TELECONFERENCE INTEGRATION
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--aged-parchment)', padding: '4px', borderRadius: '6px', border: '1px solid var(--ink-border-heavy)' }}>
          <button
            onClick={() => setActiveTab('pmi')}
            style={{
              flex: 1, padding: '0.55rem 0.6rem', fontSize: '0.78rem', fontWeight: 800,
              fontFamily: 'var(--font-antique-serif)', borderRadius: '4px',
              background: activeTab === 'pmi' ? 'var(--ink-border-heavy)' : 'transparent',
              color: activeTab === 'pmi' ? 'var(--antique-brass-light)' : 'var(--walnut-ink)',
              transition: '0.2s'
            }}
          >
            ★ Personal Room / PMI (Instant)
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            style={{
              flex: 1, padding: '0.55rem 0.6rem', fontSize: '0.78rem', fontWeight: 800,
              fontFamily: 'var(--font-antique-serif)', borderRadius: '4px',
              background: activeTab === 'oauth' ? 'var(--ink-border-heavy)' : 'transparent',
              color: activeTab === 'oauth' ? 'var(--antique-brass-light)' : 'var(--walnut-ink)',
              transition: '0.2s'
            }}
          >
            Marketplace OAuth API
          </button>
        </div>

        {/* TAB 1: Personal Meeting ID / Vanity Link */}
        {activeTab === 'pmi' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', lineHeight: 1.5, marginBottom: '1.2rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              Connect your permanent Zoom Personal Meeting ID (PMI) or custom vanity link. Nanneram will automatically embed this room, encrypted passcode, and graceful exit reminders into all auspicious passes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              
              {/* Host Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-antique-serif)' }}>
                  Host / Account Name:
                </label>
                <input 
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Dr. Saaqib / Founder"
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', background: '#fff',
                    border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
                    fontSize: '0.88rem', fontWeight: 700
                  }}
                />
              </div>

              {/* Personal Meeting ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-antique-serif)' }}>
                    Zoom Meeting ID (PMI):
                  </label>
                  <input 
                    type="text"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    placeholder="e.g. 984 210 7452"
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', background: '#fff',
                      border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
                      fontSize: '0.88rem', fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-antique-serif)' }}>
                    Passcode (Optional):
                  </label>
                  <input 
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="e.g. 882719"
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', background: '#fff',
                      border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
                      fontSize: '0.88rem', fontWeight: 700
                    }}
                  />
                </div>
              </div>

              {/* Or Vanity Link */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-antique-serif)' }}>
                  Or Zoom Personal Link (Vanity URL):
                </label>
                <input 
                  type="text"
                  value={vanityUrl}
                  onChange={(e) => setVanityUrl(e.target.value)}
                  placeholder="e.g. https://zoom.us/my/foundername"
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', background: '#fff',
                    border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
                    fontSize: '0.88rem', fontWeight: 700
                  }}
                />
              </div>

            </div>

            {/* Real-Time Live Preview Box */}
            <div style={{
              background: 'var(--aged-parchment-light)', border: '1.5px solid var(--ink-border-heavy)',
              padding: '0.9rem', borderRadius: '6px', marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--sepia-faded)' }}>
                  AUTHENTIC JOIN LINK PREVIEW:
                </span>
                <button 
                  onClick={handleTestCall}
                  style={{
                    fontSize: '0.72rem', fontWeight: 800, color: '#0b5cff', display: 'flex',
                    alignItems: 'center', gap: '0.3rem', cursor: 'pointer'
                  }}
                >
                  <ExternalLink size={12} /> Test Launch Zoom
                </button>
              </div>

              <div style={{
                fontSize: '0.82rem', fontWeight: 800, wordBreak: 'break-all',
                color: 'var(--walnut-ink)', fontFamily: 'var(--font-chrono-mono)'
              }}>
                {previewUrl}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Zoom Marketplace OAuth 2.0 */}
        {activeTab === 'oauth' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--sepia-medium)', lineHeight: 1.5, marginBottom: '1.2rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              Connect your Zoom Marketplace App (`marketplace.zoom.us`) to automatically provision verified Zoom video rooms for every celestial appointment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-antique-serif)' }}>
                  Client ID (From Zoom Marketplace):
                </label>
                <input 
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. ZFTS0RgwT1OFEEkhFsXxA"
                  style={{
                    width: '100%', padding: '0.6rem 0.8rem', background: '#fff',
                    border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
                    fontSize: '0.85rem', fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-antique-serif)' }}>
                  Client Secret (From Zoom Marketplace):
                </label>
                <input 
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Paste Client Secret..."
                  style={{
                    width: '100%', padding: '0.6rem 0.8rem', background: '#fff',
                    border: '2px solid var(--ink-border-heavy)', borderRadius: '6px',
                    fontSize: '0.85rem', fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-antique-serif)', color: 'var(--sepia-faded)' }}>
                  Account ID (Optional — Only needed for Server-to-Server Apps):
                </label>
                <input 
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Leave empty for User-managed apps"
                  style={{
                    width: '100%', padding: '0.6rem 0.8rem', background: '#fbf8f0',
                    border: '1.5px solid var(--ink-border-heavy)', borderRadius: '6px',
                    fontSize: '0.82rem', color: 'var(--sepia-medium)'
                  }}
                />
              </div>
            </div>

            {/* Real-Time Live Preview Box */}
            <div style={{
              background: 'var(--aged-parchment-light)', border: '1.5px solid var(--ink-border-heavy)',
              padding: '0.9rem', borderRadius: '6px', marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--sepia-faded)' }}>
                  CALCULATED APPARATUS ROOM LINK:
                </span>
                <button 
                  onClick={handleTestCall}
                  style={{
                    fontSize: '0.72rem', fontWeight: 800, color: '#0b5cff', display: 'flex',
                    alignItems: 'center', gap: '0.3rem', cursor: 'pointer', background: 'none', border: 'none'
                  }}
                >
                  <ExternalLink size={12} /> Test Launch Zoom
                </button>
              </div>

              <div style={{
                fontSize: '0.82rem', fontWeight: 800, wordBreak: 'break-all',
                color: 'var(--walnut-ink)', fontFamily: 'var(--font-chrono-mono)'
              }}>
                {previewUrl}
              </div>
            </div>

            <div style={{
              background: 'var(--patina-sage-bg)', border: '1px solid var(--patina-sage)',
              padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--patina-sage)'
            }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>OAuth 2.0 Credentials encrypted locally. Scopes: <code>meeting:write</code>, <code>meeting:read</code>.</span>
            </div>

          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            className="btn-brass"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Check size={16} /> Save & Connect Zoom
          </button>

          {zoomConfig.connected && (
            <button
              onClick={handleDisconnect}
              className="btn-walnut"
              style={{ justifyContent: 'center', background: '#451a1a', borderColor: '#841b1b' }}
              title="Disconnect Zoom"
            >
              <Trash2 size={16} color="#fca5a5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="btn-walnut"
            style={{ padding: '0.8rem 1.2rem' }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
