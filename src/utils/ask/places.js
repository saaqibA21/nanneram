/**
 * Built-in gazetteer so questions about any major city work offline.
 * [name, region, latitude, longitude, IANA time zone, ...aliases]
 */

import { CITIES } from '../vedicTiming.js';

const RAW = [
  // India
  ['Chennai', 'Tamil Nadu', 13.0827, 80.2707, 'Asia/Kolkata', 'madras'],
  ['Coimbatore', 'Tamil Nadu', 11.0168, 76.9558, 'Asia/Kolkata', 'kovai'],
  ['Madurai', 'Tamil Nadu', 9.9252, 78.1198, 'Asia/Kolkata'],
  ['Tiruchirappalli', 'Tamil Nadu', 10.7905, 78.7047, 'Asia/Kolkata', 'trichy', 'tiruchi'],
  ['Salem', 'Tamil Nadu', 11.6643, 78.1460, 'Asia/Kolkata'],
  ['Tirunelveli', 'Tamil Nadu', 8.7139, 77.7567, 'Asia/Kolkata'],
  ['Vellore', 'Tamil Nadu', 12.9165, 79.1325, 'Asia/Kolkata'],
  ['Erode', 'Tamil Nadu', 11.3410, 77.7172, 'Asia/Kolkata'],
  ['Thanjavur', 'Tamil Nadu', 10.7870, 79.1378, 'Asia/Kolkata', 'tanjore'],
  ['Kanchipuram', 'Tamil Nadu', 12.8342, 79.7036, 'Asia/Kolkata', 'kanchi'],
  ['Tiruppur', 'Tamil Nadu', 11.1085, 77.3411, 'Asia/Kolkata'],
  ['Thoothukudi', 'Tamil Nadu', 8.7642, 78.1348, 'Asia/Kolkata', 'tuticorin'],
  ['Nagercoil', 'Tamil Nadu', 8.1833, 77.4119, 'Asia/Kolkata'],
  ['Kumbakonam', 'Tamil Nadu', 10.9617, 79.3881, 'Asia/Kolkata'],
  ['Puducherry', 'Puducherry', 11.9416, 79.8083, 'Asia/Kolkata', 'pondicherry', 'pondy'],
  ['Bengaluru', 'Karnataka', 12.9716, 77.5946, 'Asia/Kolkata', 'bangalore'],
  ['Mysuru', 'Karnataka', 12.2958, 76.6394, 'Asia/Kolkata', 'mysore'],
  ['Mangaluru', 'Karnataka', 12.9141, 74.8560, 'Asia/Kolkata', 'mangalore'],
  ['Hubballi', 'Karnataka', 15.3647, 75.1240, 'Asia/Kolkata', 'hubli'],
  ['Hyderabad', 'Telangana', 17.3850, 78.4867, 'Asia/Kolkata', 'secunderabad'],
  ['Warangal', 'Telangana', 17.9689, 79.5941, 'Asia/Kolkata'],
  ['Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 'Asia/Kolkata', 'vizag'],
  ['Vijayawada', 'Andhra Pradesh', 16.5062, 80.6480, 'Asia/Kolkata'],
  ['Tirupati', 'Andhra Pradesh', 13.6288, 79.4192, 'Asia/Kolkata'],
  ['Guntur', 'Andhra Pradesh', 16.3067, 80.4365, 'Asia/Kolkata'],
  ['Kochi', 'Kerala', 9.9312, 76.2673, 'Asia/Kolkata', 'cochin', 'ernakulam'],
  ['Thiruvananthapuram', 'Kerala', 8.5241, 76.9366, 'Asia/Kolkata', 'trivandrum'],
  ['Kozhikode', 'Kerala', 11.2588, 75.7804, 'Asia/Kolkata', 'calicut'],
  ['Thrissur', 'Kerala', 10.5276, 76.2144, 'Asia/Kolkata', 'trichur'],
  ['Mumbai', 'Maharashtra', 19.0760, 72.8777, 'Asia/Kolkata', 'bombay'],
  ['Pune', 'Maharashtra', 18.5204, 73.8567, 'Asia/Kolkata', 'poona'],
  ['Nagpur', 'Maharashtra', 21.1458, 79.0882, 'Asia/Kolkata'],
  ['Nashik', 'Maharashtra', 19.9975, 73.7898, 'Asia/Kolkata'],
  ['Aurangabad', 'Maharashtra', 19.8762, 75.3433, 'Asia/Kolkata'],
  ['Thane', 'Maharashtra', 19.2183, 72.9781, 'Asia/Kolkata'],
  ['Panaji', 'Goa', 15.4909, 73.8278, 'Asia/Kolkata', 'goa', 'panjim'],
  ['Ahmedabad', 'Gujarat', 23.0225, 72.5714, 'Asia/Kolkata'],
  ['Surat', 'Gujarat', 21.1702, 72.8311, 'Asia/Kolkata'],
  ['Vadodara', 'Gujarat', 22.3072, 73.1812, 'Asia/Kolkata', 'baroda'],
  ['Rajkot', 'Gujarat', 22.3039, 70.8022, 'Asia/Kolkata'],
  ['New Delhi', 'Delhi NCR', 28.6139, 77.2090, 'Asia/Kolkata', 'delhi', 'ncr'],
  ['Gurugram', 'Haryana', 28.4595, 77.0266, 'Asia/Kolkata', 'gurgaon'],
  ['Noida', 'Uttar Pradesh', 28.5355, 77.3910, 'Asia/Kolkata'],
  ['Chandigarh', 'Chandigarh', 30.7333, 76.7794, 'Asia/Kolkata'],
  ['Jaipur', 'Rajasthan', 26.9124, 75.7873, 'Asia/Kolkata'],
  ['Jodhpur', 'Rajasthan', 26.2389, 73.0243, 'Asia/Kolkata'],
  ['Udaipur', 'Rajasthan', 24.5854, 73.7125, 'Asia/Kolkata'],
  ['Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 'Asia/Kolkata'],
  ['Kanpur', 'Uttar Pradesh', 26.4499, 80.3319, 'Asia/Kolkata'],
  ['Varanasi', 'Uttar Pradesh', 25.3176, 82.9739, 'Asia/Kolkata', 'banaras', 'kashi', 'benares'],
  ['Agra', 'Uttar Pradesh', 27.1767, 78.0081, 'Asia/Kolkata'],
  ['Prayagraj', 'Uttar Pradesh', 25.4358, 81.8463, 'Asia/Kolkata', 'allahabad'],
  ['Ayodhya', 'Uttar Pradesh', 26.7922, 82.1998, 'Asia/Kolkata'],
  ['Dehradun', 'Uttarakhand', 30.3165, 78.0322, 'Asia/Kolkata'],
  ['Haridwar', 'Uttarakhand', 29.9457, 78.1642, 'Asia/Kolkata'],
  ['Amritsar', 'Punjab', 31.6340, 74.8723, 'Asia/Kolkata'],
  ['Ludhiana', 'Punjab', 30.9010, 75.8573, 'Asia/Kolkata'],
  ['Shimla', 'Himachal Pradesh', 31.1048, 77.1734, 'Asia/Kolkata'],
  ['Srinagar', 'Jammu & Kashmir', 34.0837, 74.7973, 'Asia/Kolkata'],
  ['Jammu', 'Jammu & Kashmir', 32.7266, 74.8570, 'Asia/Kolkata'],
  ['Bhopal', 'Madhya Pradesh', 23.2599, 77.4126, 'Asia/Kolkata'],
  ['Indore', 'Madhya Pradesh', 22.7196, 75.8577, 'Asia/Kolkata'],
  ['Ujjain', 'Madhya Pradesh', 23.1765, 75.7885, 'Asia/Kolkata'],
  ['Raipur', 'Chhattisgarh', 21.2514, 81.6296, 'Asia/Kolkata'],
  ['Kolkata', 'West Bengal', 22.5726, 88.3639, 'Asia/Kolkata', 'calcutta'],
  ['Bhubaneswar', 'Odisha', 20.2961, 85.8245, 'Asia/Kolkata'],
  ['Puri', 'Odisha', 19.8135, 85.8312, 'Asia/Kolkata'],
  ['Patna', 'Bihar', 25.5941, 85.1376, 'Asia/Kolkata'],
  ['Ranchi', 'Jharkhand', 23.3441, 85.3096, 'Asia/Kolkata'],
  ['Guwahati', 'Assam', 26.1445, 91.7362, 'Asia/Kolkata'],
  ['Shillong', 'Meghalaya', 25.5788, 91.8933, 'Asia/Kolkata'],
  ['Imphal', 'Manipur', 24.8170, 93.9368, 'Asia/Kolkata'],
  ['Port Blair', 'Andaman', 11.6234, 92.7265, 'Asia/Kolkata'],
  // South Asia
  ['Colombo', 'Sri Lanka', 6.9271, 79.8612, 'Asia/Colombo'],
  ['Jaffna', 'Sri Lanka', 9.6615, 80.0255, 'Asia/Colombo'],
  ['Kandy', 'Sri Lanka', 7.2906, 80.6337, 'Asia/Colombo'],
  ['Kathmandu', 'Nepal', 27.7172, 85.3240, 'Asia/Kathmandu'],
  ['Dhaka', 'Bangladesh', 23.8103, 90.4125, 'Asia/Dhaka'],
  ['Karachi', 'Pakistan', 24.8607, 67.0011, 'Asia/Karachi'],
  ['Lahore', 'Pakistan', 31.5204, 74.3587, 'Asia/Karachi'],
  ['Islamabad', 'Pakistan', 33.6844, 73.0479, 'Asia/Karachi'],
  ['Thimphu', 'Bhutan', 27.4728, 89.6390, 'Asia/Thimphu'],
  ['Male', 'Maldives', 4.1755, 73.5093, 'Indian/Maldives'],
  // Middle East
  ['Dubai', 'UAE', 25.2048, 55.2708, 'Asia/Dubai'],
  ['Abu Dhabi', 'UAE', 24.4539, 54.3773, 'Asia/Dubai'],
  ['Sharjah', 'UAE', 25.3463, 55.4209, 'Asia/Dubai'],
  ['Doha', 'Qatar', 25.2854, 51.5310, 'Asia/Qatar'],
  ['Muscat', 'Oman', 23.5880, 58.3829, 'Asia/Muscat'],
  ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 'Asia/Riyadh'],
  ['Jeddah', 'Saudi Arabia', 21.4858, 39.1925, 'Asia/Riyadh'],
  ['Kuwait City', 'Kuwait', 29.3759, 47.9774, 'Asia/Kuwait', 'kuwait'],
  ['Manama', 'Bahrain', 26.2285, 50.5860, 'Asia/Bahrain', 'bahrain'],
  ['Tel Aviv', 'Israel', 32.0853, 34.7818, 'Asia/Jerusalem'],
  ['Istanbul', 'Turkey', 41.0082, 28.9784, 'Europe/Istanbul'],
  ['Tehran', 'Iran', 35.6892, 51.3890, 'Asia/Tehran'],
  // East & South-East Asia, Oceania
  ['Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore'],
  ['Kuala Lumpur', 'Malaysia', 3.1390, 101.6869, 'Asia/Kuala_Lumpur', 'kl'],
  ['Penang', 'Malaysia', 5.4141, 100.3288, 'Asia/Kuala_Lumpur', 'george town'],
  ['Bangkok', 'Thailand', 13.7563, 100.5018, 'Asia/Bangkok'],
  ['Jakarta', 'Indonesia', -6.2088, 106.8456, 'Asia/Jakarta'],
  ['Bali', 'Indonesia', -8.6500, 115.2167, 'Asia/Makassar', 'denpasar'],
  ['Manila', 'Philippines', 14.5995, 120.9842, 'Asia/Manila'],
  ['Ho Chi Minh City', 'Vietnam', 10.8231, 106.6297, 'Asia/Ho_Chi_Minh', 'saigon'],
  ['Hanoi', 'Vietnam', 21.0278, 105.8342, 'Asia/Ho_Chi_Minh'],
  ['Yangon', 'Myanmar', 16.8409, 96.1735, 'Asia/Yangon', 'rangoon'],
  ['Hong Kong', 'China', 22.3193, 114.1694, 'Asia/Hong_Kong'],
  ['Shanghai', 'China', 31.2304, 121.4737, 'Asia/Shanghai'],
  ['Beijing', 'China', 39.9042, 116.4074, 'Asia/Shanghai'],
  ['Shenzhen', 'China', 22.5431, 114.0579, 'Asia/Shanghai'],
  ['Taipei', 'Taiwan', 25.0330, 121.5654, 'Asia/Taipei'],
  ['Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo'],
  ['Osaka', 'Japan', 34.6937, 135.5023, 'Asia/Tokyo'],
  ['Seoul', 'South Korea', 37.5665, 126.9780, 'Asia/Seoul'],
  ['Sydney', 'Australia', -33.8688, 151.2093, 'Australia/Sydney'],
  ['Melbourne', 'Australia', -37.8136, 144.9631, 'Australia/Melbourne'],
  ['Brisbane', 'Australia', -27.4698, 153.0251, 'Australia/Brisbane'],
  ['Perth', 'Australia', -31.9505, 115.8605, 'Australia/Perth'],
  ['Adelaide', 'Australia', -34.9285, 138.6007, 'Australia/Adelaide'],
  ['Canberra', 'Australia', -35.2809, 149.1300, 'Australia/Sydney'],
  ['Auckland', 'New Zealand', -36.8485, 174.7633, 'Pacific/Auckland'],
  ['Wellington', 'New Zealand', -41.2865, 174.7762, 'Pacific/Auckland'],
  ['Suva', 'Fiji', -18.1248, 178.4501, 'Pacific/Fiji', 'fiji'],
  // Europe
  ['London', 'UK', 51.5074, -0.1278, 'Europe/London'],
  ['Manchester', 'UK', 53.4808, -2.2426, 'Europe/London'],
  ['Birmingham', 'UK', 52.4862, -1.8904, 'Europe/London'],
  ['Leicester', 'UK', 52.6369, -1.1398, 'Europe/London'],
  ['Edinburgh', 'UK', 55.9533, -3.1883, 'Europe/London'],
  ['Glasgow', 'UK', 55.8642, -4.2518, 'Europe/London'],
  ['Dublin', 'Ireland', 53.3498, -6.2603, 'Europe/Dublin'],
  ['Paris', 'France', 48.8566, 2.3522, 'Europe/Paris'],
  ['Berlin', 'Germany', 52.5200, 13.4050, 'Europe/Berlin'],
  ['Munich', 'Germany', 48.1351, 11.5820, 'Europe/Berlin'],
  ['Frankfurt', 'Germany', 50.1109, 8.6821, 'Europe/Berlin'],
  ['Hamburg', 'Germany', 53.5511, 9.9937, 'Europe/Berlin'],
  ['Amsterdam', 'Netherlands', 52.3676, 4.9041, 'Europe/Amsterdam'],
  ['Brussels', 'Belgium', 50.8503, 4.3517, 'Europe/Brussels'],
  ['Zurich', 'Switzerland', 47.3769, 8.5417, 'Europe/Zurich'],
  ['Geneva', 'Switzerland', 46.2044, 6.1432, 'Europe/Zurich'],
  ['Vienna', 'Austria', 48.2082, 16.3738, 'Europe/Vienna'],
  ['Rome', 'Italy', 41.9028, 12.4964, 'Europe/Rome'],
  ['Milan', 'Italy', 45.4642, 9.1900, 'Europe/Rome'],
  ['Madrid', 'Spain', 40.4168, -3.7038, 'Europe/Madrid'],
  ['Barcelona', 'Spain', 41.3851, 2.1734, 'Europe/Madrid'],
  ['Lisbon', 'Portugal', 38.7223, -9.1393, 'Europe/Lisbon'],
  ['Stockholm', 'Sweden', 59.3293, 18.0686, 'Europe/Stockholm'],
  ['Oslo', 'Norway', 59.9139, 10.7522, 'Europe/Oslo'],
  ['Copenhagen', 'Denmark', 55.6761, 12.5683, 'Europe/Copenhagen'],
  ['Helsinki', 'Finland', 60.1699, 24.9384, 'Europe/Helsinki'],
  ['Warsaw', 'Poland', 52.2297, 21.0122, 'Europe/Warsaw'],
  ['Prague', 'Czechia', 50.0755, 14.4378, 'Europe/Prague'],
  ['Budapest', 'Hungary', 47.4979, 19.0402, 'Europe/Budapest'],
  ['Athens', 'Greece', 37.9838, 23.7275, 'Europe/Athens'],
  ['Moscow', 'Russia', 55.7558, 37.6173, 'Europe/Moscow'],
  // Africa
  ['Cairo', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo'],
  ['Nairobi', 'Kenya', -1.2921, 36.8219, 'Africa/Nairobi'],
  ['Lagos', 'Nigeria', 6.5244, 3.3792, 'Africa/Lagos'],
  ['Johannesburg', 'South Africa', -26.2041, 28.0473, 'Africa/Johannesburg'],
  ['Durban', 'South Africa', -29.8587, 31.0218, 'Africa/Johannesburg'],
  ['Cape Town', 'South Africa', -33.9249, 18.4241, 'Africa/Johannesburg'],
  ['Port Louis', 'Mauritius', -20.1609, 57.5012, 'Indian/Mauritius', 'mauritius'],
  ['Dar es Salaam', 'Tanzania', -6.7924, 39.2083, 'Africa/Dar_es_Salaam'],
  // Americas
  ['New York', 'USA (Eastern)', 40.7128, -74.0060, 'America/New_York', 'nyc', 'new york city', 'manhattan'],
  ['New Jersey', 'USA (Eastern)', 40.7357, -74.1724, 'America/New_York', 'nj', 'newark', 'edison'],
  ['Boston', 'USA (Eastern)', 42.3601, -71.0589, 'America/New_York'],
  ['Philadelphia', 'USA (Eastern)', 39.9526, -75.1652, 'America/New_York'],
  ['Washington DC', 'USA (Eastern)', 38.9072, -77.0369, 'America/New_York', 'washington', 'dc'],
  ['Atlanta', 'USA (Eastern)', 33.7490, -84.3880, 'America/New_York'],
  ['Miami', 'USA (Eastern)', 25.7617, -80.1918, 'America/New_York'],
  ['Orlando', 'USA (Eastern)', 28.5383, -81.3792, 'America/New_York'],
  ['Charlotte', 'USA (Eastern)', 35.2271, -80.8431, 'America/New_York'],
  ['Raleigh', 'USA (Eastern)', 35.7796, -78.6382, 'America/New_York'],
  ['Pittsburgh', 'USA (Eastern)', 40.4406, -79.9959, 'America/New_York'],
  ['Detroit', 'USA (Eastern)', 42.3314, -83.0458, 'America/Detroit'],
  ['Columbus', 'USA (Eastern)', 39.9612, -82.9988, 'America/New_York'],
  ['Chicago', 'USA (Central)', 41.8781, -87.6298, 'America/Chicago'],
  ['Houston', 'USA (Central)', 29.7604, -95.3698, 'America/Chicago'],
  ['Dallas', 'USA (Central)', 32.7767, -96.7970, 'America/Chicago', 'fort worth', 'irving', 'plano'],
  ['Austin', 'USA (Central)', 30.2672, -97.7431, 'America/Chicago'],
  ['San Antonio', 'USA (Central)', 29.4241, -98.4936, 'America/Chicago'],
  ['Minneapolis', 'USA (Central)', 44.9778, -93.2650, 'America/Chicago'],
  ['St. Louis', 'USA (Central)', 38.6270, -90.1994, 'America/Chicago', 'st louis', 'saint louis'],
  ['Nashville', 'USA (Central)', 36.1627, -86.7816, 'America/Chicago'],
  ['Denver', 'USA (Mountain)', 39.7392, -104.9903, 'America/Denver'],
  ['Phoenix', 'USA (Arizona)', 33.4484, -112.0740, 'America/Phoenix'],
  ['Salt Lake City', 'USA (Mountain)', 40.7608, -111.8910, 'America/Denver'],
  ['San Francisco', 'USA (Pacific)', 37.7749, -122.4194, 'America/Los_Angeles', 'sf', 'bay area', 'silicon valley'],
  ['San Jose', 'USA (Pacific)', 37.3382, -121.8863, 'America/Los_Angeles', 'sunnyvale', 'santa clara', 'cupertino', 'fremont'],
  ['Los Angeles', 'USA (Pacific)', 34.0522, -118.2437, 'America/Los_Angeles', 'la'],
  ['San Diego', 'USA (Pacific)', 32.7157, -117.1611, 'America/Los_Angeles'],
  ['Seattle', 'USA (Pacific)', 47.6062, -122.3321, 'America/Los_Angeles', 'redmond', 'bellevue'],
  ['Portland', 'USA (Pacific)', 45.5152, -122.6784, 'America/Los_Angeles'],
  ['Las Vegas', 'USA (Pacific)', 36.1699, -115.1398, 'America/Los_Angeles'],
  ['Sacramento', 'USA (Pacific)', 38.5816, -121.4944, 'America/Los_Angeles'],
  ['Honolulu', 'USA (Hawaii)', 21.3069, -157.8583, 'Pacific/Honolulu', 'hawaii'],
  ['Toronto', 'Canada', 43.6532, -79.3832, 'America/Toronto', 'brampton', 'mississauga', 'scarborough'],
  ['Montreal', 'Canada', 45.5017, -73.5673, 'America/Toronto'],
  ['Ottawa', 'Canada', 45.4215, -75.6972, 'America/Toronto'],
  ['Vancouver', 'Canada', 49.2827, -123.1207, 'America/Vancouver', 'surrey'],
  ['Calgary', 'Canada', 51.0447, -114.0719, 'America/Edmonton'],
  ['Edmonton', 'Canada', 53.5461, -113.4938, 'America/Edmonton'],
  ['Winnipeg', 'Canada', 49.8951, -97.1384, 'America/Winnipeg'],
  ['Mexico City', 'Mexico', 19.4326, -99.1332, 'America/Mexico_City'],
  ['Sao Paulo', 'Brazil', -23.5505, -46.6333, 'America/Sao_Paulo', 'são paulo'],
  ['Rio de Janeiro', 'Brazil', -22.9068, -43.1729, 'America/Sao_Paulo', 'rio'],
  ['Buenos Aires', 'Argentina', -34.6037, -58.3816, 'America/Argentina/Buenos_Aires'],
  ['Santiago', 'Chile', -33.4489, -70.6693, 'America/Santiago'],
  ['Lima', 'Peru', -12.0464, -77.0428, 'America/Lima'],
  ['Bogota', 'Colombia', 4.7110, -74.0721, 'America/Bogota', 'bogotá'],
  ['Port of Spain', 'Trinidad and Tobago', 10.6549, -61.5019, 'America/Port_of_Spain', 'trinidad'],
  ['Georgetown', 'Guyana', 6.8013, -58.1551, 'America/Guyana', 'guyana']
];

export const PLACES = RAW.map(([name, region, lat, lng, timeZone, ...aliases]) => {
  const preset = CITIES.find((c) => c.name === name);
  return preset
    ? { ...preset, region, aliases, preset: true }
    : { name, state: region, region, lat, lng, timeZone, aliases, preset: false };
});

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Longest names first so "new york city" wins over "york", "san jose" over "jose"
const MATCHERS = PLACES.flatMap((p) => [p.name, ...p.aliases].map((term) => ({ term: term.toLowerCase(), place: p })))
  .sort((a, b) => b.term.length - a.term.length)
  .map((m) => ({ ...m, re: new RegExp(`(^|[^a-z])${escapeRe(m.term)}($|[^a-z])`) }));

// Short aliases that are also ordinary words need a place cue ("in la", "at dc")
const AMBIGUOUS = new Set(['la', 'dc', 'kl', 'sf', 'nj', 'rio', 'goa', 'kashi', 'washington', 'surrey', 'perth', 'columbus', 'salem', 'puri', 'male']);

/** All places mentioned in the text, in the order they appear. */
export function findPlaces(text) {
  const lower = ` ${text.toLowerCase()} `;
  const found = [];
  const taken = [];
  for (const m of MATCHERS) {
    const hit = m.re.exec(lower);
    if (!hit) continue;
    const start = hit.index + hit[1].length;
    const end = start + m.term.length;
    if (taken.some(([s, e]) => start < e && end > s)) continue;
    if (AMBIGUOUS.has(m.term) && !new RegExp(`\\b(in|at|for|from|to|near|around)\\s+${escapeRe(m.term)}\\b`).test(lower)) continue;
    if (found.some((f) => f.place === m.place)) continue;
    taken.push([start, end]);
    found.push({ place: m.place, index: start });
  }
  return found.sort((a, b) => a.index - b.index).map((f) => f.place);
}

/** Time-zone abbreviations people type, mapped to a representative zone. */
export const ZONE_ABBREVIATIONS = {
  ist: { label: 'IST (India)', timeZone: 'Asia/Kolkata' },
  est: { label: 'US Eastern', timeZone: 'America/New_York' },
  edt: { label: 'US Eastern', timeZone: 'America/New_York' },
  et: { label: 'US Eastern', timeZone: 'America/New_York' },
  cst: { label: 'US Central', timeZone: 'America/Chicago' },
  cdt: { label: 'US Central', timeZone: 'America/Chicago' },
  mst: { label: 'US Mountain', timeZone: 'America/Denver' },
  pst: { label: 'US Pacific', timeZone: 'America/Los_Angeles' },
  pdt: { label: 'US Pacific', timeZone: 'America/Los_Angeles' },
  pt: { label: 'US Pacific', timeZone: 'America/Los_Angeles' },
  gmt: { label: 'GMT', timeZone: 'Etc/GMT' },
  utc: { label: 'UTC', timeZone: 'Etc/UTC' },
  bst: { label: 'UK time', timeZone: 'Europe/London' },
  cet: { label: 'Central Europe', timeZone: 'Europe/Berlin' },
  cest: { label: 'Central Europe', timeZone: 'Europe/Berlin' },
  gst: { label: 'Gulf (GST)', timeZone: 'Asia/Dubai' },
  sgt: { label: 'Singapore', timeZone: 'Asia/Singapore' },
  aest: { label: 'Sydney', timeZone: 'Australia/Sydney' },
  aedt: { label: 'Sydney', timeZone: 'Australia/Sydney' },
  jst: { label: 'Japan', timeZone: 'Asia/Tokyo' },
  pkt: { label: 'Pakistan', timeZone: 'Asia/Karachi' },
  npt: { label: 'Nepal', timeZone: 'Asia/Kathmandu' }
};
