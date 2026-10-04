import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Sun, CalendarClock, Sparkles, BookOpen, Tag, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV = [
  { to: '/', label: 'Today', icon: Sun, end: true },
  { to: '/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/advisor', label: 'Advisor', icon: Sparkles },
  { to: '/guide', label: 'Guide', icon: BookOpen },
  { to: '/plans', label: 'Plans', icon: Tag }
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function TopBar() {
  const { platform, zoomConfig, gmeetLink, openZoomSetup, openGmeetSetup, appMode, setAppMode } = useApp();
  const linkSet = platform === 'Zoom' ? zoomConfig.connected : Boolean(gmeetLink);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <NavLink to="/" className="brand" aria-label="Nanneram home">
          <img src="/assets/logo.png" alt="Nanneram" className="brand-logo" />
          <span>
            Nanneram
            <small>{appMode === 'genz' ? 'Aura & Timing Radar' : 'Good-time planner'}</small>
          </span>
        </NavLink>

        <nav className="navlinks" aria-label="Main">
          {NAV.map(({ to, label, end }) => {
            const displayLabel = appMode === 'genz' && label === 'Advisor' ? 'Rizz Advisor' : label;
            return (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}>
                {displayLabel}
              </NavLink>
            );
          })}
        </nav>

        <div className="topbar-spacer" />

        {/* Mode Switcher Pill */}
        <div className="mode-switch-pill" role="radiogroup" aria-label="App mode">
          <button
            type="button"
            className={`mode-btn ${appMode === 'normal' ? 'active' : ''}`}
            onClick={() => setAppMode('normal')}
            aria-pressed={appMode === 'normal'}
            title="Classic Executive Vedic Mode"
          >
            Classic
          </button>
          <button
            type="button"
            className={`mode-btn ${appMode === 'genz' ? 'active genz-btn' : ''}`}
            onClick={() => setAppMode('genz')}
            aria-pressed={appMode === 'genz'}
            title="Gen-Z Teen & Aura Mode"
          >
            ⚡ Gen-Z
          </button>
        </div>

        <button
          className="btn btn-secondary btn-sm topbar-meet-btn"
          onClick={platform === 'Zoom' ? openZoomSetup : openGmeetSetup}
          title={linkSet ? `${platform} room is set` : `Set your ${platform} room`}
        >
          <Video size={15} />
          <span className="nav-label">{linkSet ? `${platform} room` : `Set up ${platform}`}</span>
          <span className={`dot ${linkSet ? 'status-on' : 'status-off'}`} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

function TabBar() {
  const { appMode } = useApp();
  return (
    <nav className="tabbar" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon, end }) => {
        const displayLabel = appMode === 'genz' && label === 'Advisor' ? 'Rizz' : label;
        return (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <Icon size={20} />
            {displayLabel}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <img src="/assets/logo.png" alt="Nanneram" className="brand-logo" />
              Nanneram
            </div>
            <p className="small muted" style={{ marginTop: '0.5rem', maxWidth: '38ch' }}>
              Good times for meetings, from sunrise and sunset in your city.
            </p>
          </div>
          <nav aria-label="Footer">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
          </nav>
        </div>
        <p className="fine">
          Timings are for planning and tradition only. They do not predict or guarantee any outcome, and Nanneram does not
          give financial, legal or medical advice. © 2026 Nanneram.
        </p>
      </div>
    </footer>
  );
}

export default function AppShell() {
  return (
    <>
      <ScrollToTop />
      <TopBar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <TabBar />
    </>
  );
}
