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
  const { platform, zoomConfig, gmeetLink, openZoomSetup, openGmeetSetup } = useApp();
  const linkSet = platform === 'Zoom' ? zoomConfig.connected : Boolean(gmeetLink);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <NavLink to="/" className="brand" aria-label="Nanneram home">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>
            Nanneram
            <small>Good-time planner</small>
          </span>
        </NavLink>

        <nav className="navlinks" aria-label="Main">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-spacer" />

        <button
          className="btn btn-secondary btn-sm"
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
  return (
    <nav className="tabbar" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
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
              <span className="brand-mark" aria-hidden="true">N</span>
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
