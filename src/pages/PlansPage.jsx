import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/layout/PageHeader';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'during the preview',
    blurb: 'Everything on the site today.',
    features: [
      { text: 'Rahu Kaalam, Nalla Neram, Horas and Gowri for 11 cities' },
      { text: 'Meeting slot finder with Google Calendar and .ics export' },
      { text: 'Meeting advisor' },
      { text: 'Live in-call chronometer extension', soon: true }
    ],
    cta: { label: 'Start scheduling', to: '/schedule' }
  },
  {
    name: 'Pro',
    price: '₹599',
    period: '/ month ($15)',
    blurb: 'For founders, sales leads and consultants.',
    featured: true,
    features: [
      { text: 'Everything in Free' },
      { text: 'Two-way calendar sync that blocks Rahu Kaalam', soon: true },
      { text: 'Reminders before the wrap-up time', soon: true },
      { text: 'Saved cities, meetings and preferences', soon: true }
    ],
    cta: { label: 'Try the advisor', to: '/advisor' }
  },
  {
    name: 'Team',
    price: '₹2,499',
    period: '/ month ($49)',
    blurb: 'For brokerages, funds and partnerships.',
    features: [
      { text: 'Up to 5 seats', soon: true },
      { text: 'Multi-party timing across time zones', soon: true },
      { text: 'Shared company booking link', soon: true },
      { text: 'WhatsApp alerts', soon: true }
    ],
    cta: { label: 'Notify me', notify: true }
  }
];

export default function PlansPage() {
  const { triggerToast } = useApp();

  return (
    <div className="page container">
      <PageHeader
        title="Plans"
        description="Paid plans are not open yet. Everything you see on Nanneram today is free during the preview. This is what is planned."
      />

      <div className="grid-3">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`card plan${plan.featured ? ' plan-featured' : ''}`}>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>{plan.name}</h2>
              <p className="small">{plan.blurb}</p>
            </div>
            <div className="plan-price">{plan.price} <small>{plan.period}</small></div>
            <ul>
              {plan.features.map((f) => (
                <li key={f.text} className={f.soon ? 'off' : ''}>
                  {f.soon ? <Clock size={16} /> : <Check size={16} />}
                  <span>
                    {f.text}
                    {f.soon && <span className="badge" style={{ marginLeft: '0.4rem' }}>Coming soon</span>}
                  </span>
                </li>
              ))}
            </ul>
            {plan.cta.notify ? (
              <button className="btn btn-secondary btn-block" onClick={() => triggerToast('Team plans are not open yet.')}>
                {plan.cta.label}
              </button>
            ) : (
              <Link to={plan.cta.to} className={`btn btn-block ${plan.featured ? 'btn-dark' : 'btn-secondary'}`}>
                {plan.cta.label}
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
