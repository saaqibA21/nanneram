/**
 * Nanneram AI Horological Meeting & Tactical Attire Consultant
 * Computes deterministic astrological attire, power directions, psychological openers,
 * and precision planetary scheduling.
 */

import { formatTime, findOptimalMeetingSlots } from './vedicTiming.js';

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
 * Detect fine-grained meeting archetype based on text query
 */
export function detectMeetingArchetype(text) {
  const lower = text.toLowerCase();
  
  // 1. Meeting crush / partner's father or parents (Highest priority)
  const isCrushOrPartner = lower.includes('crush') || lower.includes('girlfriend') || lower.includes('boyfriend') || lower.includes('partner') || lower.includes('her') || lower.includes('his') || lower.includes('in-law');
  const isParentOrFamily = lower.includes('dad') || lower.includes('father') || lower.includes('mom') || lower.includes('mother') || lower.includes('parent') || lower.includes('family');

  if ((lower.includes('crush') && isParentOrFamily) || (isCrushOrPartner && isParentOrFamily) || lower.includes('meet the parents')) {
    return 'CRUSH_PARENTS';
  }

  // 2. Crush left on read / no reply / ghosted / re-texting (Specific sub-case)
  if (
    lower.includes('crush') && (
      lower.includes('reply') || lower.includes('read') || lower.includes('delivered') ||
      lower.includes('re text') || lower.includes('retext') || lower.includes('ghost') ||
      lower.includes('ignoring') || lower.includes('seen') || lower.includes('wait') ||
      lower.includes('double text') || lower.includes('follow up')
    )
  ) {
    return 'CRUSH_LEFT_ON_READ';
  }

  // 3. Asking crush out / dates
  if (
    lower.includes('crush') && (
      lower.includes('ask out') || lower.includes('date') || lower.includes('coffee') ||
      lower.includes('drinks') || lower.includes('hang out') || lower.includes('dinner') ||
      lower.includes('meet up')
    )
  ) {
    return 'CRUSH_ASK_OUT';
  }

  // 4. Confession / deep feelings
  if (
    (lower.includes('crush') || lower.includes('friend')) && (
      lower.includes('confess') || lower.includes('tell her') || lower.includes('tell him') ||
      lower.includes('feelings') || lower.includes('in love')
    )
  ) {
    return 'CRUSH_CONFESSION';
  }

  // 5. First text / breaking ice / slide in DM
  if (
    (lower.includes('crush') || lower.includes('girl') || lower.includes('boy')) && (
      lower.includes('first text') || lower.includes('slide') || lower.includes('story reply') ||
      lower.includes('start talking') || lower.includes('break the ice') || lower.includes('new crush')
    )
  ) {
    return 'CRUSH_FIRST_MOVE';
  }

  // 6. Direct crush rizz / general texting
  if (lower.includes('crush') || lower.includes('rizz') || lower.includes('dm') || lower.includes('dating') || lower.includes('flirt')) {
    return 'CRUSH_RIZZ';
  }

  // 7. Negotiating with own parents for cash/money
  if (
    (lower.includes('parent') || lower.includes('mom') || lower.includes('dad')) && (
      lower.includes('money') || lower.includes('cash') || lower.includes('allowance') ||
      lower.includes('pocket money') || lower.includes('dollar') || lower.includes('rupee') ||
      lower.includes('buy me') || lower.includes('pay for') || lower.includes('loan')
    )
  ) {
    return 'PARENT_CASH';
  }

  // 8. Negotiating with own parents for trips / parties / curfew
  if (
    (lower.includes('parent') || lower.includes('mom') || lower.includes('dad')) && (
      lower.includes('trip') || lower.includes('weekend') || lower.includes('night out') ||
      lower.includes('party') || lower.includes('curfew') || lower.includes('sleepover') ||
      lower.includes('stayover') || lower.includes('go out')
    )
  ) {
    return 'PARENT_TRIP';
  }

  // 9. General parent permission
  if (lower.includes('parent') || lower.includes('mom') || lower.includes('dad') || lower.includes('strict') || lower.includes('permission')) {
    return 'PARENT_PERMISSION';
  }

  // 10. Teacher deadline extension / late submission
  if (
    (lower.includes('teacher') || lower.includes('professor') || lower.includes('faculty')) && (
      lower.includes('extension') || lower.includes('deadline') || lower.includes('late') ||
      lower.includes('grade') || lower.includes('marks') || lower.includes('re-evaluation')
    )
  ) {
    return 'TEACHER_EXTENSION';
  }

  // 11. General academic authority / professor
  if (lower.includes('teacher') || lower.includes('professor') || lower.includes('principal') || lower.includes('dean') || lower.includes('faculty') || lower.includes('attendance')) {
    return 'TEACHER_PROFESSOR';
  }

  // 12. Exam study & deep cramming
  if (lower.includes('exam') || lower.includes('cram') || lower.includes('study') || lower.includes('homework') || lower.includes('assignment') || lower.includes('sat') || lower.includes('jee') || lower.includes('neet') || lower.includes('revision') || lower.includes('test') || lower.includes('midterm') || lower.includes('final')) {
    return 'EXAM_STUDY';
  }

  // 13. Competitive ranked gaming / clutch
  if (lower.includes('game') || lower.includes('gaming') || lower.includes('ranked') || lower.includes('clutch') || lower.includes('valorant') || lower.includes('bgmi') || lower.includes('fortnite') || lower.includes('cs2') || lower.includes('tournament') || lower.includes('lobby')) {
    return 'GAMING_CLUTCH';
  }

  // 14. Job / Internship Interview
  if (lower.includes('interview') || lower.includes('hire') || lower.includes('candidate') || lower.includes('internship') || lower.includes('job') || lower.includes('placement') || lower.includes('recruiter')) {
    return 'JOB_INTERVIEW';
  }

  // 15. Friends drama / conflict resolution
  if (lower.includes('friend') || lower.includes('beef') || lower.includes('drama') || lower.includes('fight') || lower.includes('argument') || lower.includes('apolog') || lower.includes('sorry')) {
    return 'FRIEND_DRAMA';
  }

  // 16. VC & Investor Pitch
  if (lower.includes('vc') || lower.includes('investor') || lower.includes('pitch') || lower.includes('seed') || lower.includes('series a') || lower.includes('fundrais') || lower.includes('term sheet') || lower.includes('valuation')) {
    return 'INVESTOR_PITCH';
  }

  // 17. Salary & Compensation Negotiation
  if (lower.includes('salary') || lower.includes('raise') || lower.includes('promot') || lower.includes('compensation') || lower.includes('hike') || lower.includes('bonus') || lower.includes('appraisal')) {
    return 'SALARY_NEGOTIATION';
  }

  // 18. Commercial Client Closing
  if (lower.includes('client') || lower.includes('deal') || lower.includes('contract') || lower.includes('sale') || lower.includes('pricing') || lower.includes('sign') || lower.includes('closing')) {
    return 'CLIENT_CLOSING';
  }

  // 19. Crisis / Legal Dispute
  if (lower.includes('dispute') || lower.includes('fire') || lower.includes('terminat') || lower.includes('conflict') || lower.includes('lawyer') || lower.includes('legal')) {
    return 'CRISIS_DISPUTE';
  }

  // 20. Creative & Partnerships
  if (lower.includes('creative') || lower.includes('design') || lower.includes('brand') || lower.includes('partner') || lower.includes('alliance')) {
    return 'CREATIVE_ALLIANCE';
  }

  return 'STRATEGIC_CONSULT';
}

