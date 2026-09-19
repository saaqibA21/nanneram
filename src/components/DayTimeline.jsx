import React, { useState } from 'react';
import { formatTime } from '../utils/vedicTiming';
import { useApp } from '../context/AppContext';
import Segmented from './ui/Segmented';

const HORA_TONE = {
  Sun: 'strong', Jupiter: 'strong', Mercury: 'strong',
  Venus: 'neutral', Moon: 'neutral',
  Mars: 'caution', Saturn: 'caution'
};

const AVOID_INFO = {
  rahu: { label: 'Rahu Kaalam', short: 'Rahu', tone: 'bad', text: 'Avoid starting contracts, pitches or big decisions.' },
  yama: { label: 'Yamagandam', short: 'Yama', tone: 'warn', text: 'Actions begun now tend to meet friction. Avoid launches and large spending.' },
  gulika: { label: 'Gulika Kaalam', short: 'Gulika', tone: 'neutral', text: 'Things begun now tend to repeat. Fine for routine work, not for disputes.' }
};

/**
 * One glanceable strip per half of the Vedic day (sunrise to sunset, or
 * sunset to next sunrise). Hora, Gowri and avoid-windows share one time axis.
 */
export default function DayTimeline() {
  const { vedicData: v, liveHora } = useApp();

  const liveIsThisDate = liveHora.day.date.getTime() === v.date.getTime();
  const nowIsNight = liveIsThisDate && liveHora.minutes >= v.sunsetMin;
  const [mode, setMode] = useState(nowIsNight ? 'night' : 'day');
  const [selected, setSelected] = useState(null);

  const isDay = mode === 'day';
  const start = isDay ? v.sunriseMin : v.sunsetMin;
  const end = isDay ? v.sunsetMin : v.nextSunriseMin;
  const horas = isDay ? v.horas : v.nightHoras;
  const gowri = isDay ? v.gowriSlots : v.nightGowriSlots;
  const pos = (t) => ((t - start) / (end - start)) * 100;

  const nowVisible = liveIsThisDate && liveHora.minutes >= start && liveHora.minutes < end;

  const avoidBlocks = [
    { key: 'rahu', win: v.rahuKaalam },
    { key: 'yama', win: v.yamagandam },
    { key: 'gulika', win: v.gulikaKaalam }
  ];

  const pick = (kind, i) => setSelected((cur) => (cur && cur.kind === kind && cur.i === i ? null : { kind, i }));

  const renderDetail = () => {
    if (!selected) return <span className="muted">Select any block to see what it means.</span>;
    if (selected.kind === 'hora') {
      const h = horas[selected.i];
      return (
        <>
          <strong>{h.name}</strong> · {formatTime(h.start)} – {formatTime(h.end)}<br />
          {h.rulerMeaning} Good for: {h.goodFor.slice(0, 3).join(', ')}. Avoid: {h.avoidFor.join(', ')}.
        </>
      );
    }
    if (selected.kind === 'gowri') {
      const g = gowri[selected.i];
      return (
        <>
          <strong>{g.name}</strong> ({g.rank}) · {formatTime(g.start)} – {formatTime(g.end)}<br />
          {g.desc}.
        </>
      );
    }
    const b = avoidBlocks[selected.i];
    const info = AVOID_INFO[b.key];
    return (
      <>
        <strong>{info.label}</strong> · {formatTime(b.win.start)} – {formatTime(b.win.end)}<br />
        {info.text}
      </>
    );
  };

  return (
    <div className="card tl-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h3>{v.dayName}'s timeline</h3>
          <p className="small muted">
            {isDay
              ? `Sunrise to sunset, ${formatTime(v.sunriseMin)} – ${formatTime(v.sunsetMin)}`
              : `Sunset to next sunrise, ${formatTime(v.sunsetMin)} – ${formatTime(v.nextSunriseMin)}`}
          </p>
        </div>
        <Segmented
          inline
          label="Part of the day"
          value={mode}
          onChange={(m) => { setMode(m); setSelected(null); }}
          options={[{ value: 'day', label: 'Day' }, { value: 'night', label: 'Night' }]}
        />
      </div>

      <div className="tl-rows">
        {nowVisible && (
          <div className="tl-now" style={{ left: `${pos(liveHora.minutes)}%` }}>
            <span>Now</span>
          </div>
        )}

        <div className="tl-caption"><span>Hora (ruling planet)</span></div>
        <div className="tl-bar">
          {horas.map((h, i) => (
            <button
              key={h.index}
              className={`tl-seg tl-seg-${HORA_TONE[h.planet]}`}
              aria-pressed={selected?.kind === 'hora' && selected.i === i}
              aria-label={`${h.name}, ${formatTime(h.start)} to ${formatTime(h.end)}`}
              onClick={() => pick('hora', i)}
            >
              <span className="full">{h.planet}</span>
              <span className="short">{h.planet.slice(0, 2)}</span>
            </button>
          ))}
        </div>

        <div className="tl-caption"><span>Gowri panchangam</span></div>
        <div className="tl-bar">
          {gowri.map((g, i) => (
            <button
              key={g.part}
              className={`tl-seg ${g.quality === 'Auspicious' ? 'tl-seg-good' : 'tl-seg-bad'}`}
              aria-pressed={selected?.kind === 'gowri' && selected.i === i}
              aria-label={`${g.name}, ${g.quality}, ${formatTime(g.start)} to ${formatTime(g.end)}`}
              onClick={() => pick('gowri', i)}
            >
              <span className="full">{g.name}</span>
              <span className="short">{g.name.slice(0, 2)}</span>
            </button>
          ))}
        </div>

        {isDay && (
          <>
            <div className="tl-caption"><span>Windows to watch</span></div>
            <div className="tl-bar tl-abs">
              {avoidBlocks.map((b, i) => {
                const info = AVOID_INFO[b.key];
                return (
                  <button
                    key={b.key}
                    className={`tl-block tl-block-${info.tone}`}
                    style={{ left: `${pos(b.win.start)}%`, width: `${pos(b.win.end) - pos(b.win.start)}%` }}
                    aria-pressed={selected?.kind === 'avoid' && selected.i === i}
                    aria-label={`${info.label}, ${formatTime(b.win.start)} to ${formatTime(b.win.end)}`}
                    onClick={() => pick('avoid', i)}
                  >
                    {info.short}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="tl-axis" aria-hidden="true">
        <span>{formatTime(start)}</span>
        <span>{formatTime((start + end) / 2)}</span>
        <span>{formatTime(end)}</span>
      </div>

      {!isDay && (
        <p className="small muted" style={{ marginTop: '0.75rem' }}>
          Rahu Kaalam, Yamagandam and Gulika apply to the daytime only.
        </p>
      )}

      <div className="tl-detail" aria-live="polite">{renderDetail()}</div>

      <div className="legend">
        <span><i style={{ background: 'var(--accent-soft)', border: '1px solid #ecc9ad' }} />Strong for meetings (Sun, Jupiter, Mercury)</span>
        <span><i style={{ background: 'var(--surface-2)', border: '1px solid var(--line-strong)' }} />Gentle (Venus, Moon)</span>
        <span><i style={{ background: 'var(--bad-soft)', border: '1px solid #e3bcb6' }} />Caution (Mars, Saturn)</span>
        <span><i style={{ background: 'var(--good-soft)', border: '1px solid #bcdcc8' }} />Nalla Neram</span>
      </div>
    </div>
  );
}
