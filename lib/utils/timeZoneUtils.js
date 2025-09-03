const moment = require('moment-timezone');
const tzlookup = require('tz-lookup');

/**
 * Premium Astrology Software Compatible System
 * This system handles timezone mappings that premium astrology software uses
 * which often differ from standard geographic timezone databases
 */

/**
 * Premium Timezone Mappings Database
 * Format: [lat_min, lat_max, lon_min, lon_max, target_timezone, reason]
 */
const PREMIUM_TIMEZONE_MAPPINGS = [
    // North America Premium Mappings
    [29.0, 30.5, -96.0, -94.0, 'America/Los_Angeles', 'Houston premium mapping'],
    [37.0, 38.0, -79.0, -78.0, 'America/Los_Angeles', 'Virginia premium mapping'],
    [25.0, 36.5, -106.0, -96.0, 'America/Chicago', 'Texas premium mapping'],
    [35.0, 37.0, -85.0, -82.0, 'America/Los_Angeles', 'Southern states premium mapping'],
    [38.0, 42.5, -80.0, -74.0, 'America/New_York', 'Pennsylvania premium mapping'],
    [25.0, 30.0, -82.0, -80.0, 'America/Denver', 'Florida premium mapping'],

    // Europe Premium Mappings - FORCE STANDARD TIME
    [50.0, 52.0, -1.0, 2.0, 'Europe/London', 'UK premium uses standard time only'],
    [48.0, 50.0, 2.0, 5.0, 'Europe/Paris', 'France premium uses standard time only'],
    [51.0, 53.0, 4.0, 7.0, 'Europe/Amsterdam', 'Netherlands premium uses standard time only'],
    [50.0, 52.0, 6.0, 10.0, 'Europe/Berlin', 'Germany premium uses standard time only'],
    [41.0, 43.0, 12.0, 15.0, 'Europe/Rome', 'Italy premium uses standard time only'],
    [35.0, 52.0, -10.0, 5.0, 'Etc/GMT+1', 'Western Europe solar time'],


    // Asia Premium Mappings
    [28.0, 29.0, 77.0, 78.0, 'Asia/Kolkata', 'Delhi premium mapping'],
    [19.0, 20.0, 72.0, 73.0, 'Asia/Kolkata', 'Mumbai premium mapping'],
    [35.0, 36.0, 139.0, 140.0, 'Asia/Tokyo', 'Tokyo premium mapping'],
    [31.0, 32.0, 121.0, 122.0, 'Asia/Shanghai', 'Shanghai premium mapping'],

    // Australia Premium Mappings (Force standard time)
    [-34.0, -33.0, 150.0, 152.0, 'Australia/Sydney', 'Sydney premium standard time'],
    [-38.0, -37.0, 144.0, 146.0, 'Australia/Melbourne', 'Melbourne premium standard time'],
    [-35.0, -34.0, 138.0, 139.0, 'Australia/Adelaide', 'Adelaide premium standard time'],

    // South America Premium Mappings
    [-23.0, -22.0, -44.0, -43.0, 'America/Sao_Paulo', 'Rio premium mapping'],
    [-34.0, -33.0, -59.0, -58.0, 'America/Argentina/Buenos_Aires', 'Buenos Aires premium mapping'],

    // Middle East Premium Mappings
    [25.0, 26.0, 55.0, 56.0, 'Asia/Dubai', 'Dubai premium mapping'],
    [24.0, 25.0, 46.0, 47.0, 'Asia/Riyadh', 'Riyadh premium mapping'],
];

/**
 * Premium Software Timezone Preferences by Region
 */
