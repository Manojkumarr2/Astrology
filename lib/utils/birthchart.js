const SunCalc = require('suncalc');


class BirthChartGenerator {
    constructor() {
        this.RASHIS = [
            { number: 1, name: 'Mesha', english: 'Aries', tamil: 'மேஷம்', lord: 'Mars', lordTamil: 'செவ்வாய்', element: 'Fire', elementTamil: 'நெருப்பு', degrees: [0, 30] },
            { number: 2, name: 'Vrishabha', english: 'Taurus', tamil: 'ரிஷபம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', element: 'Earth', elementTamil: 'பூமி', degrees: [30, 60] },
            { number: 3, name: 'Mithuna', english: 'Gemini', tamil: 'மிதுனம்', lord: 'Mercury', lordTamil: 'புதன்', element: 'Air', elementTamil: 'காற்று', degrees: [60, 90] },
            { number: 4, name: 'Karka', english: 'Cancer', tamil: 'கடகம்', lord: 'Moon', lordTamil: 'சந்திரன்', element: 'Water', elementTamil: 'நீர்', degrees: [90, 120] },
            { number: 5, name: 'Simha', english: 'Leo', tamil: 'சிம்மம்', lord: 'Sun', lordTamil: 'சூரியன்', element: 'Fire', elementTamil: 'நெருப்பு', degrees: [120, 150] },
            { number: 6, name: 'Kanya', english: 'Virgo', tamil: 'கன்னி', lord: 'Mercury', lordTamil: 'புதன்', element: 'Earth', elementTamil: 'பூமி', degrees: [150, 180] },
            { number: 7, name: 'Tula', english: 'Libra', tamil: 'துலாம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', element: 'Air', elementTamil: 'காற்று', degrees: [180, 210] },
            { number: 8, name: 'Vrishchika', english: 'Scorpio', tamil: 'விருச்சிகம்', lord: 'Mars', lordTamil: 'செவ்வாய்', element: 'Water', elementTamil: 'நீர்', degrees: [210, 240] },
            { number: 9, name: 'Dhanu', english: 'Sagittarius', tamil: 'தனுசு', lord: 'Jupiter', lordTamil: 'குரு', element: 'Fire', elementTamil: 'நெருப்பு', degrees: [240, 270] },
            { number: 10, name: 'Makara', english: 'Capricorn', tamil: 'மகரம்', lord: 'Saturn', lordTamil: 'சனி', element: 'Earth', elementTamil: 'பூமி', degrees: [270, 300] },
            { number: 11, name: 'Kumbha', english: 'Aquarius', tamil: 'கும்பம்', lord: 'Saturn', lordTamil: 'சனி', element: 'Air', elementTamil: 'காற்று', degrees: [300, 330] },
            { number: 12, name: 'Meena', english: 'Pisces', tamil: 'மீனம்', lord: 'Jupiter', lordTamil: 'குரு', element: 'Water', elementTamil: 'நீர்', degrees: [330, 360] }
        ];

        this.NAKSHATRAS = [
            { number: 1, name: 'Ashwini', lord: 'Ketu', rashi: 'Mesha', degrees: [0, 13.333], deity: 'Ashwini Kumaras' },
            { number: 2, name: 'Bharani', lord: 'Venus', rashi: 'Mesha', degrees: [13.333, 26.666], deity: 'Yama' },
            { number: 3, name: 'Krittika', lord: 'Sun', rashi: 'Mesha/Vrishabha', degrees: [26.666, 40], deity: 'Agni' },
            { number: 4, name: 'Rohini', lord: 'Moon', rashi: 'Vrishabha', degrees: [40, 53.333], deity: 'Brahma' },
            { number: 5, name: 'Mrigashira', lord: 'Mars', rashi: 'Vrishabha/Mithuna', degrees: [53.333, 66.666], deity: 'Soma' },
            { number: 6, name: 'Ardra', lord: 'Rahu', rashi: 'Mithuna', degrees: [66.666, 80], deity: 'Rudra' },
            { number: 7, name: 'Punarvasu', lord: 'Jupiter', rashi: 'Mithuna/Karka', degrees: [80, 93.333], deity: 'Aditi' },
            { number: 8, name: 'Pushya', lord: 'Saturn', rashi: 'Karka', degrees: [93.333, 106.666], deity: 'Brihaspati' },
            { number: 9, name: 'Ashlesha', lord: 'Mercury', rashi: 'Karka', degrees: [106.666, 120], deity: 'Sarpa' },
            { number: 10, name: 'Magha', lord: 'Ketu', rashi: 'Simha', degrees: [120, 133.333], deity: 'Pitrs' },
            { number: 11, name: 'Purva Phalguni', lord: 'Venus', rashi: 'Simha', degrees: [133.333, 146.666], deity: 'Bhaga' },
            { number: 12, name: 'Uttara Phalguni', lord: 'Sun', rashi: 'Simha/Kanya', degrees: [146.666, 160], deity: 'Aryaman' },
            { number: 13, name: 'Hasta', lord: 'Moon', rashi: 'Kanya', degrees: [160, 173.333], deity: 'Savitar' },
            { number: 14, name: 'Chitra', lord: 'Mars', rashi: 'Kanya/Tula', degrees: [173.333, 186.666], deity: 'Vishvakarma' },
            { number: 15, name: 'Swati', lord: 'Rahu', rashi: 'Tula', degrees: [186.666, 200], deity: 'Vayu' },
            { number: 16, name: 'Vishakha', lord: 'Jupiter', rashi: 'Tula/Vrishchika', degrees: [200, 213.333], deity: 'Indra-Agni' },
            { number: 17, name: 'Anuradha', lord: 'Saturn', rashi: 'Vrishchika', degrees: [213.333, 226.666], deity: 'Mitra' },
            { number: 18, name: 'Jyeshtha', lord: 'Mercury', rashi: 'Vrishchika', degrees: [226.666, 240], deity: 'Indra' },
            { number: 19, name: 'Mula', lord: 'Ketu', rashi: 'Dhanu', degrees: [240, 253.333], deity: 'Nirriti' },
            { number: 20, name: 'Purva Ashadha', lord: 'Venus', rashi: 'Dhanu', degrees: [253.333, 266.666], deity: 'Apas' },
            { number: 21, name: 'Uttara Ashadha', lord: 'Sun', rashi: 'Dhanu/Makara', degrees: [266.666, 280], deity: 'Vishve Devah' },
            { number: 22, name: 'Shravana', lord: 'Moon', rashi: 'Makara', degrees: [280, 293.333], deity: 'Vishnu' },
            { number: 23, name: 'Dhanishta', lord: 'Mars', rashi: 'Makara/Kumbha', degrees: [293.333, 306.666], deity: 'Vasu' },
            { number: 24, name: 'Shatabhisha', lord: 'Rahu', rashi: 'Kumbha', degrees: [306.666, 320], deity: 'Varuna' },
            { number: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', rashi: 'Kumbha/Meena', degrees: [320, 333.333], deity: 'Aja Ekapada' },
            { number: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', rashi: 'Meena', degrees: [333.333, 346.666], deity: 'Ahir Budhnya' },
            { number: 27, name: 'Revati', lord: 'Mercury', rashi: 'Meena', degrees: [346.666, 360], deity: 'Pushan' }
        ];

        // Tamil names for planets and special points
        this.planetTamilNames = {
            'Sun': 'சூரியன்',
            'Moon': 'சந்திரன்',
            'Mars': 'செவ்வாய்',
            'Mercury': 'புதன்',
            'Jupiter': 'குரு',
            'Venus': 'சுக்கிரன்',
            'Saturn': 'சனி',
            'Rahu': 'ராகு',
            'Ketu': 'கேது',
            'Lagna': 'லக்னா',
            'Maandhi': 'மாண்டி',
            'Gulika': 'குளிகை'
        };

        // Tamil rashi data
        this.rashiTamilNames = [
            { number: 1, name: 'Mesha', tamil: 'மேஷம்', lord: 'Mars', lordTamil: 'செவ்வாய்', element: 'Fire', elementTamil: 'நெருப்பு', nature: 'Chara', natureTamil: 'சரம்' },
            { number: 2, name: 'Vrishabha', tamil: 'ரிஷபம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', element: 'Earth', elementTamil: 'பூமி', nature: 'Sthira', natureTamil: 'ஸ்திரம்' },
            { number: 3, name: 'Mithuna', tamil: 'மிதுனம்', lord: 'Mercury', lordTamil: 'புதன்', element: 'Air', elementTamil: 'காற்று', nature: 'Dwiswabhava', natureTamil: 'துவிஸ்வபாவம்' },
            { number: 4, name: 'Karka', tamil: 'கடகம்', lord: 'Moon', lordTamil: 'சந்திரன்', element: 'Water', elementTamil: 'நீர்', nature: 'Chara', natureTamil: 'சரம்' },
            { number: 5, name: 'Simha', tamil: 'சிம்மம்', lord: 'Sun', lordTamil: 'சூரியன்', element: 'Fire', elementTamil: 'நெருப்பு', nature: 'Sthira', natureTamil: 'ஸ்திரம்' },
            { number: 6, name: 'Kanya', tamil: 'கன்னி', lord: 'Mercury', lordTamil: 'புதன்', element: 'Earth', elementTamil: 'பூமி', nature: 'Dwiswabhava', natureTamil: 'துவிஸ்வபாவம்' },
            { number: 7, name: 'Tula', tamil: 'துலாம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', element: 'Air', elementTamil: 'காற்று', nature: 'Chara', natureTamil: 'சரம்' },
            { number: 8, name: 'Vrishchika', tamil: 'விருச்சிகம்', lord: 'Mars', lordTamil: 'செவ்வாய்', element: 'Water', elementTamil: 'நீர்', nature: 'Sthira', natureTamil: 'ஸ்திரம்' },
            { number: 9, name: 'Dhanu', tamil: 'தனுசு', lord: 'Jupiter', lordTamil: 'குரு', element: 'Fire', elementTamil: 'நெருப்பு', nature: 'Dwiswabhava', natureTamil: 'துவிஸ்வபாவம்' },
            { number: 10, name: 'Makara', tamil: 'மகரம்', lord: 'Saturn', lordTamil: 'சனி', element: 'Earth', elementTamil: 'பூமி', nature: 'Chara', natureTamil: 'சரம்' },
            { number: 11, name: 'Kumbha', tamil: 'கும்பம்', lord: 'Saturn', lordTamil: 'சனி', element: 'Air', elementTamil: 'காற்று', nature: 'Sthira', natureTamil: 'ஸ்திரம்' },
            { number: 12, name: 'Meena', tamil: 'மீனம்', lord: 'Jupiter', lordTamil: 'குரு', element: 'Water', elementTamil: 'நீர்', nature: 'Dwiswabhava', natureTamil: 'துவிஸ்வபாவம்' }
        ];

        // Tamil nakshatra data
        this.nakshatraTamilNames = [
            { number: 1, name: 'Ashwini', tamil: 'அஸ்வினி', lord: 'Ketu', lordTamil: 'கேது', start: 0, end: 13.20, rashi: 1 },
            { number: 2, name: 'Bharani', tamil: 'பரணி', lord: 'Venus', lordTamil: 'சுக்கிரன்', start: 13.20, end: 26.40, rashi: 1 },
            { number: 3, name: 'Krittika', tamil: 'கிருத்திகை', lord: 'Sun', lordTamil: 'சூரியன்', start: 26.40, end: 40.00, rashi: [1, 2] },
            { number: 4, name: 'Rohini', tamil: 'ரோகிணி', lord: 'Moon', lordTamil: 'சந்திரன்', start: 40.00, end: 53.20, rashi: 2 },
            { number: 5, name: 'Mrigashira', tamil: 'மிருகசீரிஷம்', lord: 'Mars', lordTamil: 'செவ்வாய்', start: 53.20, end: 66.40, rashi: [2, 3] },
            { number: 6, name: 'Ardra', tamil: 'திருவாதிரை', lord: 'Rahu', lordTamil: 'ராகு', start: 66.40, end: 80.00, rashi: 3 },
            { number: 7, name: 'Punarvasu', tamil: 'புனர்பூசம்', lord: 'Jupiter', lordTamil: 'குரு', start: 80.00, end: 93.20, rashi: [3, 4] },
            { number: 8, name: 'Pushya', tamil: 'பூசம்', lord: 'Saturn', lordTamil: 'சனி', start: 93.20, end: 106.40, rashi: 4 },
            { number: 9, name: 'Ashlesha', tamil: 'ஆயில்யம்', lord: 'Mercury', lordTamil: 'புதன்', start: 106.40, end: 120.00, rashi: 4 },
            { number: 10, name: 'Magha', tamil: 'மகம்', lord: 'Ketu', lordTamil: 'கேது', start: 120.00, end: 133.20, rashi: 5 },
            { number: 11, name: 'Purva Phalguni', tamil: 'பூரம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', start: 133.20, end: 146.40, rashi: 5 },
            { number: 12, name: 'Uttara Phalguni', tamil: 'உத்திரம்', lord: 'Sun', lordTamil: 'சூரியன்', start: 146.40, end: 160.00, rashi: [5, 6] },
            { number: 13, name: 'Hasta', tamil: 'ஹஸ்தம்', lord: 'Moon', lordTamil: 'சந்திரன்', start: 160.00, end: 173.20, rashi: 6 },
            { number: 14, name: 'Chitra', tamil: 'சித்திரை', lord: 'Mars', lordTamil: 'செவ்வாய்', start: 173.20, end: 186.40, rashi: [6, 7] },
            { number: 15, name: 'Swati', tamil: 'சுவாதி', lord: 'Rahu', lordTamil: 'ராகு', start: 186.40, end: 200.00, rashi: 7 },
            { number: 16, name: 'Vishakha', tamil: 'விசாகம்', lord: 'Jupiter', lordTamil: 'குரு', start: 200.00, end: 213.20, rashi: [7, 8] },
            { number: 17, name: 'Anuradha', tamil: 'அனுஷம்', lord: 'Saturn', lordTamil: 'சனி', start: 213.20, end: 226.40, rashi: 8 },
            { number: 18, name: 'Jyeshtha', tamil: 'கேட்டை', lord: 'Mercury', lordTamil: 'புதன்', start: 226.40, end: 240.00, rashi: 8 },
            { number: 19, name: 'Mula', tamil: 'மூலம்', lord: 'Ketu', lordTamil: 'கேது', start: 240.00, end: 253.20, rashi: 9 },
            { number: 20, name: 'Purva Ashadha', tamil: 'பூராடம்', lord: 'Venus', lordTamil: 'சுக்கிரன்', start: 253.20, end: 266.40, rashi: 9 },
            { number: 21, name: 'Uttara Ashadha', tamil: 'உத்திராடம்', lord: 'Sun', lordTamil: 'சூரியன்', start: 266.40, end: 280.00, rashi: [9, 10] },
            { number: 22, name: 'Shravana', tamil: 'திருவோணம்', lord: 'Moon', lordTamil: 'சந்திரன்', start: 280.00, end: 293.20, rashi: 10 },
            { number: 23, name: 'Dhanishta', tamil: 'அவிட்டம்', lord: 'Mars', lordTamil: 'செவ்வாய்', start: 293.20, end: 306.40, rashi: [10, 11] },
            { number: 24, name: 'Shatabhisha', tamil: 'சதயம்', lord: 'ரahu', lordTamil: 'ராகு', start: 306.40, end: 320.00, rashi: 11 },
            { number: 25, name: 'Purva Bhadrapada', tamil: 'பூரட்டாதி', lord: 'Jupiter', lordTamil: 'குரு', start: 320.00, end: 333.20, rashi: [11, 12] },
            { number: 26, name: 'Uttara Bhadrapada', tamil: 'உத்திரட்டாதி', lord: 'Saturn', lordTamil: 'சனி', start: 333.20, end: 346.40, rashi: 12 },
            { number: 27, name: 'Revati', tamil: 'ரேவதி', lord: 'Mercury', lordTamil: 'புதன்', start: 346.40, end: 360.00, rashi: 12 }
        ];

        // Moolatrikona signs
        this.moolatrikonas = {
            'Sun': { rashi: 'Simha', startDeg: 0, endDeg: 20 },
            'Moon': { rashi: 'Karka', startDeg: 4, endDeg: 30 },
            'Mars': { rashi: 'Mesha', startDeg: 0, endDeg: 12 },
            'Mercury': { rashi: 'Kanya', startDeg: 16, endDeg: 20 },
            'Jupiter': { rashi: 'Dhanu', startDeg: 0, endDeg: 10 },
            'Venus': { rashi: 'Tula', startDeg: 0, endDeg: 15 },
            'Saturn': { rashi: 'Kumbha', startDeg: 0, endDeg: 20 }
        };

        // Exact exaltation degrees
        this.exactExaltationDegrees = {
            'Sun': 10, // Aries 10°
            'Moon': 3, // Taurus 3°
            'Mars': 28, // Capricorn 28°
            'Mercury': 15, // Virgo 15°
            'Jupiter': 5, // Cancer 5°
            'Venus': 27, // Pisces 27°
            'Saturn': 20, // Libra 20°
            'Rahu': 20, // Taurus 20° (traditional value)
            'Ketu': 20  // Scorpio 20° (traditional value)
        };

        // Planetary friendships
        this.planetaryFriendships = {
            'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], neutrals: ['Mercury'], enemies: ['Venus', 'Saturn'] },
            'Moon': { friends: ['Sun', 'Mercury'], neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'], enemies: [] },
            'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], neutrals: ['Venus', 'Saturn'], enemies: ['Mercury'] },
            'Mercury': { friends: ['Sun', 'Venus'], neutrals: ['Mars', 'Jupiter', 'Saturn'], enemies: ['Moon'] },
            'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], neutrals: ['Saturn'], enemies: ['Mercury', 'Venus'] },
            'Venus': { friends: ['Mercury', 'Saturn'], neutrals: ['Mars', 'Jupiter'], enemies: ['Sun', 'Moon'] },
            'Saturn': { friends: ['Mercury', 'Venus'], neutrals: ['Jupiter'], enemies: ['Sun', 'Moon', 'Mars'] },
            'Rahu': { friends: ['Venus', 'Saturn'], neutrals: ['Mercury', 'Jupiter'], enemies: ['Sun', 'Moon', 'Mars'] },
            'Ketu': { friends: ['Mars', 'Jupiter'], neutrals: ['Venus', 'Saturn'], enemies: ['Sun', 'Moon', 'Mercury'] }
        };
    }



calculateAccurateMaandhi(datetime, latitude, longitude, calculateAscendant, opts = {}) {
  const { timeZone } = opts;

  // Helpers
  const normalizeDegrees = (deg) => ((deg % 360) + 360) % 360;

  // Get local Y-M-D components for a given instant in a given IANA time zone (no external libs).
  const getLocalYmd = (instant, tz) => {
    if (!tz) {
      // Fallback: assume system zone equals birthplace zone (may be wrong if not provided).
      return { y: instant.getFullYear(), m: instant.getMonth() + 1, d: instant.getDate() };
    }
    const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = dtf.formatToParts(instant).reduce((acc, p) => (p.type !== 'literal' && (acc[p.type] = p.value), acc), {});
    return { y: +parts.year, m: +parts.month, d: +parts.day };
  };

  const addDaysYmd = ({ y, m, d }, delta) => {
    const t = new Date(Date.UTC(y, m - 1, d + delta));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
    };

  // SunCalc expects a Date to anchor the calendar day. Use UTC noon of the target local date to avoid DST edges.
  const getSunTimesForLocalDate = ({ y, m, d }) => {
    const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // 12:00 UTC on that local date
    let { sunrise, sunset } = SunCalc.getTimes(anchor, latitude, longitude);

    // Fallback for polar day/night: approximate 06:00/18:00 UTC on that calendar date.
    if (!(sunrise instanceof Date) || isNaN(sunrise.getTime())) sunrise = new Date(Date.UTC(y, m - 1, d, 6, 0, 0));
    if (!(sunset instanceof Date) || isNaN(sunset.getTime())) sunset = new Date(Date.UTC(y, m - 1, d, 18, 0, 0));
    return { sunrise, sunset };
  };

  const weekdayOfLocalYmd = ({ y, m, d }) => {
    // Day-of-week for the local calendar date (0=Sunday..6=Saturday)
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  };

  // Segment indices (1..8) for Gulika/Mandi
  const daySegmentIndex = [7, 6, 5, 4, 3, 2, 1]; // Sunday..Saturday
  const nightShift = 4;
  const toNightIdx = (idx) => ((idx + nightShift - 1) % 8) + 1;

  // 1) Resolve local date for the birth instant
  const ymd0 = getLocalYmd(datetime, timeZone);

  // 2) Get sunrise/sunset for local date
  const { sunrise: sunrise0, sunset: sunset0 } = getSunTimesForLocalDate(ymd0);

  const isDayBirth = datetime >= sunrise0 && datetime < sunset0;

  let periodStart, periodEnd, segIndex, weekdayForMapping;

  if (isDayBirth) {
    // Daytime: use sunrise->sunset of ymd0, weekday = ymd0's weekday
    periodStart = sunrise0;
    periodEnd = sunset0;
    weekdayForMapping = weekdayOfLocalYmd(ymd0);
    segIndex = daySegmentIndex[weekdayForMapping];
  } else {
    // Nighttime: determine which night birth belongs to
    let ymdNightStart, nightStart, nightEnd;

    if (datetime >= sunset0) {
      // Night starting at today's sunset and ending at next day's sunrise
      ymdNightStart = ymd0;
      nightStart = sunset0;
      const ymdNext = addDaysYmd(ymd0, 1);
      nightEnd = getSunTimesForLocalDate(ymdNext).sunrise;
    } else {
      // Night starting at yesterday's sunset and ending at today's sunrise
      const ymdPrev = addDaysYmd(ymd0, -1);
      ymdNightStart = ymdPrev;
      nightStart = getSunTimesForLocalDate(ymdPrev).sunset;
      nightEnd = sunrise0;
    }

    periodStart = nightStart;
    periodEnd = nightEnd;
    weekdayForMapping = weekdayOfLocalYmd(ymdNightStart);
    segIndex = toNightIdx(daySegmentIndex[weekdayForMapping]);
  }

  // 3) Compute the Maandhi (Gulika) instant as the MIDPOINT of its segment
  const duration = periodEnd.getTime() - periodStart.getTime(); // ms
  const segment = duration / 8;
  const maandhiTime = new Date(periodStart.getTime() + (segIndex - 0.5) * segment);

  // 4) Ascendant at Maandhi time
  const maandhiLng = calculateAscendant(maandhiTime, latitude, longitude);
  return normalizeDegrees(maandhiLng);
}

// Main birth chart generation method
generateBirthChart(planetaryPositions, ascendant) {
    // Initialize houses object
    const houses = {};
    for (let i = 1; i <= 12; i++) {
        houses[i] = {
            planets: [],
            sign: '',
            signTamil: '',
            signNumber: 0,
            lord: '',
            lordTamil: '',
            element: '',
            elementTamil: '',
            nature: '',
            natureTamil: '',
            aspectingPlanets: [],
            degrees: 0
        };
    }

    const planetDetails = {};

    // Calculate house signs based on ascendant
    const ascendantDegree = ascendant % 30;
    const ascendantRashiNumber = Math.floor(ascendant / 30) + 1;

    // Set up houses with signs
    this.setupHouseSigns(houses, ascendantRashiNumber, ascendantDegree);

    // Place Lagna in first house
    houses[1].planets.push('Lagna');

    // Place planets in houses and calculate details
    this.placePlanetsInHouses(planetaryPositions, houses, planetDetails);

    return { houses, planets: planetDetails };
}

// Setup house signs based on ascendant
setupHouseSigns(houses, ascendantRashiNumber, ascendantDegree) {
    for (let houseNum = 1; houseNum <= 12; houseNum++) {
        const rashiNumber = ((ascendantRashiNumber + houseNum - 2) % 12) + 1;
        const rashiInfo = this.rashiTamilNames[rashiNumber - 1];

        houses[houseNum].sign = rashiInfo.name;
        houses[houseNum].signTamil = rashiInfo.tamil;
        houses[houseNum].signNumber = rashiInfo.number;
        houses[houseNum].lord = rashiInfo.lord;
        houses[houseNum].lordTamil = rashiInfo.lordTamil;
        houses[houseNum].element = rashiInfo.element;
        houses[houseNum].elementTamil = rashiInfo.elementTamil;
        houses[houseNum].nature = rashiInfo.nature;
        houses[houseNum].natureTamil = rashiInfo.natureTamil;

        if (houseNum === 1) {
            houses[houseNum].degrees = ascendantDegree;
        } else {
            houses[houseNum].degrees = 0;
        }
    }
}

// Place planets (and Maandhi/Gulika if provided) in houses and calculate their details
placePlanetsInHouses(planetaryPositions, houses, planetDetails) {
    for (const [planet, data] of Object.entries(planetaryPositions)) {
        const planetLongitude = ((data.longitude % 360) + 360) % 360;
        const planetRashiNumber = Math.floor(planetLongitude / 30) + 1;
        const planetDegree = planetLongitude % 30;

        // Find house for this planet
        let planetHouse = 1;
        for (let h = 1; h <= 12; h++) {
            if (houses[h].signNumber === planetRashiNumber) {
                planetHouse = h;
                break;
            }
        }

        // Add planet to house
        houses[planetHouse].planets.push(planet);

        // Calculate aspects for real grahas only (exclude Maandhi/Gulika and Lagna)
        if (this.isAspectingBody(planet)) {
            this.calculateAspects(planet, planetHouse, houses);
        }

        // Get nakshatra and rashi info
        const nakshatra = this.getNakshatraInfo(planetLongitude);
        const rashiInfo = this.rashiTamilNames[planetRashiNumber - 1];

        // Check if retrograde (not applicable for Maandhi/Gulika)
        const isRetrograde = this.isUpagraha(planet) ? false : (data.velocity && data.velocity < 0);

        // Calculate planet details
        planetDetails[planet] = this.calculatePlanetDetails(
            planet, planetLongitude, planetDegree, planetHouse,
            nakshatra, rashiInfo, isRetrograde
        );
    }
}

// Determine if a body casts aspects in this model
isAspectingBody(planet) {
    if (this.isUpagraha(planet)) return false; // Maandhi/Gulika do not aspect
    if (planet === 'Lagna') return false;
    // Keep existing behavior: all other planets/nodes aspect per calculateAspects
    return true;
}

// Identify upagraha (Maandhi/Gulika)
isUpagraha(planet) {
    return planet === 'Maandhi' || planet === 'Gulika';
}

// Calculate planetary aspects
calculateAspects(planet, planetHouse, houses) {
    // All planets aspect 7th house (per current model)
    const seventhHouse = (planetHouse + 6) % 12 || 12;
    houses[seventhHouse].aspectingPlanets.push(planet);

    // Special aspects
    if (planet === 'Jupiter') {
        const jupiterAspects = [(planetHouse + 4) % 12 || 12, (planetHouse + 8) % 12 || 12];
        jupiterAspects.forEach(house => houses[house].aspectingPlanets.push(planet));
    } else if (planet === 'Mars') {
        const marsAspects = [(planetHouse + 3) % 12 || 12, (planetHouse + 7) % 12 || 12];
        marsAspects.forEach(house => houses[house].aspectingPlanets.push(planet));
    } else if (planet === 'Saturn') {
        const saturnAspects = [(planetHouse + 2) % 12 || 12, (planetHouse + 9) % 12 || 12];
        saturnAspects.forEach(house => houses[house].aspectingPlanets.push(planet));
    }
}

// Get nakshatra information
getNakshatraInfo(longitude) {
    const nakshatra = this.nakshatraTamilNames.find(n =>
        longitude >= n.start && longitude < n.end
    );
    return nakshatra || this.nakshatraTamilNames[0];
}

// Calculate complete planet details
calculatePlanetDetails(planet, planetLongitude, planetDegree, planetHouse, nakshatra, rashiInfo, isRetrograde) {
    const isUpagraha = this.isUpagraha(planet);

    // Common fields
    const baseDetails = {
        englishName: planet,
        tamilName: this.planetTamilNames[planet] || planet,
        sign: rashiInfo.name,
        signTamil: rashiInfo.tamil,
        signNumber: rashiInfo.number,
        house: planetHouse,
        degree: planetDegree.toFixed(4),
        degreeFormatted: this.formatDegree(planetDegree),
        nakshatra: nakshatra.name,
        nakshatraTamil: nakshatra.tamil,
        nakshatraNumber: nakshatra.number,
        nakshatraLord: nakshatra.lord,
        nakshatraLordTamil: nakshatra.lordTamil,
        pada: this.calculatePada(planetLongitude, nakshatra),
        longitude: planetLongitude.toFixed(4),
        longitudeFormatted: this.formatDegree(planetLongitude),
        lord: rashiInfo.lord,
        lordTamil: rashiInfo.lordTamil,
        element: rashiInfo.element,
        elementTamil: rashiInfo.elementTamil,
        nature: rashiInfo.nature,
        natureTamil: rashiInfo.natureTamil
    };

    if (isUpagraha) {
        // Special handling for Maandhi/Gulika (Upagraha)
        return {
            ...baseDetails,
            isRetrograde: false,
            isExalted: false,
            isDebilitated: false,
            isOwnSign: false,
            isMoolatrikona: false,
            isFriendlySign: false,
            isEnemySign: false,
            isNeutralSign: true,
            dignity: { english: 'Upagraha', tamil: 'உபகிரகம்' },
            shadbala: null,
            aspects: [],
            aspectingHouses: [],
            category: 'Upagraha',
            upagrahaLord: 'Saturn',
            upagrahaLordTamil: this.planetTamilNames['Saturn']
        };
    }

    // Regular grahas
    return {
        ...baseDetails,
        isRetrograde: isRetrograde,
        isExalted: this.checkExaltation(planet, rashiInfo.name),
        isDebilitated: this.checkDebilitation(planet, rashiInfo.name),
        isOwnSign: this.checkOwnSign(planet, rashiInfo.name),
        isMoolatrikona: this.checkMoolatrikona(planet, rashiInfo.name, planetDegree),
        isFriendlySign: this.checkFriendlySign(planet, rashiInfo.lord),
        isEnemySign: this.checkEnemySign(planet, rashiInfo.lord),
        isNeutralSign: this.checkNeutralSign(planet, rashiInfo.lord),
        dignity: this.getPlanetaryDignity(planet, rashiInfo.name, planetDegree),
        shadbala: this.calculateBasicShadbala(planet, planetLongitude, rashiInfo, isRetrograde),
        aspects: this.getPlanetaryAspects(planet, planetHouse),
        aspectingHouses: this.getAspectingHouses(planet, planetHouse)
    };
}

// Helper methods
formatDegree(degree) {
    const deg = Math.floor(degree);
    const minFloat = (degree - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = Math.floor((minFloat - min) * 60);
    return `${deg}°${min}'${sec}"`;
}

calculatePada(longitude, nakshatra) {
    const nakshatraSpan = nakshatra.end - nakshatra.start;
    const positionInNakshatra = longitude - nakshatra.start;
    const padaSize = nakshatraSpan / 4;
    return Math.floor(positionInNakshatra / padaSize) + 1;
}

checkExaltation(planet, sign) {
    const exaltations = {
        'Sun': 'Mesha', 'Moon': 'Vrishabha', 'Mars': 'Makara',
        'Mercury': 'Kanya', 'Jupiter': 'Karka', 'Venus': 'Meena', 'Saturn': 'Tula'
    };
    return exaltations[planet] === sign;
}

checkDebilitation(planet, sign) {
    const debilitations = {
        'Sun': 'Tula', 'Moon': 'Vrishchika', 'Mars': 'Karka',
        'Mercury': 'Meena', 'Jupiter': 'Makara', 'Venus': 'Kanya', 'Saturn': 'Mesha'
    };
    return debilitations[planet] === sign;
}

checkOwnSign(planet, sign) {
    const ownSigns = {
        'Sun': ['Simha'], 'Moon': ['Karka'], 'Mars': ['Mesha', 'Vrishchika'],
        'Mercury': ['Mithuna', 'Kanya'], 'Jupiter': ['Dhanu', 'Meena'],
        'Venus': ['Vrishabha', 'Tula'], 'Saturn': ['Makara', 'Kumbha']
    };
    return ownSigns[planet]?.includes(sign) || false;
}

checkMoolatrikona(planet, sign, degree) {
    const mool = this.moolatrikonas[planet];
    if (!mool || mool.rashi !== sign) return false;
    return degree >= mool.startDeg && degree <= mool.endDeg;
}

checkFriendlySign(planet, signLord) {
    return this.planetaryFriendships[planet]?.friends.includes(signLord) || false;
}

checkEnemySign(planet, signLord) {
    return this.planetaryFriendships[planet]?.enemies.includes(signLord) || false;
}

checkNeutralSign(planet, signLord) {
    const friends = this.planetaryFriendships[planet];
    if (!friends) return true;
    return !friends.friends.includes(signLord) && !friends.enemies.includes(signLord);
}

getPlanetaryDignity(planet, sign, degree) {
    if (this.checkExaltation(planet, sign)) {
        return { english: 'Exalted', tamil: 'உச்சம்' };
    }
    if (this.checkDebilitation(planet, sign)) {
        return { english: 'Debilitated', tamil: 'நீசம்' };
    }
    if (this.checkOwnSign(planet, sign)) {
        return { english: 'Own Sign', tamil: 'சொந்த ராசி' };
    }
    if (this.checkMoolatrikona(planet, sign, degree)) {
        return { english: 'Moolatrikona', tamil: 'மூலத்திரிகோணம்' };
    }
    return { english: 'Normal', tamil: 'சாதாரணம்' };
}

calculateBasicShadbala(planet, longitude, rashiInfo, isRetrograde) {
    let strength = 50; // Base strength

    if (this.checkExaltation(planet, rashiInfo.name)) strength += 50;
    if (this.checkDebilitation(planet, rashiInfo.name)) strength -= 80;
    if (this.checkOwnSign(planet, rashiInfo.name)) strength += 30;
    if (isRetrograde && planet !== 'Sun' && planet !== 'Moon') strength += 20;

    const percentage = Math.max(0, Math.min(100, strength));
    const scale5 = Math.ceil(percentage / 20);

    return {
        total: strength,
        percentage: percentage,
        scale5: scale5
    };
}

getPlanetaryAspects(planet, planetHouse) {
    // No aspects for Maandhi/Gulika
    if (this.isUpagraha(planet)) return [];

    const aspects = [{ house: (planetHouse + 6) % 12 || 12, strength: 1.0 }];

    if (planet === 'Jupiter') {
        aspects.push(
            { house: (planetHouse + 4) % 12 || 12, strength: 0.75 },
            { house: (planetHouse + 8) % 12 || 12, strength: 0.75 }
        );
    } else if (planet === 'Mars') {
        aspects.push(
            { house: (planetHouse + 3) % 12 || 12, strength: 0.75 },
            { house: (planetHouse + 7) % 12 || 12, strength: 0.75 }
        );
    } else if (planet === 'Saturn') {
        aspects.push(
            { house: (planetHouse + 2) % 12 || 12, strength: 0.75 },
            { house: (planetHouse + 9) % 12 || 12, strength: 0.75 }
        );
    }

    return aspects;
}

getAspectingHouses(planet, planetHouse) {
    // No aspects for Maandhi/Gulika
    if (this.isUpagraha(planet)) return [];

    const aspects = [(planetHouse + 6) % 12 || 12];

    if (planet === 'Jupiter') {
        aspects.push((planetHouse + 4) % 12 || 12, (planetHouse + 8) % 12 || 12);
    } else if (planet === 'Mars') {
        aspects.push((planetHouse + 3) % 12 || 12, (planetHouse + 7) % 12 || 12);
    } else if (planet === 'Saturn') {
        aspects.push((planetHouse + 2) % 12 || 12, (planetHouse + 9) % 12 || 12);
    }

    return aspects;
}

// OPTIONAL: Utility to add Maandhi/Gulika to planetaryPositions when longitude is known
// Usage:
//   addMaandhiToPositions(positions, 123.456)  // degrees 0-360 (sidereal)
//   addMaandhiToPositions(positions, { name: 'Gulika', longitude: 123.456 })
addMaandhiToPositions(planetaryPositions, maandhi) {
    let name = 'Maandhi';
    let longitude = null;

    if (typeof maandhi === 'number') {
        longitude = maandhi;
    } else if (maandhi && typeof maandhi === 'object') {
        name = maandhi.name === 'Gulika' ? 'Gulika' : 'Maandhi';
        longitude = maandhi.longitude;
    }

    if (typeof longitude === 'number' && isFinite(longitude)) {
        planetaryPositions[name] = { longitude: ((longitude % 360) + 360) % 360 };
    }

    return planetaryPositions;
}
}

module.exports = { BirthChartGenerator };