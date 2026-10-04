import React from 'react';
import { formatTime, getZonedNow } from '../utils/vedicTiming';
import { useApp } from '../context/AppContext';

const formatRemaining = (mins) => {
  const total = Math.max(1, Math.round(mins));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

const within = (minutes, win) => minutes >= win.start && minutes < win.end;

/**
 * What is happening right now in the selected city, and whether it is a good
 * moment to start something. Always live, whatever date is selected below.
 */
export default function NowCard() {
  const { selectedCity, liveHora, nowMs, appMode } = useApp();
  const isGenZ = appMode === 'genz';
  const { hora, gowri, day, minutes } = liveHora;
  const clock = getZonedNow(selectedCity.timeZone, nowMs);

  const inRahu = within(minutes, day.rahuKaalam);
  const inYama = within(minutes, day.yamagandam);
  const badGowri = gowri.quality !== 'Auspicious';

  let verdict = {
    tone: 'good',
    text: isGenZ ? '🟢 Peak Aura Window (+500 Aura)' : 'Good time to start things'
  };
  if (inRahu) {
    verdict = {
      tone: 'bad',
      text: isGenZ ? '🔴 Chaos Hour (Rahu Kaalam): Guaranteed L / Stay low' : 'Rahu Kaalam: avoid starting things'
    };
  } else if (inYama) {
    verdict = {
      tone: 'warn',
      text: isGenZ ? '⚠️ Brain Fog Trap (Yamagandam): Easy tilt' : 'Yamagandam: use care'
    };
  } else if (badGowri) {
    verdict = {
      tone: 'warn',
      text: isGenZ ? `⚠️ ${gowri.name}: Low aura / Mid energy` : `${gowri.name}: use care`
    };
  }

  const rahuStatus = inRahu
    ? (isGenZ ? `Active right now till ${formatTime(day.rahuKaalam.end)} (Avoid risky moves)` : `Active now until ${formatTime(day.rahuKaalam.end)}`)
    : minutes < day.rahuKaalam.start
      ? (isGenZ ? `L-energy window starts in ${formatRemaining(day.rahuKaalam.start - minutes)}` : `Starts in ${formatRemaining(day.rahuKaalam.start - minutes)}`)
      : (isGenZ ? 'Clear for now (Zero Rahu hazard)' : 'Not active');

  const GENZ_HORA_BADGES = {
    Mercury: 'God-Tier Banter & Wit',
    Jupiter: 'Supreme Luck & Academic W',
    Sun: 'Main Character Energy',
    Venus: 'Aesthetic, Drip & High Rizz',
    Moon: 'Chill Vibe Check & Real Talks',
    Mars: 'Demon Mode & Gaming Clutch',
    Saturn: 'Monk Mode / Deep Focus Grind'
  };

  const horaBadgeText = isGenZ
    ? (GENZ_HORA_BADGES[hora.planet] || hora.badge)
    : hora.badge;

  const gowriQualityText = isGenZ
    ? (gowri.quality === 'Auspicious' ? 'Elite Timing (Nalla Neram)' : 'NPC Energy / Friction')
    : (gowri.quality === 'Auspicious' ? 'Nalla Neram' : 'Not favourable');

  return (
    <div className="card now" aria-label={`Right now in ${selectedCity.name}`}>
      <div className="now-cell">
        <div className="now-label">{isGenZ ? `Live Radar · ${selectedCity.name}` : `Right now in ${selectedCity.name}`}</div>
        <div className="now-time">{formatTime(clock.minutesFromMidnight)}</div>
        <span className={`badge badge-${verdict.tone}`}>
          <span className="dot" aria-hidden="true" />
          {verdict.text}
        </span>
      </div>

      <div className="now-cell">
        <div className="now-label">{isGenZ ? 'Aura Hora' : 'Hora'}</div>
        <div className="now-value">{hora.planet}</div>
        <div className="now-sub">
          {horaBadgeText}. Ends {formatTime(hora.end)} (in {formatRemaining(hora.end - minutes)})
        </div>
      </div>

      <div className="now-cell">
        <div className="now-label">{isGenZ ? 'Gowri Vibe' : 'Gowri'}</div>
        <div className="now-value">{gowri.name}</div>
        <div className="now-sub">
          {gowriQualityText} ({gowri.rank.toLowerCase()}). Ends {formatTime(gowri.end)}
        </div>
      </div>

      <div className="now-cell">
        <div className="now-label">{isGenZ ? 'Rahu Kaalam (The L Window)' : 'Rahu Kaalam today'}</div>
        <div className="now-value">
          {formatTime(day.rahuKaalam.start)} – {formatTime(day.rahuKaalam.end)}
        </div>
        <div className="now-sub">{rahuStatus}</div>
      </div>
    </div>
  );
}
