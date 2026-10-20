/**
 * What Nanneram knows about its own product and about the traditional terms.
 * Each entry is matched by keyword groups: every group must have at least one hit.
 */

import { CITIES, HORA_METADATA } from '../vedicTiming.js';

export const GLOSSARY = [
  {
    id: 'rahu', name: 'Rahu Kaalam', re: /\b(r[ae]h?[ua]h?|raagu|ragu|raghu)\s*-?\s*(ka+l+a*m?|kal|kaal|kala|kalam)\b|\brahukalam\b|\brahukaal\b|\brahu\b/,
    text: 'Rahu Kaalam is a roughly 90-minute window each day (one eighth of the daytime) fixed by the weekday. Traditionally you do not begin anything important in it: contracts, launches, pitches, journeys, purchases or ceremonies. Routine work and things already in progress are fine.'
  },
  {
    id: 'yama', name: 'Yamagandam', re: /\b(y|e)amaga?n?dam\b|\byama\s*ga?n?dam\b|\byamagand\b|\bemagandam\b|\byama\b/,
    text: 'Yamagandam is another weekday-fixed eighth of the daytime. Work started in it is said to meet friction or end badly, so launches, travel and big spending are usually moved out of it.'
  },
  {
    id: 'gulika', name: 'Gulika Kaalam', re: /\bg[ou]li?ka+i?\b|\bkuligai\b|\bgulikai\b|\bmandi\b/,
    text: 'Gulika (Kuligai) Kaalam is a weekday-fixed eighth of the daytime. Whatever begins in it tends to repeat. That is welcome for routine or recurring things (savings, regular payments) and unwelcome for disputes, debts, illness or funeral rites.'
  },
  {
    id: 'nalla', name: 'Nalla Neram', re: /\bnall?a\s*n[ae]+ram\b|\bnallaneram\b|\bgood time\b|\bauspicious time\b|\bsubha?\s*(n[ae]ram|muhurt\w*)\b/,
    text: 'Nalla Neram is Tamil for "good time". Nanneram uses the favourable parts of the Gowri Panchangam (Amirtham, Labham, Danam, Sugam, Uthi) for it, which is how most Tamil daily calendars list Nalla Neram.'
  },
  {
    id: 'gowri', name: 'Gowri Panchangam', re: /\bg[ao]u?wri\b|\bgauri\b|\bgowri panchangam\b/,
    text: 'The Gowri Panchangam splits the day (sunrise to sunset) and the night (sunset to next sunrise) into 8 equal parts each, in a fixed order for every weekday. Amirtham (best), Labham (gain), Danam (wealth), Sugam and Uthi are favourable. Rogam, Soram and Visham are not.'
  },
  {
    id: 'hora', name: 'Hora', re: /\bhora\b|\bhoras\b|\bplanetary hour/,
    text: 'A Hora is a planetary hour. The daytime and the night are each split into 12 Horas, ruled in turn by Saturn, Jupiter, Mars, Sun, Venus, Mercury and Moon, starting with the weekday\'s own planet at sunrise. Mercury suits deals and communication, Jupiter wisdom, money and ceremonies, Sun authority and officials, Venus romance, art and purchases, Moon travel and family. Mars and Saturn call for caution with new starts.'
  },
  {
    id: 'choghadiya', name: 'Choghadiya', re: /\bchog?hadiya\b|\bchoghadia\b|\bchowghadiya\b/,
    text: 'Choghadiya is the North and West Indian equivalent of the Gowri system: day and night are each split into 8 parts named Amrit, Shubh, Labh, Char, Udveg, Kaal and Rog. Amrit, Shubh and Labh are good, Char is neutral (fine for travel), and Udveg, Kaal and Rog are avoided.'
  },
  {
    id: 'abhijit', name: 'Abhijit Muhurtham', re: /\babhij[ie]e?t\b/,
    text: 'Abhijit Muhurtham is the 8th of the 15 parts of the daytime, centred on local noon (about 48 minutes). It is considered strong enough to override many other defects, except on Wednesdays when it is traditionally skipped.'
  },
  {
    id: 'brahma', name: 'Brahma Muhurtham', re: /\bbrahma\s*muhur?th?am?\b|\bbrahma muhurat\b|\bbrahmamuhurtham\b/,
    text: 'Brahma Muhurtham is the 48 minutes that end 48 minutes before sunrise. It is traditionally the best time for prayer, meditation and study.'
  },
  {
    id: 'tithi', name: 'Tithi', re: /\bthithi\b|\btithi\b|\blunar day\b/,
    text: 'A tithi is a lunar day: each 12° the Moon gains on the Sun. There are 30 in a lunar month, 15 in the waxing half (Shukla Paksha, ending at Pournami) and 15 in the waning half (Krishna Paksha, ending at Amavasai). Tithis begin and end at any hour, so a calendar usually quotes the tithi at sunrise.'
  },
  {
    id: 'nakshatra', name: 'Nakshatra', re: /\bnakshat?h?ra(m)?\b|\bnatchathiram\b|\bbirth star\b|\bstar\b/,
    text: 'A nakshatra is one of 27 lunar mansions, each 13°20\' of the sidereal zodiac. The Moon spends about a day in each. Your birth nakshatra (janma nakshatra) is the one the Moon was in when you were born.'
  },
  {
    id: 'yoga', name: 'Yoga', re: /\byogam\b|\bpanchang yoga\b|\byoga\b(?! class| session| practice| mat)/,
    text: 'In the panchang, yoga is the sum of the Sun\'s and Moon\'s sidereal longitudes divided into 27 parts. Nine of them (Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti) are avoided for new beginnings.'
  },
  {
    id: 'karana', name: 'Karana', re: /\bkarana\b|\bkaranam\b|\bvishti\b|\bbhadra\b/,
    text: 'A karana is half a tithi, so there are 60 in a lunar month. Vishti (also called Bhadra) is the one traditionally avoided for auspicious work.'
  },
  {
    id: 'paksha', name: 'Paksha', re: /\bpaksha\b|\bshukla\b|\bkrishna paksha\b|\bwaxing\b|\bwaning\b|\bvalarpirai\b|\btheipirai\b/,
    text: 'Shukla Paksha (valarpirai) is the waxing half of the lunar month, from new moon to full moon, traditionally preferred for new beginnings. Krishna Paksha (theipirai) is the waning half.'
  },
  {
    id: 'chandrashtamam', name: 'Chandrashtamam', re: /\bchandrashtam(am)?\b|\bchandrastam(am)?\b|\bchandra ashtamam\b/,
    text: 'Chandrashtamam is the roughly 2.5 days each month when the Moon passes through the 8th sign from your birth (Moon) sign. People avoid important starts and arguments then. Tell me your rasi or birth star and I will give you the next dates.'
  },
  {
    id: 'rasi', name: 'Rasi', re: /\brasi\b|\brashi\b|\bzodiac\b|\bmoon sign\b|\bsun sign\b/,
    text: 'A rasi is one of 12 signs of the sidereal zodiac (30° each). Your Moon sign (janma rasi) is the sign the Moon was in at birth, which is what Tamil and Indian calendars mean by "your rasi".'
  },
  {
    id: 'muhurtham', name: 'Muhurtham', re: /\bmuhur?th?am\b|\bmuhurat\b|\bmuhurta\b/,
    text: 'A muhurtham is an auspicious time chosen for an event. For big events (weddings, housewarming, business openings) astrologers also look at the tithi, nakshatra, yoga and the couple\'s birth charts. Nanneram gives you the daily layer: Rahu Kaalam, Yamagandam, Gowri, Hora and the day\'s panchang, which narrows things down a lot. For a wedding muhurtham, confirm with a family astrologer.'
  },
  {
    id: 'amavasai', name: 'Amavasai', re: /\bamavas(ai|ya|i)\b|\bnew moon\b/,
    text: 'Amavasai (Amavasya) is the new moon day, the 30th tithi. It is used for remembering ancestors (tarpanam) and generally avoided for celebrations and new starts.'
  },
  {
    id: 'pournami', name: 'Pournami', re: /\bpou?rnami\b|\bpurnima\b|\bpoornima\b|\bfull moon\b/,
    text: 'Pournami (Purnima) is the full moon day, the 15th tithi of the waxing half. It is a popular day for temple visits, girivalam and vrathams.'
  },
  {
    id: 'ekadashi', name: 'Ekadashi', re: /\beka+da?s(h)?i\b/,
    text: 'Ekadashi is the 11th tithi of each half of the lunar month, observed with fasting in honour of Vishnu. It comes about twice a month.'
  },
  {
    id: 'pradosham', name: 'Pradosham', re: /\bpradosh(am)?\b/,
    text: 'Pradosham is the Trayodashi (13th tithi) evening around sunset, twice a month, observed at Shiva temples.'
  }
];

