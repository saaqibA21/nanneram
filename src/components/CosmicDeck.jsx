import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Clock } from 'lucide-react';

const VINTAGE_DECK_CARDS = [
  {
    month: 'April',
    title: 'THE ESCAPEMENT',
    subtitle: 'CONSISTENCY & REGULATION',
    transitNote: 'Surya (Sun) Exalted in Mesha • Solar New Year',
    goldenDays: [3, 8, 14, 21, 28],
    description: 'The horological escapement converts chaotic energy into steady, relentless ticks. Optimal for building unbreakable momentum.',
    icon: (
      <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="28" stroke="#8a6d2b" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="40" cy="40" r="22" stroke="#241c15" strokeWidth="2.5" />
        <path d="M40 22V40L50 46" stroke="#8a6d2b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="40" r="4" fill="#8a6d2b" />
        <path d="M40 12V18M40 62V68M12 40H18M62 40H68M20 20L24 24M56 56L60 60M20 60L24 56M56 24L60 20" stroke="#241c15" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    month: 'May',
    title: 'THE ASTROLABE',
    subtitle: 'GROWTH & PROSPERITY',
    transitNote: 'Akshaya Tritiya • Jupiterian Expansion Peak',
    goldenDays: [2, 10, 15, 22, 29],
    description: 'The mariner’s celestial astrolabe maps uncharted oceans using planetary heights. Best window for venture fundraising and expansion.',
    icon: (
      <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="30" stroke="#241c15" strokeWidth="2.5" />
        <path d="M40 10V70M10 40H70" stroke="#8a6d2b" strokeWidth="2" strokeDasharray="4 2" />
        <ellipse cx="40" cy="40" rx="30" ry="14" stroke="#241c15" strokeWidth="2" transform="rotate(30 40 40)" />
        <circle cx="40" cy="40" r="6" fill="#8a6d2b" />
      </svg>
    )
  },
  {
    month: 'June',
    title: 'THE PENDULUM',
    subtitle: 'BALANCE & EQUILIBRIUM',
    transitNote: 'Shukra (Venus) Trine Guru • Diplomatic Accord',
    goldenDays: [5, 11, 18, 24, 27],
    description: 'The pendulum swings in perfect isochronous rhythm, finding exact center. Supreme transit for mergers and resolving co-founder disputes.',
    icon: (
      <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 14V50" stroke="#241c15" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="56" r="12" fill="#e5dcc7" stroke="#241c15" strokeWidth="2.5" />
        <circle cx="40" cy="56" r="4" fill="#8a6d2b" />
        <path d="M22 66C32 72 48 72 58 66" stroke="#8a6d2b" strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    )
  },
  {
    month: 'July',
    title: 'THE SUNDIAL',
    subtitle: 'FOCUS & SOLAR NOON',
    transitNote: 'Surya (Sun) in Cancer • Direct Gnomon Shadow',
    goldenDays: [4, 9, 16, 23, 30],
    description: 'When the shadow vanishes at solar noon, clarity is absolute. High-energy window for major product launches and press announcements.',
    icon: (
      <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="44" r="26" stroke="#241c15" strokeWidth="2" />
        <path d="M40 44L26 24V44H40Z" fill="#e5dcc7" stroke="#8a6d2b" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M20 44H60" stroke="#241c15" strokeWidth="2" />
        <path d="M40 18V24M54 22L50 26M62 34L56 36" stroke="#8a6d2b" strokeWidth="2" />
      </svg>
    )
  },
  {
    month: 'August',
    title: 'THE HOURGLASS',
    subtitle: 'DISCIPLINE & FINITE TIME',
    transitNote: 'Shani (Saturn) Audit Window • Rigor Window',
    goldenDays: [3, 7, 14, 21, 28],
    description: 'Grain by grain, the sands of Saturn measure accountability. The premier period for operational audits and debt elimination.',
    icon: (
      <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 18H56M24 62H56" stroke="#241c15" strokeWidth="3" strokeLinecap="round" />
        <path d="M28 20C28 34 38 40 40 40C42 40 52 34 52 20M28 60C28 46 38 40 40 40C42 40 52 46 52 60" stroke="#8a6d2b" strokeWidth="2.5" />
        <circle cx="40" cy="40" r="2" fill="#8a6d2b" />
        <path d="M34 56C36 52 44 52 46 56" fill="#8a6d2b" />
      </svg>
    )
  },
  {
    month: 'September',
    title: 'THE CHRONOGRAPH',
    subtitle: 'VELOCITY & CONTRACT CLOSING',
    transitNote: 'Budha (Mercury) Exalted in Virgo • Peak Deal Speed',
    goldenDays: [6, 12, 17, 24, 30],
    description: 'The split-second chronograph halts time to record a triumph. The highest-grossing period of the year for signing binding contracts.',
    icon: (
      <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="44" r="24" stroke="#241c15" strokeWidth="2.5" />
        <path d="M36 14H44M40 14V20" stroke="#241c15" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 44L46 32" stroke="#841b1b" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="44" r="3" fill="#841b1b" />
        <circle cx="40" cy="52" r="6" stroke="#8a6d2b" strokeWidth="1.5" />
      </svg>
    )
  }
];

export default function CosmicDeck() {
  const [activeTab, setActiveTab] = useState('3D');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    // Matches the breakpoint where .cosmic-grid drops below 3 columns (see
    // index.css). At 1-2 columns the stack is tall enough that rotating it
    // in 3D space pushes the bounding box past the viewport edge, so the
    // isometric tilt is only safe at the full 3-column width.
    const mq = window.matchMedia('(max-width: 980px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Falls back to the flat view below the 3-column breakpoint regardless of
  // the user's tab choice (see effect above).
  const effectiveTab = isNarrow ? 'GRID' : activeTab;

  return (
    <section style={{
      background: '#1d1712', // Rich antique dark walnut leather background
      color: '#f4ebd8',
      padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 1.5rem) clamp(3.5rem, 7vw, 6rem)',
      position: 'relative',
      borderBottom: '3px solid var(--ink-border-heavy)',
      backgroundImage: 'radial-gradient(#2d2218 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      
      <div className="container">
        
        {/* Header Tag & Title */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
          <div className="wax-seal-tag" style={{
            background: 'rgba(184, 147, 71, 0.15)', borderColor: 'var(--antique-brass)',
            color: 'var(--antique-brass-light)', marginBottom: '1rem'
          }}>
            <Clock size={13} color="var(--antique-brass-light)" />
            <span>THE 6 ANCIENT CHRONOMETERS OF TIME</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.75rem, 5vw, 3.6rem)',
            fontFamily: 'var(--font-antique-serif)',
            fontWeight: 800,
            color: '#f8f1e0',
            letterSpacing: '0.02em',
            lineHeight: 1.15
          }}>
            The Horological Almanac Deck
          </h2>

          <p style={{
            color: '#c5b8a5',
            fontSize: 'clamp(0.92rem, 3vw, 1.05rem)',
            maxWidth: '680px',
            margin: '0.75rem auto 1.8rem',
            lineHeight: 1.6,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            padding: '0 0.5rem'
          }}>
            Time is not a flat number on a digital screen. It is an intricate clockwork of solar declination, planetary horas, and golden windows. Explore the 6 great instruments of victory.
          </p>

          {/* Perspective Switcher */}
          <div className="deck-switcher" style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '3px', border: '1px solid #4a3c2c', maxWidth: '100%' }}>
            <button
              onClick={() => setActiveTab('3D')}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800,
                fontFamily: 'var(--font-antique-serif)', letterSpacing: '1px',
                background: activeTab === '3D' ? 'var(--antique-brass)' : 'transparent',
                color: activeTab === '3D' ? '#171109' : '#c5b8a5',
                transition: '0.2s'
              }}
            >
              ISOMETRIC 3D ALMANAC
            </button>
            <button
              onClick={() => setActiveTab('GRID')}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800,
                fontFamily: 'var(--font-antique-serif)', letterSpacing: '1px',
                background: activeTab === 'GRID' ? 'var(--antique-brass)' : 'transparent',
                color: activeTab === 'GRID' ? '#171109' : '#c5b8a5',
                transition: '0.2s'
              }}
            >
              FLAT VELLUM VIEW
            </button>
          </div>
        </div>

        {/* 3D DECK CONTAINER */}
        <div style={{
          perspective: effectiveTab === '3D' ? '1400px' : 'none',
          padding: effectiveTab === '3D' ? '2rem 0 3rem' : '0',
          overflowX: 'hidden'
        }}>

          <div className="cosmic-grid" style={{
            gap: '2.5rem',
            transform: effectiveTab === '3D' ? 'rotateX(18deg) rotateZ(-5deg) scale(0.96)' : 'none',
            transformOrigin: 'center center',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            
            {VINTAGE_DECK_CARDS.map((card, idx) => {
              const isHovered = hoveredCard === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: '#f8f3e6', // Antique vellum card
                    color: '#241c15',
                    borderRadius: '16px',
                    padding: '1.8rem 1.5rem 1.5rem',
                    border: '2.5px solid #241c15',
                    boxShadow: isHovered
                      ? '0 30px 55px rgba(0, 0, 0, 0.55), 0 10px 24px rgba(184, 147, 71, 0.35)'
                      : '0 15px 30px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.3)',
                    transform: isHovered ? 'translateY(-16px) scale(1.03)' : 'translateY(0)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Top Month + Engraved Seal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.4rem', marginBottom: '0.8rem' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)',
                      textTransform: 'uppercase', color: 'var(--sepia-faded)', letterSpacing: '1.5px'
                    }}>
                      FOLIO • {card.month.toUpperCase()}
                    </span>
                    <span style={{
                      background: 'var(--aged-parchment-dark)', color: 'var(--walnut-ink)', fontSize: '0.68rem', fontWeight: 900,
                      padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--ink-border-heavy)',
                      fontFamily: 'var(--font-antique-serif)'
                    }}>
                      SEALED
                    </span>
                  </div>

                  {/* Title (The Escapement, The Astrolabe, etc.) */}
                  <h3 style={{
                    fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-antique-serif)',
                    letterSpacing: '0.02em', lineHeight: 1.15, textTransform: 'uppercase', color: '#1f1813', marginBottom: '0.2rem'
                  }}>
                    {card.title}
                  </h3>

                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--antique-copper)', letterSpacing: '0.5px', marginBottom: '1rem' }}>
                    {card.subtitle}
                  </div>

                  {/* Vintage Engraved Instrument Frame */}
                  <div style={{
                    height: '95px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(circle, #fcf9f0 0%, #ebe2ce 100%)',
                    borderRadius: '10px', border: '1.5px solid #d5c8af', marginBottom: '1rem',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                  }}>
                    {card.icon}
                  </div>

                  {/* Antique Calendar Matrix */}
                  <div style={{
                    background: '#ffffff', border: '1.5px solid var(--ink-border-heavy)', borderRadius: '8px',
                    padding: '0.65rem', marginBottom: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px',
                      textAlign: 'center', fontSize: '0.6rem', fontWeight: 900, color: 'var(--sepia-faded)',
                      fontFamily: 'var(--font-antique-serif)', marginBottom: '4px'
                    }}>
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                      {[...Array(28)].map((_, dayIdx) => {
                        const dayNum = dayIdx + 1;
                        const isGolden = card.goldenDays.includes(dayNum);

                        return (
                          <div
                            key={dayIdx}
                            style={{
                              aspectRatio: '1/1', borderRadius: '3px', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800,
                              fontFamily: 'var(--font-chrono-mono)',
                              background: isGolden ? 'var(--antique-brass)' : 'transparent',
                              color: isGolden ? '#171109' : '#6b5c4d',
                              border: isGolden ? '1px solid var(--ink-border-heavy)' : 'none'
                            }}
                          >
                            {dayNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Planetary Note */}
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sepia-medium)', lineHeight: 1.4, marginTop: 'auto' }}>
                    <strong style={{ color: 'var(--walnut-ink)' }}>Transit:</strong> {card.transitNote}
                  </div>

                  {/* Antique Footnote */}
                  <div style={{
                    fontSize: '0.62rem', color: 'var(--sepia-faded)', marginTop: '0.5rem',
                    borderTop: '1px dashed #d5c8af', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px',
                    fontStyle: 'italic'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--antique-brass)', display: 'inline-block' }} />
                    Brass-marked dates indicate supreme astronomical muhurthas.
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </section>
  );
}
