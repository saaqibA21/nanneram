import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, CalendarClock, RotateCcw, Sparkles } from 'lucide-react';
import { CITIES, getZonedNow } from '../utils/vedicTiming';
import { answerQuestion } from '../utils/ask/engine';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/layout/PageHeader';

const STORAGE_KEY = 'nanneram_ask_thread_v2';

const SUGGESTIONS = [
  'Is now a good time to start something?',
  'When is Rahu Kaalam tomorrow?',
  'Best time for a job interview on Friday?',
  'Is 3 PM okay for a client call today?',
  'Which day this week is best to sign a contract?',
  "Today's panchang",
  'When is the next Pournami?',
  'What should I wear for an investor pitch?',
  'Griha pravesam dates next month',
  'Rahu Kaalam in Toronto tomorrow',
  '10 AM IST in New York time',
  'How do I add my Zoom link to invites?'
];

const GENZ_SUGGESTIONS = [
  'is rn a good time to text my crush?',
  'best time to ask my parents for money this week?',
  'when is rahu kaalam tmrw?',
  'what colour should i wear on a first date?'
];

function loadThread() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/* Small, safe renderer for **bold** and "- " bullet lines (no HTML injection). */
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

function RichText({ text }) {
  const blocks = [];
  let list = null;
  text.split('\n').forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
    if (bullet) {
      if (!list) {
        list = [];
        blocks.push(<ul key={`ul${i}`}>{list}</ul>);
      }
      list.push(<li key={i}>{renderInline(bullet[1])}</li>);
      return;
    }
    list = null;
    if (line.trim()) blocks.push(<p key={i}>{renderInline(line.replace(/^#+\s*/, ''))}</p>);
  });
  return <div className="rich">{blocks}</div>;
}

function SlotsBlock({ slots }) {
  const { setSelectedCity, setTargetDateStr, setMeetingPurpose, setDurationMins } = useApp();
  const navigate = useNavigate();
  const city = CITIES.find((c) => c.name === slots.city);

  const openInSchedule = () => {
    setSelectedCity(city);
    setTargetDateStr(slots.date);
    setMeetingPurpose(slots.purpose.length > 60 ? `${slots.purpose.slice(0, 57)}…` : slots.purpose);
    if ([15, 30, 45, 60].includes(slots.durationMinutes)) setDurationMins(slots.durationMinutes);
    navigate('/schedule');
  };

  return (
    <div className="ask-slots">
      <div className="ask-slots-head">
        <span className="eyebrow">{slots.city} · {slots.weekday} {slots.date} · {slots.durationMinutes} min</span>
      </div>
      <ul>
        {slots.slots.map((s) => (
          <li key={s.rank}>
            <strong>{s.start} – {s.end}</strong>
            <span className="badge badge-accent">{s.hora} Hora</span>
            <span className="badge badge-good">{s.gowri}</span>
          </li>
        ))}
      </ul>
      {city && (
        <button className="btn btn-secondary btn-sm" onClick={openInSchedule}>
          <CalendarClock size={15} /> Add one to my calendar
        </button>
      )}
    </div>
  );
}

export default function AskPage() {
  const { selectedCity, targetDateStr, appMode, vedicData } = useApp();
  const [thread, setThread] = useState(loadThread);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(thread.slice(-30)));
    } catch {
      /* storage blocked: the thread just isn't kept between pages */
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread, busy]);

  const send = (text) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;
    setInput('');
    const prior = thread;
    setThread([...prior, { role: 'user', content: question }]);
    setBusy(true);

    // Let the question paint first; month-long searches take a moment on slow phones.
    setTimeout(() => {
      let result;
      try {
        result = answerQuestion(question, {
          history: prior,
          defaultCity: selectedCity,
          selectedDate: targetDateStr === getZonedNow(selectedCity.timeZone).dateStr ? null : targetDateStr,
          mode: appMode
        });
      } catch (err) {
        console.error('Ask failed', err);
        result = {
          answer: 'Sorry, I tripped over that one. Try rephrasing it, for example "best time for a meeting tomorrow" or "Rahu Kaalam on Friday".',
          slots: null,
          suggestions: ['Is now a good time to start something?', 'Rahu Kaalam today', "Today's panchang"],
          meta: null
        };
      }
      setThread((t) => [...t, { role: 'assistant', content: result.answer, slots: result.slots, suggestions: result.suggestions, meta: result.meta }]);
      setBusy(false);
      inputRef.current?.focus();
    }, 30);
  };

  const suggestions = appMode === 'genz' ? [...GENZ_SUGGESTIONS, ...SUGGESTIONS.slice(0, 4)] : SUGGESTIONS;
  const lastAnswer = [...thread].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="page container ask-page">
      <PageHeader
        title={appMode === 'genz' ? 'Ask anything fr' : 'Ask anything'}
        description={`Questions about good times, Rahu Kaalam, meetings, what to wear, what a term means, or how Nanneram works. Times use ${selectedCity.name} unless you name another place.`}
      />

      <section className="card ask-thread" aria-label="Conversation">
        {thread.length === 0 ? (
          <div className="ask-empty">
            <Sparkles size={22} />
            <p>Try one of these, or type your own question.</p>
            <div className="chips">
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ask-messages" aria-live="polite">
            {thread.map((m, i) => (
              <div key={i} className={`ask-msg ask-${m.role}`}>
                {m.role === 'user' ? (
                  <p>{m.content}</p>
                ) : (
                  <>
                    <RichText text={m.content} />
                    {m.slots?.slots?.length > 0 && <SlotsBlock slots={m.slots} />}
                  </>
                )}
              </div>
            ))}
            {!busy && lastAnswer?.suggestions?.length > 0 && thread[thread.length - 1] === lastAnswer && (
              <div className="chips ask-followups" aria-label="Suggested follow-up questions">
                {lastAnswer.suggestions.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
            {busy && (
              <div className="ask-msg ask-assistant ask-typing" aria-label="Working on an answer">
                <span /><span /><span />
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </section>

      <form
        className="ask-composer card"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="ask-input" className="sr-only">Your question</label>
        <textarea
          id="ask-input"
          ref={inputRef}
          className="textarea"
          rows={2}
          maxLength={2000}
          value={input}
          placeholder={`Ask about ${vedicData.dayName}, any date or any city…`}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="ask-composer-row">
          <span className="small muted">Calculated on your device for {selectedCity.name} unless you name a place. Enter to send.</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {thread.length > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setThread([])} disabled={busy}>
                <RotateCcw size={14} /> New chat
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !input.trim()}>
              <ArrowUp size={15} /> Ask
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