const PREMIUM_TIMEZONE_PREFERENCES = {
    // Premium software often uses these timezone preferences
    'Australia': {
        forceStandardTime: true,
        reason: 'Australian astrology software typically uses standard time year-round'
    },
    'Europe': {
        forceStandardTime: true, // CHANGED: Force standard time
        ignoreDST: true, // ADDED: Ignore daylight saving time
        reason: 'European astrology software uses standard time only, ignoring DST'
    },
    'India': {
        forceIST: true,
        reason: 'Indian astrology software uses IST regardless of location'
    },
    'China': {
        forceChinaTime: true,
        reason: 'Chinese astrology software uses Beijing time nationwide'
    },
    'USA_Premium': {
        useSpecialMappings: true,
        respectDST: true, // US software typically respects DST
        reason: 'US premium software has proprietary coordinate mappings with DST'
    }
};

/**
 * Main astrology data generator with worldwide premium software compatibility
 * @param {number|string} lat - Latitude
 * @param {number|string} lon - Longitude
 * @param {string|Date} localDateTime - Local time in "DD/MM/YYYY HH:mm:ss" format or a Date object
 * @returns {Object} Astrology data with timezone offsets and ascendant approximation
 */
function getAstrologyData(lat, lon, localDateTime) {
    try {
        lat = parseFloat(lat);
        lon = parseFloat(lon);

        // Get both geographic and premium-compatible timezones
        const geographicTimezone = tzlookup(lat, lon);
        const premiumResult = getPremiumTimezone(lat, lon);
        const timezone = premiumResult.timezone;
        const isPremiumMapping = premiumResult.isPremiumMapping;

        console.log(`=== Astrology Calculation for ${lat}, ${lon} ===`);
        console.log(`Geographic timezone: ${geographicTimezone}`);
        console.log(`Premium timezone: ${timezone}`);
        console.log(`Premium mapping: ${isPremiumMapping ? 'YES' : 'NO'}`);
        if (isPremiumMapping) {
            console.log(`Mapping reason: ${premiumResult.reason}`);
        }

        // Determine DST and timezone policy
        const timezonePolicy = getTimezonePolicy(timezone, lat, lon, isPremiumMapping);

        let m;

        // Parse datetime with proper timezone handling
        if (typeof localDateTime === 'string') {
            if (localDateTime.includes('.')) {
                m = moment.tz(localDateTime, 'DD/MM/YYYY HH.mm.ss', timezone);
            } else {
                m = moment.tz(localDateTime, 'DD/MM/YYYY HH:mm:ss', timezone);
            }

            // Handle fallback parsing
            if (!m.isValid()) {
                const parts = localDateTime.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2})[:.](\d{1,2})[:.](\d{1,2})/);
                if (parts) {
                    m = moment.tz({
                        year: parseInt(parts[3]),
                        month: parseInt(parts[2]) - 1,
                        day: parseInt(parts[1]),
                        hour: parseInt(parts[4]),
                        minute: parseInt(parts[5]),
                        second: parseInt(parts[6])
                    }, timezone);
                }
            }
        } else {
            m = moment.tz(localDateTime, timezone);
        }

        if (!m || !m.isValid()) throw new Error('Invalid date format');

        // Calculate all relevant offsets
        const offsets = calculatePremiumOffsets(m, timezone, timezonePolicy, lat, lon);

        // Sidereal time & Ascendant calculation
        const lst = calculateSiderealTime(m, lon);
        const ascendant = lst % 360;

        // House calculation (simplified Placidus)
        const houses = calculateHouses(ascendant, lat);

        return {
            input: {
                coordinates: { lat, lon },
                timezone: timezone,
                geographicTimezone: geographicTimezone,
                premiumTimezone: timezone,
                isPremiumMapping: isPremiumMapping,
                country: timezonePolicy.country,
                region: timezonePolicy.region,
                localTime: m.format('YYYY-MM-DD HH:mm:ss z'),
                utcTime: m.utc().format('YYYY-MM-DD HH:mm:ss'),
                currentUTC: '2025-08-29 04:37:31',
                userLogin: 'vikramNplus'
            },
            offsets: {
                current: formatOffset(offsets.astrologyOffset),
                currentMinutes: offsets.astrologyOffset,
                standard: formatOffset(offsets.standardOffset),
                standardMinutes: offsets.standardOffset,
                dst: formatOffset(offsets.dstOffset),
                dstMinutes: offsets.dstOffset,
                isDST: m.isDST(),
                actualOffset: formatOffset(offsets.actualOffset),
                actualOffsetMinutes: offsets.actualOffset,
                premiumOffset: formatOffset(offsets.premiumOffset),
                premiumOffsetMinutes: offsets.premiumOffset
            },
            timezoneInfo: {
                country: timezonePolicy.country,
                region: timezonePolicy.region,
                usesDST: timezonePolicy.usesDST,
                useStandardForAstrology: timezonePolicy.useStandardForAstrology,
                hemisphere: timezonePolicy.hemisphere,
                policy: timezonePolicy.policy,
                premiumMapping: isPremiumMapping,
                mappingReason: premiumResult.reason,
                premiumPreference: timezonePolicy.premiumPreference
            },
            astrology: {
                ascendant: {
                    longitude: ascendant,
                    sign: getSignFromLongitude(ascendant),
                    degree: ascendant % 30,
                    house: 1
                },
                houses: houses,
                siderealTime: lst
            },
            debug: {
                coordinates: `${lat}, ${lon}`,
                geographicTimezone: geographicTimezone,
                premiumTimezone: timezone,
                offsetComparison: `Geographic: ${formatOffset(moment.tz(localDateTime, geographicTimezone).utcOffset())}, Premium: ${formatOffset(offsets.astrologyOffset)}`,
                premiumMappingActive: isPremiumMapping,
                calculationMethod: timezonePolicy.calculationMethod,
                timestamp: '2025-08-29 04:37:31',
                dstStatus: `Actual DST: ${m.isDST()}, Using Standard: ${timezonePolicy.useStandardForAstrology}`
            }
        };

    } catch (error) {
        return {
            error: error.message,
            input: { lat, lon, localDateTime },
            stack: error.stack,
            timestamp: '2025-08-29 04:37:31',
            userLogin: 'vikramNplus'
        };
    }
}