/**
 * Generate full Astrological Consultation Decree with bespoke scenarios
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
  } else if (archetype === 'CRUSH_LEFT_ON_READ' || archetype === 'CRUSH_ASK_OUT' || archetype === 'CRUSH_FIRST_MOVE' || archetype === 'CRUSH_RIZZ' || archetype === 'CREATIVE_ALLIANCE') {
    const found = optimalSlots.find(s => s.hora.planet === 'Venus' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'PARENT_CASH' || archetype === 'PARENT_TRIP' || archetype === 'PARENT_PERMISSION') {
    const found = optimalSlots.find(s => s.hora.planet === 'Jupiter' || s.hora.planet === 'Sun' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'TEACHER_EXTENSION' || archetype === 'TEACHER_PROFESSOR') {
    const found = optimalSlots.find(s => s.hora.planet === 'Jupiter' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'EXAM_STUDY') {
    const found = optimalSlots.find(s => s.hora.planet === 'Mercury' || s.hora.planet === 'Jupiter' || s.hora.planet === 'Saturn');
    if (found) chosenSlot = found;
  } else if (archetype === 'GAMING_CLUTCH') {
    const found = optimalSlots.find(s => s.hora.planet === 'Mars' || s.hora.planet === 'Sun');
    if (found) chosenSlot = found;
  } else if (archetype === 'INVESTOR_PITCH' || archetype === 'JOB_INTERVIEW') {
    const found = optimalSlots.find(s => s.hora.planet === 'Jupiter' || s.hora.planet === 'Sun' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  } else if (archetype === 'SALARY_NEGOTIATION' || archetype === 'CLIENT_CLOSING') {
    const found = optimalSlots.find(s => s.hora.planet === 'Mercury' || s.hora.planet === 'Jupiter');
    if (found) chosenSlot = found;
  } else if (archetype === 'FRIEND_DRAMA') {
    const found = optimalSlots.find(s => s.hora.planet === 'Moon' || s.hora.planet === 'Mercury');
    if (found) chosenSlot = found;
  }

  const planetName = chosenSlot?.hora?.planet || 'Mercury';
  let attire = { ...(PLANETARY_ATTIRE[planetName] || PLANETARY_ATTIRE.Mercury) };
  let contextType = 'business';

  let openingScript = '';
  let openingOptions = [];
  let tacticalAdvice = '';
  let deskRitual = '';

  switch (archetype) {
    case 'CRUSH_LEFT_ON_READ':
      contextType = 'digital_messaging';
      attire.title = 'Effortless Detachment & Aura Recovery';
      attire.recommendedPalette = 'Pearl White, Champagne, or Clean Minimalist Pastels (channels unbothered, high-vibe calm)';
      attire.avoidColors = 'Dark chaotic clutter or typing late at night from bed under dim phone glare';
      attire.fabrics = 'Clean, breathable lounge drip. When you feel physically fresh, your texting energy reflects zero desperation.';
      attire.metalAndWatch = 'Keep your phone on Do Not Disturb while drafting; send from a state of total calm.';
      attire.direction = 'North (Mercury · Wit & Brevity) or South-East (Venus · Charm)';
      attire.directionMeaning = 'Mercury brings lighthearted banter and fast flow; Venus dissolves friction and triggers magnetic curiosity.';
      attire.energy = 'Playful indifference, high value, zero urgency, effortless charm';

      openingOptions = [
        {
          label: 'Option 1: The Curiosity Hook (Recommended)',
          script: `"Quick question for you—I need an unbiased opinion on something only you would know."`,
          why: 'Interrupts radio silence without asking why they didn’t reply. Human psychology makes people want to know what "only they" would know.'
        },
        {
          label: 'Option 2: The Casual Callback / Shared Joke',
          script: `"Saw something today that instantly reminded me of our music debate. Promise not to roast my playlist."`,
          why: 'Acts as if the conversation took a natural pause. Rewinds back to fun, shared rapport without guilt or pressure.'
        },
        {
          label: 'Option 3: The Low-Stakes Meme / Image Reset',
          script: `[Send a funny relevant photo or meme] + "This felt like an emergency broadcast you needed to see."`,
          why: 'Zero cognitive load to reply to. Replaces awkwardness with laughter and completely resets the dynamic.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `⚡ THE ANTI-GHOSTING & RE-TEXT PROTOCOL:\n\n` +
        `1. The Golden Rule of Aura: NEVER acknowledge the unreplied message. Never say "Did you see my text?", "Are you alive?", or send question marks (??). Pretending the text was missed or addressing the silence immediately screams low value and puts them on defense.\n\n` +
        `2. Planetary Alignment (Venus & Mercury): Your calculated window is under ${chosenSlot?.hora?.name || 'Venus Hora'} & ${chosenSlot?.gowri?.name || 'Sugam Gowri'}. Venus governs attraction and aesthetic lightness; Mercury governs conversational agility. Under this window, your text reads as magnetic and breezy rather than demanding.\n\n` +
        `3. The 24-to-48 Hour Buffer: If they left you on read earlier today, do not double-text on the same day. Wait for this exact time window tomorrow. Space creates intrigue; chasing suffocates attraction.\n\n` +
        `4. The "Send & Detach" Protocol: Type your text in your phone Notes app first—never in the direct chat where an accidental send or typing indicator happens. Send it during the active window, and immediately put your phone face down. Do not hover over read receipts. Detachment is the true secret of high aura.`;

      deskRitual = `Sit upright facing North or South-East. Drink a glass of cold water before hitting send. Send the message between ${chosenSlot ? formatTime(chosenSlot.startMin + 5) : 'active window'} and ${chosenSlot ? formatTime(chosenSlot.endMin - 5) : 'exit window'}, then immediately put your phone face down and engage in another activity.`;
      break;

    case 'CRUSH_ASK_OUT':
      contextType = 'digital_messaging';
      attire.title = 'Romantic Magnetic Accord';
      attire.recommendedPalette = 'Soft Ivory, Champagne, Pastel Rose, or Crisp Linen White';
      attire.avoidColors = 'Dull muddy tones or corporate stiff suits';
      attire.fabrics = 'High-grade textured cotton, clean overshirt, or effortless knitwear.';
      attire.metalAndWatch = 'Clean silver or platinum chain, minimalist watch, subtle signature scent.';
      attire.direction = 'South-East (Venus · Shukra)';
      attire.directionMeaning = 'Channels Venusian romance, mutual warmth, and spontaneous attraction.';
      attire.energy = 'Warmth, romantic confidence, low friction, definite intent';

      openingOptions = [
        {
          label: 'Option 1: The Activity Close (Low Friction)',
          script: `"I'm checking out that new matcha / coffee spot near [Location] this Thursday around 5. Come keep me company."`,
          why: 'States an activity that is already happening. Takes the pressure off and feels like an invitation into your world.'
        },
        {
          label: 'Option 2: The Taste Test Challenge',
          script: `"You claim [Place] has the best burgers in town. We need to settle this in person this weekend. Are you free Saturday afternoon?"`,
          why: 'Playful, fun challenge with zero awkwardness and clear logistics.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Propose a concrete plan with an activity, place, and time. Vague invites like "we should hang out sometime" lead to flaky replies. Give a clear day and time, and allow them an easy exit door so it feels exciting, not obligating.`;

      deskRitual = `Face South-East. Frame the ask concisely in 2 sentences maximum.`;
      break;

    case 'CRUSH_PARENTS':
      contextType = 'in_person_formal';
      attire.title = 'Respectful Dignity & Traditional Favor';
      attire.recommendedPalette = 'Crisp White, Sky Blue, Royal Cream, or Clean Navy (projects humility, integrity, and grounded reliability)';
      attire.avoidColors = 'Flashy streetwear, ripped jeans, oversized graphic tees, or aggressive black/neon';
      attire.fabrics = 'Clean pressed button-down collar shirt or structured classic polo, pressed trousers, and clean shoes.';
      attire.metalAndWatch = 'Understated classic watch with leather or steel strap; clean grooming and light subtle cologne.';
      attire.direction = 'East or North-East';
      attire.directionMeaning = 'Aligns with solar dignity (Surya) and ethical preceptors (Guru). Radiates trustworthy character, composure, and natural respect.';
      attire.energy = 'Dignified, respectful, sincere, grounded';

      openingOptions = [
        {
          label: 'Formal Greeting (Father / Parents)',
          script: `"Good afternoon Uncle / Mr. [Name], thank you so much for welcoming me into your home today. I really appreciate you taking the time to speak with me directly."`,
          why: 'Demonstrates immediate deference, manners, and courage to speak face-to-face.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Meeting a crush or partner's father requires solar composure (Surya) and Jupiterian respect (Guru). Look him straight in the eye with a calm, humble gaze and offer a firm, confident handshake. Never brag, posture, use casual slang, or get defensive. When asked about your life, speak clearly about your education, career ambitions, and genuine respect for his family. Listen twice as much as you speak. Fathers instinctively test for emotional maturity, honesty, and consistency.`;

      deskRitual = `Arrive 5 to 10 minutes early. Wear a clean, crisp pressed shirt (white, sky blue, or cream) and tidy shoes. Silence your phone completely and keep it in your pocket. Face East or North-East during the conversation to channel solar composure.`;
      break;

    case 'CRUSH_CONFESSION':
      contextType = 'in_person_casual';
      attire.title = 'Grounded Vulnerability & Emotional Clarity';
      attire.recommendedPalette = 'Alabaster, Pale Sky Blue, or Clean White (calm, authentic, transparent)';
      attire.avoidColors = 'Overly dark intimidating colors';
      attire.fabrics = 'Soft breathable cotton or comfortable knitwear.';
      attire.metalAndWatch = 'Simple clean watch.';
      attire.direction = 'North-West (Moon) or South-East (Venus)';
      attire.directionMeaning = 'Combines emotional honesty with genuine romantic warmth.';
      attire.energy = 'Courage, sincerity, calm vulnerability';

      openingOptions = [
        {
          label: 'The Direct & Dignified Confession',
          script: `"I wanted to be honest with you because I value you too much to pretend. Over the past few months, I've developed genuine feelings for you, and I wanted to see if you felt the same way."`,
          why: 'Clear, mature, and does not put guilt or intense pressure on the other person.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Confessions should never be an emotional avalanche. Keep it grounded, stated with calm composure, and followed by silent space so they have room to breathe and respond honestly.`;

      deskRitual = `Do this in person in a quiet setting (never over text if possible). Face North-West to maintain open emotional bandwidth.`;
      break;

    case 'CRUSH_FIRST_MOVE':
    case 'CRUSH_RIZZ':
      contextType = 'digital_messaging';
      attire.title = 'Effortless Charm & Banter Velocity';
      attire.recommendedPalette = 'Pearl White, Champagne, Soft Pastel Rose, or Crisp Monochrome';
      attire.avoidColors = 'Stiff formal business suits or disheveled loungewear';
      attire.fabrics = 'Clean textured cotton, linen overshirt, or relaxed knitwear.';
      attire.metalAndWatch = 'Clean silver or platinum chain, minimalist watch, signature fragrance.';
      attire.direction = 'North or South-East';
      attire.directionMeaning = 'Channel of Venusian diplomacy. Dissolves interpersonal friction and generates instant empathetic buy-in.';
      attire.energy = 'Diplomatic charm, creative brilliance, partnership accord, aesthetic mastery';

      openingOptions = [
        {
          label: 'Option 1: The Observation Hook',
          script: `"Saw that story you posted—didn't know you had immaculate taste in [Topic/Music]. We need to debate this immediately."`,
          why: 'Compliments specific taste rather than physical appearance, inviting a fun debate.'
        },
        {
          label: 'Option 2: The Playful Disqualification',
          script: `"I was going to say you have great taste in coffee, but ordering that might be a criminal offense."`,
          why: 'Playful teasing creates tension and sparks instant high-energy banter.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Under Shukra (Venus) and Budha (Mercury), banter must feel effortless, witty, and zero-pressure. Never send needy double-texts, dry queries ('wyd'), or long emotional paragraphs. Drop one intriguing hook during the active window, match their response tempo, and hold a playful, confident aura. Venus rewards aesthetic confidence and mysterious pacing.`;

      deskRitual = `Wear pearl white, champagne, or clean pastel. Face North or South-East while typing to project Venusian magnetism and calm confidence.`;
      break;

    case 'PARENT_CASH':
      contextType = 'in_person_casual';
      attire.title = 'Filial Responsibility & Commercial Accord';
      attire.recommendedPalette = 'Golden Amber, Warm Mustard, Honey, or Clean Cream (stimulates Jupiterian generosity)';
      attire.avoidColors = 'Expensive flashy brand logos or slovenly clothes';
      attire.fabrics = 'Clean everyday clothing that signals responsibility and maturity.';
      attire.metalAndWatch = 'Modest watch.';
      attire.direction = 'North-East (Guru · Jupiter)';
      attire.directionMeaning = 'Jupiter opens parental generosity, benevolence, and trust.';
      attire.energy = 'Accountability, value exchange, gratitude';

      openingOptions = [
        {
          label: 'The Responsibility & Ledger Anchor',
          script: `"Hey Dad and Mom, do you have 5 minutes? I finished all my homework and chores for the week, and I wanted to talk through my budget for [activity/trip]. Here is exactly what it costs, and how I plan to contribute or earn it."`,
          why: 'Parents say no to money when they sense entitlement. Presenting chores completed and an exact budget triggers automatic Jupiterian approval.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Never ask for cash in passing, when they are distracted, or when they just entered the house tired after work. Wait until they are seated and relaxed during the active Jupiter or Mercury hour. State the exact breakdown, explain the purpose clearly, and offer a concrete chore or savings match.`;

      deskRitual = `Face North-East. Bring a written note or breakdown of the cost so it looks thoughtful and deliberate.`;
      break;

    case 'PARENT_TRIP':
      contextType = 'in_person_casual';
      attire.title = 'Trust Transparency & Safety Assurances';
      attire.recommendedPalette = 'Sky Blue, Soft Cream, or Light Sage Green';
      attire.avoidColors = 'Secretive dark hoodies or defensive body language';
      attire.fabrics = 'Neat, comfortable home wear.';
      attire.metalAndWatch = 'Clean appearance.';
      attire.direction = 'North-East (Ishanya)';
      attire.directionMeaning = 'Channels ethical transparency and parental peace of mind.';
      attire.energy = 'Openness, safety certainty, proactive communication';

      openingOptions = [
        {
          label: 'The Proactive Safety Pitch',
          script: `"Hey Mom and Dad, I wanted to discuss an upcoming trip with [Friends' Names] on [Date]. Before asking, I already put together the exact details: where we'll be staying, who is driving, return times, and I'll keep my live location on the whole time."`,
          why: 'Pre-empts every parent objection (safety, logistics, supervision) before they even voice it.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Strict parents reject plans because of anxiety, not malice. Relieve their mental burden by solving the logistics in advance: name the responsible friends, give emergency contact numbers, and establish a firm check-in schedule.`;

      deskRitual = `Sit at the kitchen table or living room when parents are having tea or relaxing. Speak with a level, calm voice.`;
      break;

    case 'PARENT_PERMISSION':
      contextType = 'in_person_casual';
      attire.title = 'Respectful Alignment';
      attire.recommendedPalette = 'Golden Yellow, Honey Amber, Warm Cream';
      attire.avoidColors = 'Harsh defiant colors';
      attire.fabrics = 'Clean pressed casual.';
      attire.metalAndWatch = 'Modest watch.';
      attire.direction = 'North-East (Ishanya)';
      attire.directionMeaning = 'Aligns with Guru (Jupiter) for parental harmony and consent.';
      attire.energy = 'Respect, clear articulation, patience';

      openingOptions = [
        {
          label: 'Respectful Opening',
          script: `"Hey Mom and Dad, do you have a few minutes? I wanted to run an idea by you and hear your thoughts before making any plans."`,
          why: 'Involving them as advisors disarms parental resistance.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Guru (Jupiter) brings benevolence, mercy, and generosity. Approach them when they are seated and relaxed. Anchor your request on fulfilled duties first.`;

      deskRitual = `Wear warm cream or yellow. Face North-East. Keep palms open and non-defensive.`;
      break;

    case 'TEACHER_EXTENSION':
      contextType = 'academic';
      attire.title = 'Academic Reverence & Diligence';
      attire.recommendedPalette = 'Emerald Green, Slate Gray, or Crisp White Shirt';
      attire.avoidColors = 'Casual loungewear or unkempt appearance';
      attire.fabrics = 'Neat button-up shirt or clean college sweater.';
      attire.metalAndWatch = 'Simple watch; carry notebook.';
      attire.direction = 'North (Mercury) or North-East (Jupiter)';
      attire.directionMeaning = 'Reverence for Guru (preceptors) and Budha (analytical effort).';
      attire.energy = 'Accountability, scholarly curiosity, diligence';

      openingOptions = [
        {
          label: 'Accountability & Work-In-Progress Pitch',
          script: `"Good morning Professor [Name], thank you for meeting during office hours. I've completed roughly 60% of the [Assignment], but I hit a conceptual wall on [Specific Section]. Would it be possible to submit a polished revision by [Specific Day/Time] so I can incorporate your feedback?"`,
          why: 'Never ask for an extension with zero work done. Proving you have already started and want higher quality triggers teacher empathy.'
        }
      ];

      openingScript = openingOptions[0].script;

      tacticalAdvice = 
        `Never make generic excuses like "I was too busy" or "My computer crashed". Take full personal accountability, show the work drafted so far, and frame the extra 24-48 hours as a dedication to academic excellence.`;

      deskRitual = `Bring a physical printout or drafted file on your laptop. Keep your pen ready to take notes.`;
      break;

    case 'TEACHER_PROFESSOR':
      contextType = 'academic';
      attire.title = 'Scholarly Poise';
      attire.recommendedPalette = 'Clean Emerald, Sage, Crisp White, or Navy';
      attire.avoidColors = 'Sloppy clothing or loud prints';
      attire.fabrics = 'Neat collar or structured knitwear.';
      attire.metalAndWatch = 'Simple classic watch.';
      attire.direction = 'North-East (Guru)';
      attire.directionMeaning = 'Direction of Jupiter (Guru), honoring educational mentors.';
      attire.energy = 'Receptive, respectful, diligent';

      openingOptions = [
        {
          label: 'Academic Office Hours Sync',
          script: `"Good morning Professor [Name], thank you for your time. I wanted to review your comments on my recent work to ensure I master the core material."`,
          why: 'Focuses on learning and growth rather than just haggling for grades.'
        }
      ];

      openingScript = openingOptions[0].script;
      tacticalAdvice = `Take complete accountability first, present attempted work, and ask for specific guidance. Mentors are honored by genuine curiosity.`;
      deskRitual = `Face North-East. Bring physical notebook and pen.`;
      break;

    case 'EXAM_STUDY':
      contextType = 'study_sprint';
      attire.title = 'Cognitive Monk Mode';
      attire.recommendedPalette = 'Emerald Green, Mint, Crisp White, or Sage (stimulates synaptic memory retention)';
      attire.avoidColors = 'Chaotic neon patterns or uncomfortable tight layers';
      attire.fabrics = 'Soft breathable cotton or comfortable oversized fleece that keeps body temperature optimal.';
      attire.metalAndWatch = 'Minimalist analog watch to track Pomodoro intervals without digital screen distractions.';
      attire.direction = 'North (Mercury · Budha)';
      attire.directionMeaning = 'Mercury stimulates fast cognitive processing, memory encoding, and logical synthesis.';
      attire.energy = 'Laser focus, memory retention, quiet stamina';

      openingOptions = [
        {
          label: 'Monk-Mode Focus Protocol',
          script: `"Focus Protocol Activated: 90-minute deep study sprint. All notifications muted, phone parked in another room, zero tabs open except study material."`,
          why: 'Sets a psychological trigger separating distracted browsing from high-retention study.'
        }
      ];

      openingScript = openingOptions[0].script;
      tacticalAdvice = `Budha (Mercury) accelerates synaptic memory retention and math logic, while Shani (Saturn) provides monk-mode stamina. Study in 30-minute high-focus Pomodoro blocks. Hydrate regularly and avoid multitasking.`;
      deskRitual = `Keep your desk completely clutter-free with an open glass of fresh water. Wear emerald green or clean white linen to stimulate cognitive clarity. Face North.`;
      break;

    case 'GAMING_CLUTCH':
      contextType = 'gaming';
      attire.title = 'Kinetic Vanguard & Reaction Composure';
      attire.recommendedPalette = 'Deep Charcoal, Stealth Black, or Obsidian Navy with Red/Orange kinetic accents';
      attire.avoidColors = 'Tight restrictive clothing or slippery footwear';
      attire.fabrics = 'Breathable lightweight athletic hoodie or dry-fit jersey for unrestricted forearm movement.';
      attire.metalAndWatch = 'No heavy jewelry on the mouse wrist; lightweight sports band or bare wrist.';
      attire.direction = 'South or East';
      attire.directionMeaning = 'Aligns with Mangala (Mars · Kinetic reflexes) and Surya (Sun · Focus).';
      attire.energy = 'Kinetic reflex speed, clutch calmness, anti-tilt discipline';

      openingOptions = [
        {
          label: 'Lobby Comms Protocol',
          script: `"Squad locked in. Comms crisp and minimal tonight. Eyes on the crosshair, let's claim the rank-up."`,
          why: 'Sets a calm, non-toxic tone that keeps team tilt at zero.'
        }
      ];

      openingScript = openingOptions[0].script;
      tacticalAdvice = `Mangala (Mars) fuels explosive reflexes and clutch playmaking. Stay hydrated, keep your posture upright, and call rotations with calm certainty. If a round is lost, reset instantly without emotional tilt.`;
      deskRitual = `Face South or East. Wear deep charcoal with subtle red accents. Keep your mousepad clean and posture upright for peak kinetic reaction speed.`;
      break;

    case 'JOB_INTERVIEW':
      contextType = 'in_person_formal';
      openingOptions = [
        {
          label: 'Executive Value Alignment',
          script: `"Good morning, thank you for this opportunity. I've followed your recent work in [domain], and I'm eager to discuss how my skill set in [specialty] can deliver immediate impact for your team."`,
          why: 'Positions you as a high-value collaborator rather than a passive applicant.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Structure answers using the STAR method (Situation, Task, Action, Result). State quantifiable impact rather than generic responsibilities. Conclude answers with confident silence.`;
      deskRitual = `Face East (Surya) or North (Budha). Test webcam eye-line at 90 degrees with clear frontal lighting.`;
      break;

    case 'FRIEND_DRAMA':
      contextType = 'in_person_casual';
      attire.title = 'Lunar Empathy & De-escalation';
      attire.recommendedPalette = 'Alabaster, Pearl Ivory, Soft Silver, or Pale Morning Mist';
      attire.avoidColors = 'Aggressive crimson or sharp contrast colors';
      attire.fabrics = 'Soft breathable cotton, relaxed textures.';
      attire.metalAndWatch = 'Clean silver.';
      attire.direction = 'North-West (Moon · Chandra)';
      attire.directionMeaning = 'Direction of Chandra (Mind & Emotion). Dissolves emotional pride and fosters mutual listening.';
      attire.energy = 'Empathy, listening, reconciliation, peace';

      openingOptions = [
        {
          label: 'The Non-Defensive Reset',
          script: `"Hey, can we talk one-on-one for a few minutes? Our friendship matters too much to let a misunderstanding sit between us."`,
          why: 'Affirms the relationship value first before dissecting the friction.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Never resolve sensitive drama over text or group chats. Meet in person or get on a voice call. Use 'I feel' statements instead of accusatory 'You did' phrasing. Chandra (Moon) dissolves friction through genuine presence.`;
      deskRitual = `Wear calm alabaster or soft silver. Face North-West. Keep your breathing slow and non-reactive.`;
      break;

    case 'INVESTOR_PITCH':
      contextType = 'business';
      openingOptions = [
        {
          label: 'The Inevitability Hook',
          script: `"Thank you for convening today. Before diving into deck mechanics, let's align on the macro shift that makes our timing mathematically inevitable..."`,
          why: 'Frames the investment as an opportunity rather than a request for funding.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Lead with undeniable compounding metrics within the first 120 seconds. Do not plead for capital; frame the allocation as a finite window of entry into an accelerating trajectory.`;
      deskRitual = `Position your webcam facing ${attire.direction}. Keep a brass or glass vessel of clear water directly to your right; sip once immediately before reciting your valuation ask.`;
      break;

    case 'SALARY_NEGOTIATION':
      contextType = 'business';
      openingOptions = [
        {
          label: 'The Impact Anchor',
          script: `"I appreciate your time today. Over the past cycle, our team delivered results that exceeded our quarterly benchmarks. Today, I'd like to align my compensation with the market value of that impact."`,
          why: 'Ties salary directly to market value and proven impact.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Anchor with an exact number rather than a round range. Once you state your target number, remain completely silent for 5 full seconds. Silence under ${attire.planet} creates psychological surrender in the counterparty.`;
      deskRitual = `Wear a ${attire.primaryColor} shirt or accessory. Face ${attire.direction} so your back is protected and your gaze projects calm inevitability.`;
      break;

    case 'CLIENT_CLOSING':
      contextType = 'business';
      openingOptions = [
        {
          label: 'The Executive Close',
          script: `"Our objective today is simple: finalize the remaining operational terms so your team can commence deployment by next Monday without losing another week of revenue."`,
          why: 'Reminds the client of the cost of delay.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Every objection is merely an unanswered request for risk mitigation. Answer every price hesitation with a scope adjustment rather than a free discount. Lock in verbal agreement during the active ${chosenSlot?.hora?.name || 'Mercury Hora'} window.`;
      deskRitual = `Keep your physical notebook open with a green or brass pen visible on camera. A green writing instrument honors Mercury and channels closing finality.`;
      break;

    case 'CRISIS_DISPUTE':
      contextType = 'business';
      openingOptions = [
        {
          label: 'The Boundary Demarcation',
          script: `"We are meeting today not to re-litigate past friction, but to execute a clean, definitive demarcation that protects mutual interests and allows both parties to proceed unencumbered."`,
          why: 'Defuses emotional accusations and establishes strict boundaries.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Speak with 20% slower cadence than your usual tempo. Do not respond to inflammatory provocations. Document all points in writing before closing the call.`;
      deskRitual = `Wear dark obsidian or navy to ground chaotic energy. Face South or West to enforce unbreakable boundary integrity.`;
      break;

    case 'CREATIVE_ALLIANCE':
      contextType = 'business';
      openingOptions = [
        {
          label: 'The Emotional Truth',
          script: `"We designed this concept around a singular emotional truth. Let me walk you through the experience as your customer will live it..."`,
          why: 'Appeals directly to human feeling and vision.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Frame design decisions through empathy and human prestige. Avoid technical jargon until visual rapport is cemented. Shukra (Venus) rewards aesthetic generosity and fluid dialogue.`;
      deskRitual = `Set your virtual lighting to warm 3200K amber. Use minimalist clean background with no visual clutter.`;
      break;

    default:
      openingOptions = [
        {
          label: 'Clear Outcome Framework',
          script: `"I've outlined three clear outcomes for our conversation today so we align smoothly and reach mutual agreement."`,
          why: 'Gives the conversation structure and removes ambiguity.'
        }
      ];
      openingScript = openingOptions[0].script;
      tacticalAdvice = `Maintain conversational poise by framing expectations early. Speak with steady tempo, listen actively, and conclude agreements before the planetary transit window ends.`;
      deskRitual = `Face ${attire.direction}. Keep posture upright to project solar meridian balance.`;
      break;
  }

  return {
    archetype,
    contextType,
    topic: prompt || topic || 'High-Stakes Strategic Sync',
    goal: goal || 'Flawless execution and mutual agreement',
    strategy: strategy || 'Measured articulation with firm boundary control',
    city: selectedCity.name,
    dateStr: vedicData.date.toDateString(),
    slot: chosenSlot,
    attire,
    openingScript,
    openingOptions,
    tacticalAdvice,
    deskRitual,
    rahuAvoidance: `${formatTime(vedicData.rahuKaalam.start)} – ${formatTime(vedicData.rahuKaalam.end)} (avoid this window)`,
    generatedAt: new Date().toLocaleTimeString()
  };
}