const cities = CITIES.map((c) => c.name).join(', ');

export const FAQ = [
  { id: 'what_is', groups: [/\b(what is|what's|about|explain|tell me about)\b/, /\b(nanneram|this (site|app|website|tool)|you)\b/],
    text: 'Nanneram is a good-time planner. It works out Rahu Kaalam, Yamagandam, Gulika, Horas, the Gowri Panchangam (Nalla Neram), choghadiya and the day\'s tithi and nakshatra from the real sunrise and sunset of your city, then picks the best slots for meetings and other plans and puts them in your calendar.' },
  { id: 'who', groups: [/\b(who are you|who made|who built|your name|are you (a )?(bot|ai|human|real)|chatgpt|gpt)\b/],
    text: 'I am Nanneram\'s built-in assistant. Every answer is calculated right here in your browser from sunrise, sunset and the Moon\'s position for your city, using traditional Tamil and Vedic timekeeping. No outside AI service is involved.' },
  { id: 'pages', groups: [/\b(how (do|can) i|how to|where (do|can) i|help|guide|use|navigate|features?|pages?)\b/, /\b(use|site|app|website|nanneram|features?|pages?|start|work)\b/],
    text: 'There are six pages:\n- Today: what is running right now, a day/night timeline and the key windows\n- Schedule: pick a meeting type and length, get the best slots, add them to Google Calendar or download an .ics\n- Advisor: what to wear, which way to face and how to open a meeting\n- Ask: this page, for any question\n- Guide: what the terms mean and the numbers behind your city\'s times\n- Plans: pricing\nThe city and date at the top of Today, Schedule and Advisor drive every time shown.' },
  { id: 'zoom', groups: [/\b(zoom|pmi|meeting id|personal room|vanity)\b/],
    text: 'To add your Zoom room: tap the video button in the top bar (or "Set up" under "Where will you meet?" on Schedule), choose Zoom, and enter your Personal Meeting ID (with passcode if you use one) or your personal link like zoom.us/my/yourname. It is saved only in your browser and added to every calendar event and copied invite. Nanneram does not sign in to your Zoom account.' },
  { id: 'meet', groups: [/\b(google meet|gmeet|meet link|meet room|meet\.google)\b/],
    text: 'Google Meet has no permanent ID, so create a room once at meet.google.com/new, copy its link, then paste it under "Set up Google Meet" in the top bar. Nanneram adds that same link to every invite so everyone joins the same room. If you leave it empty, use "Add Google Meet" inside Google Calendar instead.' },
  { id: 'offline', groups: [/\b(offline|internet|wifi|no network|without internet|install|app store|play store|mobile app|android|iphone|ios)\b/],
    text: 'Nanneram runs in the browser and works on phones. All calculations happen on your device, so once the page has loaded, answers do not need a connection. There is no separate app-store app yet; you can add the site to your home screen from your browser menu.' },
  { id: 'sixam', groups: [/\b(different|differ|mismatch|not matching|doesn't match|does not match|calendar says|paper|newspaper|other app|daily sheet|6 ?am)\b/],
    text: 'Many printed calendars assume sunrise at 6:00 AM and list the same Rahu Kaalam all year (for example 7:30–9:00 on Mondays). Nanneram uses the real sunrise and sunset for your city and date, so its windows shift by a few minutes through the year and between cities. Both follow the same rule; ours is just measured, not assumed.' },
  { id: 'guarantee', groups: [/\b(guarantee|really work|does (it|this) work|is (it|this) (true|real|scientific)|proof|superstition|believe|science|evidence)\b/],
    text: 'Honestly: these are traditional timekeeping customs, not predictions. Nothing here can guarantee a result, and it is not financial, legal or medical advice. Many people use it the way they would use a good-luck routine: to pick a calm, deliberate moment and to avoid the windows their families avoid. Preparation still matters most.' },
  { id: 'accuracy', groups: [/\b(accurate|accuracy|correct|wrong|precise|precision|how (do|does|is|are) (you|it|nanneram|this)|calculat|method|formula|source|reliable|trust|drik|verify)\b/],
    text: 'Sunrise and sunset come from the NOAA solar equations for your city\'s exact latitude and longitude, with daylight saving handled. Rahu Kaalam, Yamagandam, Gulika, Gowri and choghadiya are the traditional divisions of that day and night. Tithi, nakshatra and yoga come from the Sun\'s and Moon\'s positions (Meeus algorithms, Lahiri ayanamsa). Checked against Drik Panchang for Chennai, the times agree to within about a minute. Small differences with printed calendars usually come from them using a fixed 6 AM sunrise.' },
  { id: 'calendar', groups: [/\b(calendar|ics|outlook|apple calendar|icloud|add to|export|invite|reminder|remind|notification|alarm|alert)\b/],
    text: 'Every suggested slot has three buttons: Add to Google Calendar (opens a pre-filled event at the exact time), Apple / Outlook (.ics) which downloads a calendar file with a reminder 5 minutes before the window ends, and Copy invite for WhatsApp or email. Times are stored in UTC, so they show correctly in every time zone. Automatic two-way calendar sync is not available yet.' },
  { id: 'pricing', groups: [/\b(price|pricing|cost|costs|paid|pay|subscription|plans?|free|premium|pro|upgrade|money back|refund)\b/],
    text: 'Everything on Nanneram is free during the preview. Planned paid tiers are Pro at ₹599 a month ($15) and Team at ₹2,499 a month ($49); their extra features are marked "coming soon" on the Plans page and nothing is charged today.' },
  { id: 'cities', groups: [/\b(cities|city|location|place|country|countries|where)\b/, /\b(support|supported|available|which|what|list|add|my|other|change)\b/],
    text: `The city picker has ${cities}. Here in Ask you can name about 200 cities worldwide (all major Indian cities, Tamil Nadu towns, Sri Lanka, the Gulf, Singapore, Malaysia, Europe, the US, Canada and Australia), for example "Rahu Kaalam in Toronto tomorrow". To change the city for the whole site, use the City box at the top of Today, Schedule or Advisor; your choice is remembered.` },
  { id: 'privacy', groups: [/\b(privacy|private|data|track|tracking|store|stored|save|saved|cookies|account|login|sign ?in|sign ?up|register)\b/],
    text: 'There is no account and no server storing your data. Your chosen city, mode, Zoom or Meet link and this chat are kept only in your own browser. Nothing you type here leaves your device.' },
  { id: 'modes', groups: [/\b(gen[- ]?z|genz|classic|mode|aura|rizz)\b/],
    text: 'Classic and Gen-Z modes (top bar) change the tone, labels and advice style. The timings underneath are exactly the same.' },
  { id: 'advisor', groups: [/\b(advisor|adviser|what to wear|wear|outfit|colou?r|dress|attire|direction|face|opening line)\b/, /\b(how|what|advisor|work|page|tell|use)\b/],
    text: 'The Advisor page takes a description of your meeting and returns the best window that day, colours and fabrics to wear, which direction to face, an opening line and how to run the conversation. You can also just ask me here, for example "what should I wear for a job interview tomorrow".' },
  { id: 'contact', groups: [/\b(contact|support|email you|feedback|bug|report|complain|team|founder|whatsapp you)\b/],
    text: 'Nanneram is in preview. For feedback, tell the person who shared the site with you, or note the question you asked and what you expected and they can pass it on.' },
  { id: 'language', groups: [/\b(tamil|hindi|telugu|kannada|malayalam|language|translate)\b/, /\b(language|speak|in tamil|in hindi|support|translate|can you)\b/],
    text: 'Answers are in English for now, but I understand common Tamil and Hindi terms like Nalla Neram, Ragu Kalam, Emagandam, Kuligai, Gowri, Abhijit, Muhurtham, naalai (tomorrow) and choghadiya.' },
  { id: 'timezone_help', groups: [/\b(time ?zone|daylight saving|dst|wrong time|utc|different time)\b/],
    text: 'Every time Nanneram shows is local to the city you picked (or named), including daylight saving in places like London, New York and Sydney. Calendar files are written in UTC, so your calendar shows the slot in your own time zone automatically. Ask "what is 10 AM in Chennai in Toronto time" to convert.' },
  { id: 'schedule_how', groups: [/\b(schedule|slot|slots|best time|ranking|ranked|rank|score|choose|chosen|pick)\b/, /\b(how|why|work|works|decide|chosen|calculated|logic)\b/],
    text: 'For a slot, Nanneram checks every 15 minutes in the window (9 AM–7 PM for meetings, sunrise to sunset for ceremonies and purchases, or the hours you name). It drops anything touching Rahu Kaalam or Yamagandam, requires a favourable Gowri part at the start, then ranks by how well the Hora suits what you are doing, plus Amirtham/Labham Gowri, a good choghadiya and, for big events, the day\'s tithi, yoga and karana.' }
];

export const HORAS = HORA_METADATA;

export const JOKES = [
  'Why did the meeting start late? It was waiting for Rahu Kaalam to finish. Responsible meeting.',
  'My calendar and my panchang had a fight. Now every reminder says "use care".',
  'I asked Saturn Hora to hurry up. It said "patience is my whole personality".',
  'Mercury Hora walks into a negotiation. Everyone signs. Nobody remembers why.'
];