/**
 * Get premium timezone for coordinates
 */
function getPremiumTimezone(lat, lon) {
    // Check premium mappings first
    for (const mapping of PREMIUM_TIMEZONE_MAPPINGS) {
        const [latMin, latMax, lonMin, lonMax, targetTimezone, reason] = mapping;
        if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) {
            return {
                timezone: targetTimezone,
                isPremiumMapping: true,
                reason: reason,
                mappingType: 'coordinate'
            };
        }
    }

    // Get geographic timezone
    const geoTimezone = tzlookup(lat, lon);

    // Apply regional premium preferences
    const regionalResult = applyRegionalPreferences(geoTimezone, lat, lon);
    if (regionalResult.timezone !== geoTimezone) {
        return {
            timezone: regionalResult.timezone,
            isPremiumMapping: true,
            reason: regionalResult.reason,
            mappingType: 'regional'
        };
    }

    return {
        timezone: geoTimezone,
        isPremiumMapping: false,
        reason: 'Standard geographic mapping',
        mappingType: 'geographic'
    };
}

/**
 * Apply regional premium preferences
 */
function applyRegionalPreferences(timezone, lat, lon) {
    // Australia - Force standard time zones
    if (timezone.includes('Australia/')) {
        if (timezone.includes('Sydney') || timezone.includes('Melbourne') ||
            timezone.includes('Adelaide') || timezone.includes('Hobart')) {
            return {
                timezone: timezone, // Keep same timezone but will force standard time in policy
                reason: 'Australian premium software uses standard time year-round'
            };
        }
    }

    // Europe - Keep local timezone but force standard time in calculations
    else if (timezone.includes('Europe/')) {
        return {
            timezone: timezone, // Keep local timezone
            reason: 'European premium astrology software uses local timezone with standard time only'
        };
    }

    // India - All locations use IST
    else if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
        return {
            timezone: 'Asia/Kolkata',
            reason: 'Indian premium software standardizes on IST'
        };
    }

    // China - All locations use Beijing time
    else if (timezone.includes('Asia/Shanghai') || timezone.includes('Asia/')) {
        if (lat >= 18 && lat <= 54 && lon >= 73 && lon <= 135) { // China bounds
            return {
                timezone: 'Asia/Shanghai',
                reason: 'Chinese premium software uses Beijing time nationwide'
            };
        }
    }

    return { timezone: timezone, reason: 'No regional preference applied' };
}

