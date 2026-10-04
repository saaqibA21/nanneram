/**
 * Nanneram AI Horological Meeting & Attire Consultant
 * Computes deterministic astrological attire, power directions, psychological openers,
 * and precision planetary scheduling.
 */

import { formatTime, findOptimalMeetingSlots } from './vedicTiming';

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
  
  // 1. Meeting crush / partner's father or parents (Highest priority)
  const isCrushOrPartner = lower.includes('crush') || lower.includes('girlfriend') || lower.includes('boyfriend') || lower.includes('partner') || lower.includes('her') || lower.includes('his') || lower.includes('in-law');
  const isParentOrFamily = lower.includes('dad') || lower.includes('father') || lower.includes('mom') || lower.includes('mother') || lower.includes('parent') || lower.includes('family');

  if ((lower.includes('crush') && isParentOrFamily) || (isCrushOrPartner && isParentOrFamily) || lower.includes('meet the parents')) {
    return 'CRUSH_PARENTS';
  }

  // 2. Direct crush rizz / texting / asking out
  if (lower.includes('crush') || lower.includes('rizz') || lower.includes('dm') || lower.includes('slide') || lower.includes('dating') || lower.includes('flirt') || lower.includes('ask out') || lower.includes('confess') || lower.includes('first date') || lower.includes('story reply') || lower.includes('text her') || lower.includes('text him') || lower.includes('texting') || lower.includes('love')) {
    return 'CRUSH_RIZZ';
  }

  // 3. Negotiating with own parents
  if (lower.includes('parent') || lower.includes('mom') || lower.includes('dad') || lower.includes('curfew') || lower.includes('permission') || lower.includes('strict') || lower.includes('allowance') || lower.includes('pocket money') || lower.includes('borrow car')) {
    return 'PARENT_PERMISSION';
  }

  // 4. Academic teachers / professors / faculty
  if (lower.includes('teacher') || lower.includes('professor') || lower.includes('principal') || lower.includes('dean') || lower.includes('attendance') || lower.includes('grade') || lower.includes('marks') || lower.includes('extension') || lower.includes('faculty') || lower.includes('re-evaluation')) {
    return 'TEACHER_PROFESSOR';
  }

  // 5. Exam study & deep cramming
  if (lower.includes('exam') || lower.includes('cram') || lower.includes('study') || lower.includes('homework') || lower.includes('assignment') || lower.includes('sat') || lower.includes('jee') || lower.includes('neet') || lower.includes('college app') || lower.includes('revision') || lower.includes('test') || lower.includes('midterm') || lower.includes('final')) {
    return 'EXAM_STUDY';
  }

  // 6. Competitive ranked gaming / clutch
  if (lower.includes('game') || lower.includes('gaming') || lower.includes('ranked') || lower.includes('clutch') || lower.includes('valorant') || lower.includes('bgmi') || lower.includes('fortnite') || lower.includes('cs2') || lower.includes('tournament') || lower.includes('scrim') || lower.includes('lobby')) {
    return 'GAMING_CLUTCH';
  }

  // 7. Job / Internship Interview
  if (lower.includes('interview') || lower.includes('hire') || lower.includes('candidate') || lower.includes('executive') || lower.includes('internship') || lower.includes('job') || lower.includes('placement') || lower.includes('recruiter')) {
    return 'JOB_INTERVIEW';
  }

  // 8. Friends drama / conflict resolution
  if (lower.includes('friend') || lower.includes('beef') || lower.includes('drama') || lower.includes('fight') || lower.includes('argument') || lower.includes('apolog') || lower.includes('sorry') || lower.includes('falling out') || lower.includes('rumor')) {
    return 'FRIEND_DRAMA';
  }

  // 9. VC & Investor Pitch
  if (lower.includes('vc') || lower.includes('investor') || lower.includes('pitch') || lower.includes('seed') || lower.includes('series a') || lower.includes('fundrais') || lower.includes('term sheet') || lower.includes('valuation') || lower.includes('angel')) {
    return 'INVESTOR_PITCH';
  }

  // 10. Salary & Compensation Negotiation
  if (lower.includes('salary') || lower.includes('raise') || lower.includes('promot') || lower.includes('compensation') || lower.includes('hike') || lower.includes('bonus') || lower.includes('appraisal') || lower.includes('equity split')) {
    return 'SALARY_NEGOTIATION';
  }

  // 11. Commercial Client Closing
  if (lower.includes('client') || lower.includes('deal') || lower.includes('contract') || lower.includes('sale') || lower.includes('pricing') || lower.includes('sign') || lower.includes('closing') || lower.includes('msa') || lower.includes('sow') || lower.includes('proposal')) {
    return 'CLIENT_CLOSING';
  }

  // 12. Crisis / Legal Dispute
  if (lower.includes('dispute') || lower.includes('fire') || lower.includes('terminat') || lower.includes('conflict') || lower.includes('lawyer') || lower.includes('settle') || lower.includes('legal')) {
    return 'CRISIS_DISPUTE';
  }

  // 13. Creative & Partnerships
  if (lower.includes('creative') || lower.includes('design') || lower.includes('brand') || lower.includes('partner') || lower.includes('alliance')) {
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
  selectedCity
}) {
  const combinedText = prompt || `${topic || ''} ${goal || ''} ${strategy || ''}`;
  const archetype = detectMeetingArchetype(combinedText);

  // Slots are computed for the scenario described
  const optimalSlots = findOptimalMeetingSlots(vedicData, combinedText, 30);

  // Determine best matching slot based on archetype
  let chosenSlot = optimalSlots[0] || null;
  
  if (archetype === 'CRUSH_PARENTS') {
    const found = optimalSlots.find(s => s.hora.planet === 'Sun' || s.hora.planet === 'Jupiter' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'INVESTOR_PITCH') {
    const found = optimalSlots.find(s => s.hora.planet === 'Jupiter' || s.hora.planet === 'Sun' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'SALARY_NEGOTIATION' || archetype === 'CLIENT_CLOSING') {
    const found = optimalSlots.find(s => s.hora.planet === 'Mercury' || s.hora.planet === 'Jupiter');
    if (found) chosenSlot = found;
  } else if (archetype === 'CREATIVE_ALLIANCE' || archetype === 'CRUSH_RIZZ') {
    const found = optimalSlots.find(s => s.hora.planet === 'Venus' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'PARENT_PERMISSION') {
    const found = optimalSlots.find(s => s.hora.planet === 'Jupiter' || s.hora.planet === 'Sun');
    if (found) chosenSlot = found;
  } else if (archetype === 'TEACHER_PROFESSOR') {
    const found = optimalSlots.find(s => s.hora.planet === 'Jupiter' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'EXAM_STUDY') {
    const found = optimalSlots.find(s => s.hora.planet === 'Mercury' || s.hora.planet === 'Jupiter' || s.hora.planet === 'Saturn');
    if (found) chosenSlot = found;
  } else if (archetype === 'GAMING_CLUTCH') {
    const found = optimalSlots.find(s => s.hora.planet === 'Mars' || s.hora.planet === 'Sun');
    if (found) chosenSlot = found;
  } else if (archetype === 'JOB_INTERVIEW') {
    const found = optimalSlots.find(s => s.hora.planet === 'Sun' || s.hora.planet === 'Jupiter' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'FRIEND_DRAMA') {
    const found = optimalSlots.find(s => s.hora.planet === 'Moon' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  }

  const planetName = chosenSlot?.hora?.planet || 'Mercury';
  let attire = { ...(PLANETARY_ATTIRE[planetName] || PLANETARY_ATTIRE.Mercury) };

  // Contextual polish for specific social situations:
  if (archetype === 'CRUSH_PARENTS') {
    attire.title = 'Respectful Dignity & Traditional Favor';
    attire.recommendedPalette = 'Crisp White, Sky Blue, Royal Cream, or Clean Navy (projects humility, integrity, and grounded reliability)';
    attire.avoidColors = 'Flashy streetwear, ripped jeans, oversized graphic tees, or aggressive black/neon';
    attire.fabrics = 'Clean pressed button-down collar shirt or structured classic polo, pressed trousers, and clean shoes.';
    attire.metalAndWatch = 'Understated classic watch with leather or steel strap; clean grooming and light subtle cologne.';
    attire.direction = 'East or North-East';
    attire.directionMeaning = 'Aligns with solar dignity (Surya) and ethical preceptors (Guru). Radiates trustworthy character, composure, and natural respect.';
    attire.energy = 'Dignified, respectful, sincere, grounded';
  } else if (archetype === 'GAMING_CLUTCH') {
    attire.recommendedPalette = 'Deep Charcoal, Stealth Black, or Obsidian Navy with Red/Orange kinetic accents';
    attire.avoidColors = 'Tight restrictive clothing or slippery footwear';
    attire.fabrics = 'Breathable lightweight athletic hoodie or dry-fit jersey for unrestricted forearm movement.';
    attire.metalAndWatch = 'No heavy jewelry on the mouse wrist; lightweight sports band or bare wrist.';
  } else if (archetype === 'EXAM_STUDY') {
    attire.recommendedPalette = 'Emerald Green, Mint, Crisp White, or Sage (stimulates synaptic memory retention)';
    attire.avoidColors = 'Chaotic neon patterns or uncomfortable tight layers';
    attire.fabrics = 'Soft breathable cotton or comfortable oversized fleece that keeps body temperature optimal.';
    attire.metalAndWatch = 'Minimalist analog watch to track Pomodoro intervals without digital screen distractions.';
  } else if (archetype === 'CRUSH_RIZZ') {
    attire.recommendedPalette = 'Pearl White, Champagne, Soft Pastel Rose, or Crisp Monochrome (effortless aesthetic magnetism)';
    attire.avoidColors = 'Overly formal stiff business suits or drab unwashed loungewear';
    attire.fabrics = 'High-grade textured cotton, linen overshirt, or clean knitwear with effortless drape.';
    attire.metalAndWatch = 'Clean silver or platinum chain, minimalist watch, and fresh signature fragrance.';
  }
  
  let openingScript = '';
  let tacticalAdvice = '';
  let deskRitual = '';

  switch (archetype) {
    case 'CRUSH_PARENTS':
      openingScript = `"Good afternoon Uncle / Mr. [Name], thank you so much for welcoming me today. I really appreciate you taking the time to speak with me directly."`;
      tacticalAdvice = `Meeting a crush or partner's father requires solar composure (Surya) and Jupiterian respect (Guru). Look him straight in the eye with a calm, humble gaze and offer a firm, confident handshake. Never brag, posture, use casual slang, or get defensive. When asked about your life, speak clearly about your education, career ambitions, and genuine respect for his family. Listen twice as much as you speak. Fathers instinctively test for emotional maturity, honesty, and consistency.`;
      deskRitual = `Arrive 5 to 10 minutes early. Wear a clean, crisp pressed shirt (white, sky blue, or cream) and tidy shoes. Silence your phone completely and keep it in your pocket. Face East or North-East during the conversation to channel solar composure.`;
      break;

    case 'CRUSH_RIZZ':
      openingScript = `"Quick question for you—I need an unbiased opinion on something only you would know."`;
      tacticalAdvice = `Under Shukra (Venus) and Budha (Mercury), banter must feel effortless, witty, and zero-pressure. Never send needy double-texts, dry queries ('wyd'), or long emotional paragraphs. Drop one intriguing hook during the active window, match their response tempo, and hold a playful, confident aura. Venus rewards aesthetic confidence and mysterious pacing.`;
      deskRitual = `Wear pearl white, champagne, or clean pastel. Face North or South-East while typing to project Venusian magnetism and calm confidence.`;
      break;

    case 'PARENT_PERMISSION':
      openingScript = `"Hey Mom and Dad, do you have 5 minutes? I finished all my homework and chores for the week, and wanted to run an idea by you before the weekend."`;
      tacticalAdvice = `Guru (Jupiter) brings benevolence, mercy, and generosity. Approach them when they are seated and relaxed (never when they just walked through the door after work). Anchor your request on fulfilled duties first. State who will be there, exact return times, and offer live location sharing proactively.`;
      deskRitual = `Wear golden amber, warm yellow, or clean cream. Face North-East (Ishanya) to channel parental warmth and ethical approval. Keep your voice calm, open-palmed, and non-defensive.`;
      break;

    case 'TEACHER_PROFESSOR':
      openingScript = `"Good morning Professor [Name], thank you for taking time during your office hours. I've been reviewing the recent feedback and wanted to seek your guidance on how to strengthen my approach."`;
      tacticalAdvice = `In Vedic astrology, Guru governs teachers and preceptors. Never make excuses for missed deadlines or low marks. Take complete personal accountability first, present the work you've already attempted, and ask for specific guidance. Mentors are honored by genuine curiosity and diligence.`;
      deskRitual = `Wear clean emerald green, sage, or crisp white. Face North (Mercury) or North-East (Jupiter). Bring a physical notebook and pen.`;
      break;

    case 'EXAM_STUDY':
      openingScript = `"Focus Protocol Activated: 90-minute deep study sprint. All notifications muted, phone parked in another room, zero tabs open except study material."`;
      tacticalAdvice = `Budha (Mercury) accelerates synaptic memory retention and math logic, while Shani (Saturn) provides monk-mode stamina. Study in 30-minute high-focus Pomodoro blocks. Hydrate regularly and avoid multitasking.`;
      deskRitual = `Keep your desk completely clutter-free with an open glass of fresh water. Wear emerald green or clean white linen to stimulate cognitive clarity. Face North.`;
      break;

    case 'GAMING_CLUTCH':
      openingScript = `"Squad locked in. Comms crisp and minimal tonight. Eyes on the crosshair, let's claim the rank-up."`;
      tacticalAdvice = `Mangala (Mars) fuels explosive reflexes and clutch playmaking. Stay hydrated, keep your posture upright, and call rotations with calm certainty. If a round is lost, reset instantly without emotional tilt.`;
      deskRitual = `Face South or East. Wear deep charcoal with subtle red accents. Keep your mousepad clean and posture upright for peak kinetic reaction speed.`;
      break;

    case 'JOB_INTERVIEW':
      openingScript = `"Good morning, thank you for this opportunity. I've followed your recent work in [domain], and I'm eager to discuss how my skill set in [specialty] can deliver immediate impact for your team."`;
      tacticalAdvice = `Structure answers using the STAR method (Situation, Task, Action, Result). State quantifiable impact rather than generic responsibilities. Conclude answers with confident silence.`;
      deskRitual = `Face East (Surya) or North (Budha). Test webcam eye-line at 90 degrees with clear frontal lighting.`;
      break;

    case 'FRIEND_DRAMA':
      openingScript = `"Hey, can we talk one-on-one for a few minutes? Our friendship matters too much to let a misunderstanding sit between us."`;
      tacticalAdvice = `Never resolve sensitive drama over text or group chats. Meet in person or get on a voice call. Use 'I feel' statements instead of accusatory 'You did' phrasing. Chandra (Moon) dissolves friction through genuine presence.`;
      deskRitual = `Wear calm alabaster, soft silver, or neutral slate. Face North-West (Chandra). Keep your breathing slow and non-reactive.`;
      break;

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
      openingScript = `"I've outlined three clear outcomes for our conversation today so we align smoothly and reach mutual agreement."`;
      tacticalAdvice = `Maintain conversational poise by framing expectations early. Speak with steady tempo, listen actively, and conclude agreements before the planetary transit window ends.`;
      deskRitual = `Face ${attire.direction}. Keep posture upright to project solar meridian balance.`;
      break;
  }

  return {
    archetype,
    topic: prompt || topic || 'High-Stakes Strategic Sync',
    goal: goal || 'Flawless execution and mutual agreement',
    strategy: strategy || 'Measured articulation with firm boundary control',
    city: selectedCity.name,
    dateStr: vedicData.date.toDateString(),
    // null when no clear window exists that day; the UI says so instead of inventing one
    slot: chosenSlot,
    attire,
    openingScript,
    tacticalAdvice,
    deskRitual,
    rahuAvoidance: `${formatTime(vedicData.rahuKaalam.start)} – ${formatTime(vedicData.rahuKaalam.end)} (avoid this window)`,
    generatedAt: new Date().toLocaleTimeString()
  };
}
