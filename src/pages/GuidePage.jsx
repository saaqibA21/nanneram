import React from 'react';
import { formatTime, formatDuration, formatUtcOffset } from '../utils/vedicTiming';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/layout/PageHeader';

const TERMS = [
  {
    name: 'Rahu Kaalam',
    badge: { tone: 'bad', text: 'Avoid' },
    text: 'A window of about 90 minutes each day, fixed by the weekday. Traditionally not used to begin contracts, launches, pitches or journeys.'
  },
  {
    name: 'Yamagandam',
    badge: { tone: 'warn', text: 'Use care' },
    text: 'Another weekday-fixed window. Starts made here are said to meet friction, so big spending and inaugurations are usually moved.'
  },
  {
    name: 'Gulika Kaalam',
    badge: { tone: '', text: 'Repeats' },
    text: 'Things begun here are said to repeat. That suits routine or compounding work, and not disputes or one-off decisions.'
  },
  {
    name: 'Hora',
    badge: { tone: 'accent', text: 'Planet of the hour' },
    text: 'The day and the night are each split into 12 hours (Horas) ruled by a planet in the Chaldean order, starting with the weekday lord at sunrise. Mercury, Jupiter and Sun Horas suit deals, advice and authority. Mars and Saturn call for caution.'
  },
  {
    name: 'Gowri panchangam',
    badge: { tone: 'good', text: 'Nalla Neram' },
    text: 'The day and the night are each split into 8 equal parts. Each weekday has its own fixed order of parts. Amirtham, Labham, Danam, Sugam and Uthi are favourable (Nalla Neram). Rogam, Soram and Visham are not.'
  }
];

export default function GuidePage() {
  const { vedicData: v, selectedCity } = useApp();

  return (
    <div className="page container">
      <PageHeader
        title="How Nanneram works"
        description="Everything here is calculated, not guessed. This page explains the terms and shows the numbers behind the times for your city."
      />

      <section className="section" style={{ marginTop: 0 }}>
        <div className="section-head"><h2>The terms</h2></div>
        <div className="grid-3">
          {TERMS.map((t) => (
            <article key={t.name} className="card term">
              <h3>
                {t.name}
                <span className={`badge ${t.badge.tone ? `badge-${t.badge.tone}` : ''}`}>{t.badge.text}</span>
              </h3>
              <p className="small">{t.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>How the times are worked out</h2></div>
        <div className="card card-pad-lg prose">
          <p>
            <strong>Sunrise and sunset</strong> come from the NOAA solar equations at a 90.833° zenith, which includes atmospheric
            refraction. They are shifted by the real UTC offset of the city on that date, so daylight saving is respected.
          </p>
          <p>
            The day length (sunrise to sunset) and the night length (sunset to the next sunrise) are each divided into 8 equal parts
            for Rahu Kaalam, Yamagandam, Gulika and the Gowri panchangam, and into 12 equal parts for the Horas.
          </p>
          <p>
            The Gowri tables match the published Tamil Gowri Panchangam tables, checked against Drik Panchang for Chennai.
            Meeting slots are chosen between 9 AM and 7 PM, skip Rahu Kaalam and Yamagandam, start in a favourable Gowri part, and are
            ranked by how well the Hora suits the type of meeting.
          </p>
          <p className="muted small">
            These are traditional planning aids. They do not predict or guarantee any result, and Nanneram does not give financial,
            legal or medical advice.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Numbers for {selectedCity.name}</h2>
            <p className="small muted">{v.dayName}, {v.date.toDateString()}. Change the city or date on the Today page.</p>
          </div>
        </div>
        <div className="card card-pad-lg">
          <div className="audit">
            <div><span>Latitude</span><span>{Math.abs(selectedCity.lat)}° {selectedCity.lat >= 0 ? 'N' : 'S'}</span></div>
            <div><span>Longitude</span><span>{Math.abs(selectedCity.lng)}° {selectedCity.lng >= 0 ? 'E' : 'W'}</span></div>
            <div><span>Time zone</span><span>{selectedCity.timeZone} ({formatUtcOffset(v.utcOffsetHours)})</span></div>
            <div><span>Day length</span><span>{formatDuration(v.dinamana)}</span></div>
            <div><span>Sunrise</span><span>{formatTime(v.sunriseMin)}</span></div>
            <div><span>Sunset</span><span>{formatTime(v.sunsetMin)}</span></div>
            <div><span>Next sunrise</span><span>{formatTime(v.nextSunriseMin)}</span></div>
            <div><span>Night length</span><span>{formatDuration(v.ratrimana)}</span></div>
            <div><span>Rahu Kaalam</span><span>{formatTime(v.rahuKaalam.start)} – {formatTime(v.rahuKaalam.end)}</span></div>
            <div><span>Yamagandam</span><span>{formatTime(v.yamagandam.start)} – {formatTime(v.yamagandam.end)}</span></div>
            <div><span>Gulika Kaalam</span><span>{formatTime(v.gulikaKaalam.start)} – {formatTime(v.gulikaKaalam.end)}</span></div>
            <div><span>Weekday lord (first Hora)</span><span>{v.horas[0].planet}</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