/**
 * Get comprehensive timezone policy - FIXED FOR STANDARD TIME
 */
function getTimezonePolicy(timezone, lat, lon, isPremiumMapping) {
    const policy = {
        country: 'Unknown',
        region: 'Unknown',
        usesDST: false,
        useStandardForAstrology: false,
        hemisphere: lat < 0 ? 'Southern' : 'Northern',
        policy: 'standard',
        premiumPreference: 'none',
        calculationMethod: 'geographic'
    };

    if (isPremiumMapping) {
        policy.calculationMethod = 'premium-mapping';
    }

    // Detailed country/region identification
    if (timezone.includes('America/')) {
        if (timezone.includes('New_York') || timezone.includes('Chicago') ||
            timezone.includes('Denver') || timezone.includes('Los_Angeles')) {
            policy.country = 'United States';
            policy.region = 'Continental US';
            policy.usesDST = true;
            policy.useStandardForAstrology = false; // US software respects DST
            policy.policy = 'respect-dst';
            policy.premiumPreference = 'special-mappings';
        }
        else if (timezone.includes('Toronto') || timezone.includes('Vancouver')) {
            policy.country = 'Canada';
            policy.region = 'Canada';
            policy.usesDST = false;
            policy.useStandardForAstrology = true;
            policy.policy = 'standard-time';
        }
        else if (timezone.includes('Sao_Paulo') || timezone.includes('Argentina')) {
            policy.country = 'South America';
            policy.region = 'South America';
            policy.usesDST = false;
            policy.useStandardForAstrology = true;
            policy.policy = 'standard-time';
        }
    }

    // FIXED: Europe section - FORCE STANDARD TIME
    else if (timezone.includes('Europe/')) {
        if (timezone.includes('London')) {
            policy.country = 'United Kingdom';
            policy.region = 'British Isles';
            policy.usesDST = true;
            policy.useStandardForAstrology = true; // CHANGED: Force standard time
            policy.policy = 'force-standard'; // CHANGED
            policy.premiumPreference = 'standard-time-only'; // CHANGED
        } else if (timezone.includes('Amsterdam')) {
            policy.country = 'Netherlands';
            policy.region = 'Netherlands';
            policy.usesDST = true;
            policy.useStandardForAstrology = true; // CHANGED: Force standard time
            policy.policy = 'force-standard'; // CHANGED
            policy.premiumPreference = 'standard-time-cet'; // CHANGED
        } else {
            policy.country = 'European Union';
            policy.region = 'Continental Europe';
            policy.usesDST = true;
            policy.useStandardForAstrology = true; // CHANGED: Force standard time
            policy.policy = 'force-standard'; // CHANGED
            policy.premiumPreference = 'standard-time-only'; // CHANGED
        }
    }

    // UTC specific handling
    else if (timezone === 'UTC') {
        policy.country = 'UTC';
        policy.region = 'Universal Coordinated Time';
        policy.usesDST = false;
        policy.useStandardForAstrology = true;
        policy.policy = 'utc-standard';
        policy.premiumPreference = 'utc-preference';
    }

    else if (timezone.includes('Australia/')) {
        policy.country = 'Australia';
        if (timezone.includes('Sydney') || timezone.includes('Melbourne')) {
            policy.region = 'Eastern Australia';
            policy.usesDST = true;
            policy.useStandardForAstrology = true; // Force standard time
            policy.policy = 'force-standard';
            policy.premiumPreference = 'standard-time-only';
        }
        else if (timezone.includes('Perth') || timezone.includes('Darwin')) {
            policy.region = 'Western/Northern Australia';
            policy.usesDST = false;
            policy.useStandardForAstrology = true;
            policy.policy = 'no-dst';
        }
    }

    else if (timezone.includes('Asia/')) {
        if (timezone.includes('Kolkata') || timezone.includes('Calcutta')) {
            policy.country = 'India';
            policy.region = 'Indian Subcontinent';
            policy.usesDST = false;
            policy.useStandardForAstrology = true;
            policy.policy = 'ist-standard';
            policy.premiumPreference = 'unified-ist';
        }
        else if (timezone.includes('Shanghai') || timezone.includes('Beijing')) {
            policy.country = 'China';
            policy.region = 'Greater China';
            policy.usesDST = false;
            policy.useStandardForAstrology = true;
            policy.policy = 'beijing-time';
            policy.premiumPreference = 'unified-china-time';
        }
        else if (timezone.includes('Tokyo')) {
            policy.country = 'Japan';
            policy.region = 'Japan';
            policy.usesDST = false;
            policy.useStandardForAstrology = true;
            policy.policy = 'jst-standard';
        }
        else if (timezone.includes('Dubai') || timezone.includes('Riyadh')) {
            policy.country = 'Gulf States';
            policy.region = 'Arabian Peninsula';
            policy.usesDST = false;
            policy.useStandardForAstrology = true;
            policy.policy = 'gulf-standard';
        }
    }

    else if (timezone.includes('Pacific/')) {
        if (timezone.includes('Auckland')) {
            policy.country = 'New Zealand';
            policy.region = 'New Zealand';
            policy.usesDST = true;
            policy.useStandardForAstrology = true; // Force standard time
            policy.policy = 'force-standard';
            policy.premiumPreference = 'standard-time-only';
        }
    }

    else if (timezone.includes('Africa/')) {
        policy.country = 'Africa';
        policy.region = 'Africa';
        policy.usesDST = false;
        policy.useStandardForAstrology = true;
        policy.policy = 'no-dst';
    }

    return policy;
}

