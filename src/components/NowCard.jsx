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
  const { selectedCity, liveHora, nowMs } = useApp();
  const { hora, gowri, day, minutes } = liveHora;
  const clock = getZonedNow(selectedCity.timeZone, nowMs);

  const inRahu = within(minutes, day.rahuKaalam);
  const inYama = within(minutes, day.yamagandam);
  const badGowri = gowri.quality !== 'Auspicious';

  let verdict = { tone: 'good', text: 'Good time to start things' };
  if (inRahu) verdict = { tone: 'bad', text: 'Rahu Kaalam: avoid starting things' };
  else if (inYama) verdict = { tone: 'warn', text: 'Yamagandam: use care' };
  else if (badGowri) verdict = { tone: 'warn', text: `${gowri.name}: use care` };

  const rahuStatus = inRahu
    ? `Active now until ${formatTime(day.rahuKaalam.end)}`
    : minutes < day.rahuKaalam.start
      ? `Starts in ${formatRemaining(day.rahuKaalam.start - minutes)}`
      : 'Not active';

  return (
    <div className="card now" aria-label={`Right now in ${selectedCity.name}`}>
      <div className="now-cell">
        <div className="now-label">Right now in {selectedCity.name}</div>
        <div className="now-time">{formatTime(clock.minutesFromMidnight)}</div>
        <span className={`badge badge-${verdict.tone}`}>
          <span className="dot" aria-hidden="true" />
          {verdict.text}
        </span>
      </div>

      <div className="now-cell">
        <div className="now-label">Hora</div>
        <div className="now-value">{hora.planet}</div>
        <div className="now-sub">
          {hora.badge}. Ends {formatTime(hora.end)} (in {formatRemaining(hora.end - minutes)})
        </div>
      </div>

      <div className="now-cell">
        <div className="now-label">Gowri</div>
        <div className="now-value">{gowri.name}</div>
        <div className="now-sub">
          {gowri.quality === 'Auspicious' ? 'Nalla Neram' : 'Not favourable'} ({gowri.rank.toLowerCase()}). Ends {formatTime(gowri.end)}
        </div>
      </div>

      <div className="now-cell">
        <div className="now-label">Rahu Kaalam today</div>
        <div className="now-value">
          {formatTime(day.rahuKaalam.start)} – {formatTime(day.rahuKaalam.end)}
        </div>
        <div className="now-sub">{rahuStatus}</div>
      </div>
    </div>
  );
}
