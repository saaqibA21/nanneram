import React from 'react';

/**
 * Single-choice control. `options` is [{ value, label }].
 */
export default function Segmented({ options, value, onChange, label, inline = false }) {
  return (
    <div className={`segmented${inline ? ' inline' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