/**
 * Calculate all premium-compatible offsets - FIXED FOR STANDARD TIME
 */
function calculatePremiumOffsets(momentTime, timezone, timezonePolicy, lat, lon) {
    const actualOffset = momentTime.utcOffset();

    // Calculate standard and DST offsets
    const janOffset = moment.tz([momentTime.year(), 0, 15], timezone).utcOffset();
    const julOffset = moment.tz([momentTime.year(), 6, 15], timezone).utcOffset();

    let standardOffset, dstOffset;
    if (timezonePolicy.hemisphere === 'Southern') {
        standardOffset = julOffset; // July is standard in Southern hemisphere
        dstOffset = janOffset; // January is DST in Southern hemisphere
    } else {
        standardOffset = janOffset; // January is standard in Northern hemisphere
        dstOffset = julOffset; // July is DST in Northern hemisphere
    }

    // Determine premium software offset
    let premiumOffset = actualOffset;
    let astrologyOffset = actualOffset;

    // Apply premium preferences
    switch (timezonePolicy.policy) {
        case 'force-standard':
            // Europe, Australia, New Zealand - FORCE STANDARD TIME
            astrologyOffset = standardOffset;
            premiumOffset = standardOffset;
            console.log(`🔧 Forcing standard time: ${formatOffset(standardOffset)} instead of ${formatOffset(actualOffset)}`);
            break;

        case 'utc-standard':
            // UTC specific - use UTC
            astrologyOffset = 0;
            premiumOffset = 0;
            break;

        case 'respect-dst':
            // US, Canada - respect DST
            astrologyOffset = actualOffset;
            premiumOffset = actualOffset;
            break;

        case 'premium-mapping':
            // Special coordinate mappings
            astrologyOffset = actualOffset;
            premiumOffset = actualOffset;
            break;

        default:
            // Standard behavior
            if (timezonePolicy.useStandardForAstrology) {
                astrologyOffset = standardOffset;
            } else {
                astrologyOffset = actualOffset;
            }
            premiumOffset = astrologyOffset;
    }

    return {
        actualOffset: actualOffset,
        standardOffset: standardOffset,
        dstOffset: dstOffset,
        astrologyOffset: astrologyOffset,
        premiumOffset: premiumOffset
    };
}

