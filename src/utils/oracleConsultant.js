/**
 * Nanneram AI Horological Meeting & Attire Consultant
 * Computes deterministic astrological attire, power directions, psychological openers,
 * and precision planetary scheduling.
 */

import { formatTime } from './vedicTiming';

export const PLANETARY_ATTIRE = {
  Mercury: {
    planet: 'Mercury (Budha)',
    title: 'The Sovereign Merchant & Closer',
    primaryColor: 'Emerald Green',
    colorHex: '#10b981',
    colorSwatches: ['#10b981', '#059669', '#34d399', '#f0fdf4'],
    recommendedPalette: 'Emerald Green, Deep Jade, Sage, or Crisp White with Mint Accents',
    avoidColors: 'Aggressive Neon Red or Muddy Brown (disrupts quick commercial rapport)',
    fabrics: 'Crisp structured linen or tailored cotton shirt. Clean pressed collar.',
    metalAndWatch: 'Minimalist silver or white-gold timepiece; light emerald or jade accent.',
    direction: 'North',
    directionMeaning: 'Direction of Kubera (Lord of Wealth) and Mercury. Maximizes cash flow, pricing leverage, and swift agreement.',
    element: 'Earth / Intellect',
    energy: 'Analytical, persuasive, numeric agility, closing velocity'
  },
  Jupiter: {
    planet: 'Jupiter (Guru)',
    title: 'The Supreme Chancellor & Strategist',
    primaryColor: 'Golden Amber & Saffron',
    colorHex: '#eab308',
    colorSwatches: ['#eab308', '#ca8a04', '#fef08a', '#78350f'],
    recommendedPalette: 'Golden Yellow, Warm Saffron, Honey Amber, Mustard, or Royal Cream',
    avoidColors: 'Dull washed-out charcoal or drab gray (diminishes the aura of visionary abundance)',
    fabrics: 'Fine wool blazer, heavyweight cashmere, or royal cream raw silk.',
    metalAndWatch: 'Classic yellow gold or antique brass watch; yellow sapphire or citrine signet.',
    direction: 'North-East (Ishanya)',
    directionMeaning: 'The celestial sanctuary gate. Radiates undisputed ethical authority, strategic vision, and investor confidence.',
    element: 'Ether / Wisdom',
    energy: 'Visionary, commanding respect, legal certainty, institutional capital'
  },
  Sun: {
    planet: 'Sun (Surya)',
    title: 'The Sovereign Commander',
    primaryColor: 'Burnt Copper & Ruby',
    colorHex: '#f97316',
    colorSwatches: ['#ea580c', '#c2410c', '#fdba74', '#7c2d12'],
    recommendedPalette: 'Deep Copper, Burnt Orange, Ruby Wine, Terracotta, or Bold Crimson',
    avoidColors: 'Faded denim blue or washed-out pastels (signals deference rather than command)',
    fabrics: 'Impeccably tailored bespoke suit, structured shoulders, sharp silhouette.',
    metalAndWatch: 'Rose gold or polished bronze chronograph; ruby or garnet cuff links.',
    direction: 'East',
    directionMeaning: 'Direction of Sunrise and Indra. Solidifies leadership primacy, executive dominance, and regulatory victory.',
    element: 'Fire / Authority',
    energy: 'Decisive, fearless leadership, executive gravitas, final authority'
  },
  Venus: {
    planet: 'Venus (Shukra)',
    title: 'The Master Diplomat & Creator',
    primaryColor: 'Pearl White & Champagne',
    colorHex: '#ec4899',
    colorSwatches: ['#f472b6', '#db2777', '#fdf2f8', '#e2e8f0'],
    recommendedPalette: 'Pearl White, Champagne, Soft Silver, Pastel Rose, or Ivory Silk',
    avoidColors: 'Harsh industrial neon or disheveled unpressed clothing (kills aesthetic charm)',
    fabrics: 'Pure silk, fine satin weave, cashmere blend with refined drape.',
    metalAndWatch: 'Platinum or polished white gold; diamond or clear zircon; subtle refined fragrance.',
    direction: 'North or South-East',
    directionMeaning: 'Channel of Venusian diplomacy. Dissolves interpersonal friction and generates instant empathetic buy-in.',
    element: 'Water / Magnetism',
    energy: 'Diplomatic charm, creative brilliance, partnership accord, aesthetic mastery'
  },
  Moon: {
    planet: 'Moon (Chandra)',
    title: 'The Empathetic Mediator',
    primaryColor: 'Silver & Alabaster',
    colorHex: '#94a3b8',
    colorSwatches: ['#cbd5e1', '#64748b', '#f8fafc', '#334155'],
    recommendedPalette: 'Alabaster, Pearl Ivory, Soft Silver, or Pale Morning Mist',
    avoidColors: 'Jarring blood red (stirs emotional reactivity)',
    fabrics: 'Soft breathable cotton, relaxed knit blazer, clean understated textures.',
    metalAndWatch: 'Brushed silver or moonstone; clean circular dial watch.',
    direction: 'North-West',
    directionMeaning: 'Direction of Vayu and Chandra. Fosters psychological safety, deep listening, and mutual vulnerability.',
    element: 'Water / Mind',
    energy: 'Psychological resonance, consensus building, clear emotional pacing'
  },
  Mars: {
    planet: 'Mars (Mangal)',
    title: 'The Shielded Vanguard',
    primaryColor: 'Deep Charcoal with Crimson Accent',
    colorHex: '#dc2626',
    colorSwatches: ['#1e293b', '#dc2626', '#475569', '#f87171'],
    recommendedPalette: 'Protective Dark Charcoal or Obsidian Navy with a subtle Crimson accent pin',
    avoidColors: 'All-red suits (triggers fight-or-flight in the counterparty)',
    fabrics: 'Durable structured twill or dark tailored jacket.',
    metalAndWatch: 'Titanium or black ceramic watch.',
    direction: 'South',
    directionMeaning: 'Commanding boundaries. Strictly for firm dispute terminations or crisis mitigation.',
    element: 'Fire / Defense',
    energy: 'Hard boundaries, termination clarity, defensive composure'
  },
  Saturn: {
    planet: 'Saturn (Shani)',
    title: 'The Patient Auditor',
    primaryColor: 'Midnight Navy & Slate',
    colorHex: '#475569',
    colorSwatches: ['#0f172a', '#334155', '#94a3b8', '#1e293b'],
    recommendedPalette: 'Midnight Navy, Deep Slate, or Dark Cobalt with crisp white shirt',
    avoidColors: 'Bright frivolous yellows or neon tones',
    fabrics: 'Heavy matte wool or dark untextured fabric.',
    metalAndWatch: 'Dark steel or matte iron finish timepiece.',
    direction: 'West',
    directionMeaning: 'Direction of Saturn. Demands meticulous patience, exhaustive audits, and long-term stamina.',
    element: 'Air / Karma',
    energy: 'Accountability, forensic scrutiny, unshakeable perseverance'
  }
};

