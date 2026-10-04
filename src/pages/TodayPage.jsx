import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatTime } from '../utils/vedicTiming';
import { useApp } from '../context/AppContext';
import ContextBar from '../components/layout/ContextBar';
import NowCard from '../components/NowCard';
import DayTimeline from '../components/DayTimeline';

// Hero video featuring the glowing rotating clock hands
function HeroVideo() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(reduce);
  }, []);

  if (reduceMotion) {
    return (
      <img
        src="/assets/video/clock-poster.png"
        alt=""
        className="hero-video"
        aria-hidden="true"
      />
    );
  }

  return (
    <video
      className="hero-video"
      poster="/assets/video/clock-poster.png"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      disableRemotePlayback
      onCanPlay={(e) => {
        e.target.play().catch(() => {});
      }}
    >
      <source src="/assets/video/Clock_hands_rotate_and_glow_20260912193543.mp4" type="video/mp4" />
      <source src="/assets/video/nalla-neram-hero.mp4" type="video/mp4" />
    </video>
  );
}

export default function TodayPage() {
  const { vedicData: v, appMode } = useApp();
  const isGenZ = appMode === 'genz';
  const best = v.gowriSlots.find((g) => g.state === 'Amirtham');

  return (
    <>
      <section className="hero">
        <HeroVideo />
        <div className="container hero-inner">
          <h1>{isGenZ ? 'Max your Aura. Never take an L in a shadow window.' : 'Start important things at a good time.'}</h1>
          <p>
            {isGenZ
              ? 'Nanneram scans astronomical planetary Horas, Rahu Kaalam chaos windows and Gowri alignments to guarantee your DMs, parent requests, exams, and clutches land perfectly.'
              : 'Nanneram works out Rahu Kaalam, Horas and Nalla Neram from sunrise and sunset in your city, then finds the best slot for your Google Meet or Zoom call.'}
          </p>
          <div className="hero-actions">
            <Link to={isGenZ ? "/advisor" : "/schedule"} className="btn btn-primary">
              {isGenZ ? 'Open Rizz & Timing Advisor' : 'Find a meeting time'} <ArrowRight size={16} />
            </Link>
            <Link to={isGenZ ? "/schedule" : "/guide"} className="btn btn-secondary">
              {isGenZ ? 'Optimal Slots' : 'How it works'}
            </Link>
          </div>
        </div>
      </section>

      <div className="page container">
        <ContextBar />

        <NowCard />

        <section className="section" aria-labelledby="timeline-h">
          <div className="section-head">
            <div>
              <h2 id="timeline-h">{isGenZ ? 'Daily Vibe Timeline' : 'Timeline'}</h2>
              <p className="small muted">
                {isGenZ ? 'Planetary Horas, Gowri energies, and chaos zones on a single timeline.' : 'Hora, Gowri and the windows to watch, on one time axis.'}
              </p>
            </div>
          </div>
          <DayTimeline />
        </section>

        <section className="section" aria-labelledby="windows-h">
          <div className="section-head">
            <div>
              <h2 id="windows-h">{isGenZ ? `Danger & Power Windows on ${v.dayName}` : `Key windows on ${v.dayName}`}</h2>
              <p className="small muted">Day {formatTimeSpan(v)} · all times are local to {v.city.name}.</p>
            </div>
          </div>

          <div className="grid-4">
            <article className="card window window-bad">
              <h3>Rahu Kaalam <span className="badge badge-bad">{isGenZ ? 'Guaranteed L' : 'Avoid'}</span></h3>
              <div className="window-time">{formatTime(v.rahuKaalam.start)} – {formatTime(v.rahuKaalam.end)}</div>
              <p>{isGenZ ? 'Do NOT text your crush, start beef, or ask parents for favors in this window. Astronomical chaos energy.' : 'Do not start contracts, pitches or big decisions in this window.'}</p>
            </article>

            <article className="card window window-warn">
              <h3>Yamagandam <span className="badge badge-warn">{isGenZ ? 'Brain Fog' : 'Use care'}</span></h3>
              <div className="window-time">{formatTime(v.yamagandam.start)} – {formatTime(v.yamagandam.end)}</div>
              <p>{isGenZ ? 'Prone to careless mistakes, missed alarms, and gamer tilt. Play safe.' : 'Launches and large spending tend to meet friction here.'}</p>
            </article>

            <article className="card window">
              <h3>Gulika Kaalam <span className="badge">{isGenZ ? 'Karma Loop' : 'Repeats'}</span></h3>
              <div className="window-time">{formatTime(v.gulikaKaalam.start)} – {formatTime(v.gulikaKaalam.end)}</div>
              <p>{isGenZ ? 'Whatever you start here keeps repeating. Good for good habits, terrible for fights or drama.' : 'What begins here tends to repeat. Fine for routine work, not for disputes.'}</p>
            </article>

            <article className="card window window-good">
              <h3>Nalla Neram <span className="badge badge-good">{isGenZ ? '+1000 Aura' : 'Favourable'}</span></h3>
              {best && <div className="window-time">{formatTime(best.start)} – {formatTime(best.end)}</div>}
              <p>{isGenZ ? 'Amirtham is peak positive cosmic alignment today. All elite slots:' : 'Amirtham is the best Gowri part today. All favourable parts:'}</p>
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
              <h3>{isGenZ ? 'Need instant advice on a high-stakes move?' : 'Have a meeting to plan?'}</h3>
              <p>{isGenZ ? 'Pick whether you are texting a crush, asking parents for permission, or cramming for exams.' : 'Pick the type of meeting and its length. We skip Rahu Kaalam and rank the best slots.'}</p>
            </div>
            <Link to={isGenZ ? "/advisor" : "/schedule"} className="btn btn-primary">
              {isGenZ ? 'Open Rizz & Timing Advisor' : 'Find a meeting time'} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

const formatTimeSpan = (v) => `${formatTime(v.sunriseMin)} – ${formatTime(v.sunsetMin)}`;