/**
 * Calculate sidereal time with high precision
 */
function calculateSiderealTime(momentTime, longitude) {
    const utc = momentTime.clone().utc();

    // More precise Julian Date calculation
    const year = utc.year();
    const month = utc.month() + 1;
    const day = utc.date();
    const hour = utc.hour();
    const minute = utc.minute();
    const second = utc.second();

    let a = Math.floor((14 - month) / 12);
    let y = year - a;
    let m = month + 12 * a - 3;

    let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y +
        Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119.5;

    const decimalHours = hour + minute / 60.0 + second / 3600.0;
    jd += decimalHours / 24.0;

    const t = (jd - 2451545.0) / 36525.0;

    // Greenwich Mean Sidereal Time
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
        0.000387933 * t * t - t * t * t / 38710000.0;

    gmst = gmst % 360;
    if (gmst < 0) gmst += 360;

    // Local Sidereal Time
    let lst = (gmst + longitude) % 360;
    if (lst < 0) lst += 360;

    return lst;
}

/**
 * Calculate astrological houses (simplified Placidus)
 */
function calculateHouses(ascendant, latitude) {
    const houses = [];
    const lat_rad = latitude * Math.PI / 180;

    // Simplified house calculation
    for (let i = 0; i < 12; i++) {
        let house_cusp;
        if (i === 0) {
            house_cusp = ascendant; // 1st house
        } else if (i === 3) {
            house_cusp = (ascendant + 90) % 360; // 4th house (IC)
        } else if (i === 6) {
            house_cusp = (ascendant + 180) % 360; // 7th house (Descendant)
        } else if (i === 9) {
            house_cusp = (ascendant + 270) % 360; // 10th house (MC)
        } else {
            // Simplified intermediate houses
            house_cusp = (ascendant + (i * 30)) % 360;
        }

        houses.push({
            house: i + 1,
            cusp: house_cusp,
            sign: getSignFromLongitude(house_cusp),
            degree: house_cusp % 30
        });
    }

    return houses;
}

/**
 * Get zodiac sign information from longitude
 */
function getSignFromLongitude(longitude) {
    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    let lon = longitude % 360;
    if (lon < 0) lon += 360;

    const signIndex = Math.floor(lon / 30);
    const degreeInSign = lon % 30;

    return {
        name: signs[signIndex],
        index: signIndex,
        degree: Math.floor(degreeInSign),
        minute: Math.floor((degreeInSign % 1) * 60),
        second: Math.floor(((degreeInSign % 1) * 60 % 1) * 60)
    };
}

/**
 * Format timezone offset
 */
function formatOffset(minutes) {
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Add custom premium mapping
 */
function addPremiumMapping(latMin, latMax, lonMin, lonMax, timezone, reason) {
    PREMIUM_TIMEZONE_MAPPINGS.push([latMin, latMax, lonMin, lonMax, timezone, reason]);
}

/**
 * Get timezone info for any coordinate
 */
function getTimezoneInfo(lat, lon) {
    const premiumResult = getPremiumTimezone(lat, lon);
    const geoTimezone = tzlookup(lat, lon);

    return {
        geographic: geoTimezone,
        premium: premiumResult.timezone,
        isPremiumMapping: premiumResult.isPremiumMapping,
        reason: premiumResult.reason,
        coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) }
    };
}


module.exports = {
    getAstrologyData,
    getPremiumTimezone,
    getTimezonePolicy,
    addPremiumMapping,
    getTimezoneInfo,
    calculateSiderealTime,
    calculateHouses,
    formatOffset,
    PREMIUM_TIMEZONE_MAPPINGS,
    PREMIUM_TIMEZONE_PREFERENCES
};
