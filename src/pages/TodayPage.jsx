import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatTime } from '../utils/vedicTiming';
import { useApp } from '../context/AppContext';
import ContextBar from '../components/layout/ContextBar';
import NowCard from '../components/NowCard';
import DayTimeline from '../components/DayTimeline';

// The hero video is decorative and 7 MB, so skip it on phones and for reduced-motion users.
function HeroVideo() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 720px)').matches;
    setShow(!reduce && !small);
  }, []);

  if (!show) return null;
  return (
    <video
      className="hero-video"
      src="/assets/video/nalla-neram-hero.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      disableRemotePlayback
    />
  );
}

export default function TodayPage() {
  const { vedicData: v } = useApp();
  const best = v.gowriSlots.find((g) => g.state === 'Amirtham');

  return (
    <>
      <section className="hero">
        <HeroVideo />
        <div className="container hero-inner">
          <h1>Start important things at a good time.</h1>
          <p>
            Nanneram works out Rahu Kaalam, Horas and Nalla Neram from sunrise and sunset in your city,
            then finds the best slot for your Google Meet or Zoom call.
          </p>
          <div className="hero-actions">
            <Link to="/schedule" className="btn btn-primary">
              Find a meeting time <ArrowRight size={16} />
            </Link>
            <Link to="/guide" className="btn btn-secondary">How it works</Link>
          </div>
        </div>
      </section>

      <div className="page container">
        <ContextBar />

        <NowCard />

        <section className="section" aria-labelledby="timeline-h">
          <div className="section-head">
            <div>
              <h2 id="timeline-h">Timeline</h2>
              <p className="small muted">Hora, Gowri and the windows to watch, on one time axis.</p>
            </div>
          </div>
          <DayTimeline />
        </section>

        <section className="section" aria-labelledby="windows-h">
          <div className="section-head">
            <div>
              <h2 id="windows-h">Key windows on {v.dayName}</h2>
              <p className="small muted">Day {formatTimeSpan(v)} · all times are local to {v.city.name}.</p>
            </div>
          </div>

          <div className="grid-4">
            <article className="card window window-bad">
              <h3>Rahu Kaalam <span className="badge badge-bad">Avoid</span></h3>
              <div className="window-time">{formatTime(v.rahuKaalam.start)} – {formatTime(v.rahuKaalam.end)}</div>
              <p>Do not start contracts, pitches or big decisions in this window.</p>
            </article>

            <article className="card window window-warn">
              <h3>Yamagandam <span className="badge badge-warn">Use care</span></h3>
              <div className="window-time">{formatTime(v.yamagandam.start)} – {formatTime(v.yamagandam.end)}</div>
              <p>Launches and large spending tend to meet friction here.</p>
            </article>

            <article className="card window">
              <h3>Gulika Kaalam <span className="badge">Repeats</span></h3>
              <div className="window-time">{formatTime(v.gulikaKaalam.start)} – {formatTime(v.gulikaKaalam.end)}</div>
              <p>What begins here tends to repeat. Fine for routine work, not for disputes.</p>
            </article>

            <article className="card window window-good">
              <h3>Nalla Neram <span className="badge badge-good">Favourable</span></h3>
              {best && <div className="window-time">{formatTime(best.start)} – {formatTime(best.end)}</div>}
              <p>Amirtham is the best Gowri part today. All favourable parts:</p>
              <ul className="window-list">
                {v.nallaNeramDay.map((w) => (
                  <li key={w.start}>{formatTime(w.start)} – {formatTime(w.end)} · {w.states.join(' + ')}</li>
                ))}
                {v.nallaNeramNight.map((w) => (
                  <li key={w.start} className="night">{formatTime(w.start)} – {formatTime(w.end)} · {w.states.join(' + ')} (night)</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="cta-band">
            <div>
              <h3>Have a meeting to plan?</h3>
              <p>Pick the type of meeting and its length. We skip Rahu Kaalam and rank the best slots.</p>
            </div>
            <Link to="/schedule" className="btn btn-primary">
              Find a meeting time <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

const formatTimeSpan = (v) => `${formatTime(v.sunriseMin)} – ${formatTime(v.sunsetMin)}`;
