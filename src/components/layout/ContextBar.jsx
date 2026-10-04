import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CITIES, formatUtcOffset, getTodayInZone } from '../../utils/vedicTiming';
import { useApp } from '../../context/AppContext';

const shiftDate = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(y, m - 1, d + days);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
};

/**
 * City and date pickers. Every page's times depend on these two values,
 * so they are shown at the top of Today, Schedule and Advisor.
 */
export default function ContextBar() {
  const { selectedCity, setSelectedCity, targetDateStr, setTargetDateStr, vedicData } = useApp();
  const today = getTodayInZone(selectedCity.timeZone);

  return (
    <div className="context-bar">
      <div className="field field-city">
        <label className="field-label" htmlFor="ctx-city">City</label>
        <select
          id="ctx-city"
          className="select"
          value={selectedCity.name}
          onChange={(e) => {
            const found = CITIES.find((c) => c.name === e.target.value);
            if (found) setSelectedCity(found);
          }}
        >
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
          ))}
        </select>
      </div>

      <div className="date-nav">
        <button className="icon-btn btn-secondary date-nav-btn" style={{ border: '1px solid var(--line-strong)' }} onClick={() => setTargetDateStr(shiftDate(targetDateStr, -1))} aria-label="Previous day">
          <ChevronLeft size={18} />
        </button>
        <div className="field field-date">
          <label className="field-label" htmlFor="ctx-date">Date</label>
          <input
            id="ctx-date"
            className="input"
            type="date"
            value={targetDateStr}
            onChange={(e) => e.target.value && setTargetDateStr(e.target.value)}
          />
        </div>
        <button className="icon-btn btn-secondary date-nav-btn" style={{ border: '1px solid var(--line-strong)' }} onClick={() => setTargetDateStr(shiftDate(targetDateStr, 1))} aria-label="Next day">
          <ChevronRight size={18} />
        </button>
      </div>

      <button
        className="btn btn-secondary ctx-today-btn"
        onClick={() => setTargetDateStr(today)}
        disabled={targetDateStr === today}
      >
        Today
      </button>

      <span className="context-note">
        {vedicData.dayName} · {selectedCity.name} time, {formatUtcOffset(vedicData.utcOffsetHours)}
      </span>
    </div>
  );
}