/**
 * Detect meeting archetype based on text query
 */
export function detectMeetingArchetype(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('vc') || lower.includes('investor') || lower.includes('pitch') || lower.includes('seed') || lower.includes('series a') || lower.includes('fundrais') || lower.includes('term sheet') || lower.includes('valuation') || lower.includes('angel')) {
    return 'INVESTOR_PITCH';
  }
  if (lower.includes('salary') || lower.includes('raise') || lower.includes('promot') || lower.includes('compensation') || lower.includes('hike') || lower.includes('bonus') || lower.includes('appraisal') || lower.includes('equity split')) {
    return 'SALARY_NEGOTIATION';
  }
  if (lower.includes('client') || lower.includes('deal') || lower.includes('contract') || lower.includes('sale') || lower.includes('pricing') || lower.includes('sign') || lower.includes('closing') || lower.includes('msa') || lower.includes('sow') || lower.includes('proposal')) {
    return 'CLIENT_CLOSING';
  }
  if (lower.includes('interview') || lower.includes('hire') || lower.includes('candidate') || lower.includes('executive') || lower.includes('vp') || lower.includes('cto') || lower.includes('c-level')) {
    return 'EXECUTIVE_HIRING';
  }
  if (lower.includes('dispute') || lower.includes('fire') || lower.includes('terminat') || lower.includes('conflict') || lower.includes('lawyer') || lower.includes('settle') || lower.includes('legal')) {
    return 'CRISIS_DISPUTE';
  }
  if (lower.includes('design') || lower.includes('brand') || lower.includes('creative') || lower.includes('ux') || lower.includes('product review') || lower.includes('pr ') || lower.includes('marketing')) {
    return 'CREATIVE_ALLIANCE';
  }
  return 'STRATEGIC_CONSULT';
}

/**
 * Generate full Astrological Consultation Decree
 */
export function generateOracleConsultation({
  topic,
  goal,
  strategy,
  prompt,
  vedicData,
  selectedCity,
  optimalSlots = []
}) {
  const combinedText = prompt || `${topic || ''} ${goal || ''} ${strategy || ''}`;
  const archetype = detectMeetingArchetype(combinedText);

  // Determine best matching slot based on archetype
  let chosenSlot = optimalSlots[0];
  
  if (archetype === 'INVESTOR_PITCH') {
    const found = optimalSlots.find(s => s.hora.planet === 'Jupiter' || s.hora.planet === 'Sun' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'SALARY_NEGOTIATION' || archetype === 'CLIENT_CLOSING') {
    const found = optimalSlots.find(s => s.hora.planet === 'Mercury' || s.hora.planet === 'Jupiter');
    if (found) chosenSlot = found;
  } else if (archetype === 'CREATIVE_ALLIANCE') {
    const found = optimalSlots.find(s => s.hora.planet === 'Venus' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  }

  const planetName = chosenSlot?.hora?.planet || 'Mercury';
  const attire = PLANETARY_ATTIRE[planetName] || PLANETARY_ATTIRE.Mercury;
  
  let openingScript = '';
  let tacticalAdvice = '';
  let deskRitual = '';

  switch (archetype) {
    case 'INVESTOR_PITCH':
      openingScript = `"Thank you for convening today. Before diving into deck mechanics, let's align on the macro shift that makes our timing mathematically inevitable..."`;
      tacticalAdvice = `Lead with undeniable compounding metrics within the first 120 seconds. Do not plead for capital; frame the allocation as a finite window of entry into an accelerating trajectory. Conclude 5 minutes before the graceful exit timestamp so the partner experiences urgency rather than meeting exhaustion.`;
      deskRitual = `Position your webcam facing ${attire.direction}. Keep a brass or glass vessel of clear water directly to your right; sip once immediately before reciting your valuation ask.`;
      break;

    case 'SALARY_NEGOTIATION':
      openingScript = `"I appreciate your time today. Over the past cycle, our team delivered results that exceeded our quarterly benchmarks. Today, I'd like to align my compensation with the market value of that impact."`;
      tacticalAdvice = `Anchor with an exact number rather than a round range (e.g. $184,000 instead of $180k). Once you state your target number, remain completely silent for 5 full seconds. Silence under ${attire.planet} creates psychological surrender in the counterparty.`;
      deskRitual = `Wear a ${attire.primaryColor} shirt or accessory. Face ${attire.direction} so your back is protected and your gaze projects calm inevitability.`;
      break;

    case 'CLIENT_CLOSING':
      openingScript = `"Our objective today is simple: finalize the remaining operational terms so your team can commence deployment by next Monday without losing another week of revenue."`;
      tacticalAdvice = `Every objection is merely an unanswered request for risk mitigation. Answer every price hesitation with a scope adjustment rather than a free discount. Lock in verbal agreement during the active ${chosenSlot?.hora?.name || 'Mercury Hora'} window.`;
      deskRitual = `Keep your physical notebook open with a green or brass pen visible on camera. A green writing instrument honors Mercury and channels closing finality.`;
      break;

    case 'CRISIS_DISPUTE':
      openingScript = `"We are meeting today not to re-litigate past friction, but to execute a clean, definitive demarcation that protects mutual interests and allows both parties to proceed unencumbered."`;
      tacticalAdvice = `Speak with 20% slower cadence than your usual tempo. Do not respond to inflammatory provocations. Document all points in writing in the chat before closing the call at ${chosenSlot?.gracefulExitWindow || 'the scheduled exit minute'}.`;
      deskRitual = `Wear dark obsidian or navy to ground chaotic energy. Face South or West to enforce unbreakable boundary integrity.`;
      break;

    case 'CREATIVE_ALLIANCE':
      openingScript = `"We designed this concept around a singular emotional truth. Let me walk you through the experience as your customer will live it..."`;
      tacticalAdvice = `Frame design decisions through empathy and human prestige. Avoid technical jargon until visual rapport is cemented. Shukra (Venus) rewards aesthetic generosity and fluid dialogue.`;
      deskRitual = `Set your virtual lighting to warm 3200K amber. Use minimalist clean background with no visual clutter.`;
      break;

    default:
      openingScript = `"I've outlined three strategic outcomes for our discussion today to ensure we maximize velocity and conclude with clear operational ownership."`;
      tacticalAdvice = `Maintain conversational control by setting the agenda in minute one. Anchor every commitment to a named person and a firm deadline before the planetary transit ends.`;
      deskRitual = `Face ${attire.direction}. Keep posture upright to project solar meridian balance.`;
      break;
  }

  return {
    archetype,
    topic: prompt || topic || 'High-Stakes Strategic Sync',
    goal: goal || 'Flawless execution and binding agreement',
    strategy: strategy || 'Measured articulation with firm boundary control',
    city: selectedCity.name,
    dateStr: vedicData.targetDate ? vedicData.targetDate.toDateString() : new Date().toDateString(),
    slot: chosenSlot || {
      startTimeFormatted: '11:15 AM',
      endTimeFormatted: '11:45 AM',
      gracefulExitWindow: '11:42 AM',
      hora: { name: 'Mercury Hora (Budha)', planet: 'Mercury' },
      gowri: { name: 'Amirtham (Divine Nectar)', quality: 'Auspicious' },
      recommendation: 'Peak harmony for binding commercial transactions and fast agreement.'
    },
    attire,
    openingScript,
    tacticalAdvice,
    deskRitual,
    rahuAvoidance: `${formatTime(vedicData.rahuKaalam.start)} – ${formatTime(vedicData.rahuKaalam.end)} (Vetted 100% Shadow-Free)`,
    generatedAt: new Date().toLocaleTimeString()
  };
}
