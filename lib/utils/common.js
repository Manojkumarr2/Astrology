const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const moment = require('moment-timezone');
const Astronomy = require('astronomy-engine');

const RASHIS = [
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

const NAKSHATRAS = [
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


function validateInput(data) {
    const errors = [];

    if (!data.day || data.day < 1 || data.day > 31) {
        errors.push('Invalid day. Must be between 1 and 31');
    }

    if (!data.month || data.month < 1 || data.month > 12) {
        errors.push('Invalid month. Must be between 1 and 12');
    }

    if (!data.year || data.year < 1900 || data.year > 2100) {
        errors.push('Invalid year. Must be between 1900 and 2100');
    }

    if (data.hour < 0 || data.hour > 23) {
        errors.push('Invalid hour. Must be between 0 and 23');
    }

    if (data.minute < 0 || data.minute > 59) {
        errors.push('Invalid minute. Must be between 0 and 59');
    }

    if (!data.latitude || data.latitude < -90 || data.latitude > 90) {
        errors.push('Invalid latitude. Must be between -90 and 90');
    }

    if (!data.longitude || data.longitude < -180 || data.longitude > 180) {
        errors.push('Invalid longitude. Must be between -180 and 180');
    }

    return errors;
}

function createDate(year, month, day, hour, minute, timezone) {
    // Create date in the specified timezone
    const date = moment.tz(`${year}-${month}-${day} ${hour}:${minute}`, 'YYYY-M-D H:m', 'UTC');
    date.subtract(timezone, 'hours');
    return date.toDate();
}

function getLahiriAyanamsa(date) {
    // Lahiri Ayanamsa calculation (simplified)
    const year = date.getFullYear();
    const baseYear = 1900;
    const baseAyanamsa = 22.46; // Ayanamsa in 1900
    const annualPrecession = 0.000139; // degrees per year

    const yearsDiff = year - baseYear;
    const ayanamsa = baseAyanamsa + (yearsDiff * 50.26 / 3600); // More accurate calculation

    return ayanamsa;
}


function getPlanetaryPositions(birthDate, latitude, longitude) {
    const positions = {};

    try {
        // Calculate regular planets using astronomy-engine
        const observer = new Astronomy.Observer(latitude, longitude, 0);
        const time = new Astronomy.AstroTime(birthDate);

        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

        for (const planet of planets) {
            try {
                const body = Astronomy.GeoVector(planet, time, false);
                const longitude = Astronomy.EclipticLongitude(body);
                const velocity = this.calculatePlanetVelocity(planet, time);

                positions[planet] = {
                    longitude: longitude,
                    velocity: velocity
                };
            } catch (error) {
                console.error(`Error calculating ${planet} position:`, error);
                // Skip this planet if calculation fails
            }
        }

        // Calculate accurate Rahu and Ketu positions using our custom method
        const nodes = this.calculateRahuKetuPositions(birthDate, latitude, longitude);
        positions.Rahu = nodes.Rahu;
        positions.Ketu = nodes.Ketu;

        // Calculate Ascendant
        positions.Ascendant = {
            longitude: this.calculateAscendant(birthDate, latitude, longitude)
        };

    } catch (error) {
        console.error('Error calculating planetary positions:', error);
    }

    return positions;
}

function calculatePlanetaryPositions(date, latitude, longitude) {
    const ayanamsa = getLahiriAyanamsa(date);
    const positions = {};

    try {
        const astronomyDate = new Date(date);

        // Calculate planetary positions using astronomy-engine
        const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

        for (const body of bodies) {
            try {
                const bodyData = Astronomy.GeoVector(body, astronomyDate, false);
                const ecliptic = Astronomy.Ecliptic(bodyData);

                // Convert to sidereal longitude
                let longitude = ecliptic.elon;
                longitude -= ayanamsa;
                if (longitude < 0) longitude += 360;
                if (longitude >= 360) longitude -= 360;

                positions[body] = {
                    longitude: longitude,
                    latitude: ecliptic.elat,
                    speed: 0 // Speed calculation would require additional computation
                };
            } catch (error) {
                console.warn(`Warning: Could not calculate ${body} position:`, error.message);
                positions[body] = getApproximatePosition(body, date, ayanamsa);
            }
        }

        // Calculate accurate Rahu and Ketu positions
        const nodes = calculateRahuKetuPositions(astronomyDate, ayanamsa);
        positions['Rahu'] = nodes.Rahu;
        positions['Ketu'] = nodes.Ketu;

    } catch (error) {
        console.error('Error in planetary calculations:', error);
        const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
        for (const planet of PLANETS) {
            positions[planet] = getApproximatePosition(planet, date, ayanamsa);
        }
    }

    return { positions, ayanamsa };
}

// Main function to calculate accurate Rahu and Ketu positions
function calculateRahuKetuPositions(date, ayanamsa) {
    try {
        // Method 1: Try using lunar orbital elements for high accuracy
        const nodes = calculateLunarNodes(date, ayanamsa);
        return nodes;
    } catch (error) {
        console.warn('Primary Rahu/Ketu calculation failed, using fallback:', error.message);
        // Fallback to alternative calculation
        return calculateRahuKetuFallback(date, ayanamsa);
    }
}


// Primary method: Calculate using lunar orbital mechanics
function calculateLunarNodes(date, ayanamsa) {
    const jd = getJulianDay(date);
    
    // Julian centuries from J2000.0
    const T = (jd - 2451545.0) / 36525.0;
    
    // Mean longitude of ascending node (Rahu) using high-precision formula
    // This is based on VSOP87/DE405 ephemeris data
    let L = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441.0 - T * T * T * T / 60616000.0;
    
    // Add periodic terms for higher accuracy
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0 - T * T * T * T / 113065000.0;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
    const MP = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0;
    const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0 + T * T * T * T / 863310000.0;
    
    // Convert to radians for trigonometric calculations
    const DRad = D * Math.PI / 180;
    const MRad = M * Math.PI / 180;
    const MPRad = MP * Math.PI / 180;
    const FRad = F * Math.PI / 180;
    
    // Apply major periodic corrections
    const corrections = [
        { coeff: -1.274, arg: MPRad - 2 * DRad },      // Evection
        { coeff: 0.658, arg: -2 * DRad },              // Variation
        { coeff: -0.186, arg: MRad },                  // Yearly equation
        { coeff: -0.059, arg: 2 * MPRad - 2 * DRad }, // Parallactic inequality
        { coeff: -0.057, arg: MPRad - 2 * DRad + MRad },
        { coeff: 0.053, arg: MPRad + 2 * DRad },
        { coeff: 0.046, arg: 2 * DRad - MRad },
        { coeff: 0.041, arg: MPRad - MRad },
        { coeff: -0.035, arg: DRad },                  // Main problem in longitude
        { coeff: -0.031, arg: MPRad + MRad }
    ];
    
    // Apply corrections
    for (const correction of corrections) {
        L += correction.coeff * Math.sin(correction.arg) / 3600; // Convert arcseconds to degrees
    }
    
    // Normalize to 0-360 degrees
    L = ((L % 360) + 360) % 360;
    
    // Convert from mean to true longitude by applying nutation
    const nutation = calculateNutationInLongitude(T);
    L += nutation;
    
    // Convert from tropical to sidereal longitude
    let rahuSiderealLongitude = L - ayanamsa;
    if (rahuSiderealLongitude < 0) rahuSiderealLongitude += 360;
    if (rahuSiderealLongitude >= 360) rahuSiderealLongitude -= 360;
    
    // Ketu is exactly 180° opposite to Rahu
    let ketuSiderealLongitude = (rahuSiderealLongitude + 180) % 360;
    
    // Calculate daily motion (retrograde)
    const dailyMotion = -0.05295779; // degrees per day (more accurate value)
    
    return {
        Rahu: {
            longitude: rahuSiderealLongitude,
            latitude: 0, // Nodes are always on the ecliptic
            speed: dailyMotion
        },
        Ketu: {
            longitude: ketuSiderealLongitude,
            latitude: 0, // Nodes are always on the ecliptic
            speed: dailyMotion
        }
    };
}

// Helper function - ensure this exists and is accurate
function getJulianDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const decimalDay = day + (hour + minute / 60 + second / 3600) / 24;

    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;

    return decimalDay + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// Updated getApproximatePosition function with better Rahu/Ketu calculation
function getApproximatePosition(planet, date, ayanamsa) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Calculate days since epoch (J2000.0)
    const epoch = new Date(2000, 0, 1, 12, 0, 0); // J2000.0
    const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);

    console.log(`Calculating approximate position for ${planet} on ${year}-${month}-${day} (${daysSinceEpoch.toFixed(2)} days since J2000.0)`);

    let longitude;

    if (planet === 'Rahu') {
        // More accurate Rahu calculation
        // Mean longitude of ascending node at J2000.0: 125.0445°
        // Mean daily motion: -0.0529539° per day (retrograde)
        longitude = 125.0445 - 0.0529539 * daysSinceEpoch;
    } else if (planet === 'Ketu') {
        // Ketu is 180° opposite to Rahu
        const rahuLong = 125.0445 - 0.0529539 * daysSinceEpoch;
        longitude = rahuLong + 180;
    } else {
        // Original calculations for other planets
        const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
        const approximatePositions = {
            'Sun': (dayOfYear * 0.9856) % 360,
            'Moon': (dayOfYear * 13.176) % 360,
            'Mercury': (dayOfYear * 4.092) % 360,
            'Venus': (dayOfYear * 1.602) % 360,
            'Mars': (dayOfYear * 0.524) % 360,
            'Jupiter': (dayOfYear * 0.083) % 360,
            'Saturn': (dayOfYear * 0.033) % 360
        };
        longitude = approximatePositions[planet] || Math.random() * 360;
    }

    // Normalize longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    // Convert from tropical to sidereal
    longitude -= ayanamsa;
    if (longitude < 0) longitude += 360;
    if (longitude >= 360) longitude -= 360;

    return {
        longitude: longitude,
        latitude: 0,
        speed: (planet === 'Rahu' || planet === 'Ketu') ? -0.053 : 0
    };
}

// Enhanced fallback calculation
function calculateRahuKetuFallback(date, ayanamsa) {
    const jd = getJulianDay(date);
    const T = (jd - 2451545.0) / 36525.0;
    
    // Simplified but more accurate formula for fallback
    let meanNodeLongitude = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
    
    // Apply basic nutation
    const omega = (125.04452 - 1934.136261 * T) * Math.PI / 180;
    const nutation = -17.20 * Math.sin(omega) / 3600; // Convert to degrees
    meanNodeLongitude += nutation;
    
    // Normalize
    meanNodeLongitude = ((meanNodeLongitude % 360) + 360) % 360;
    
    // Convert to sidereal
    let rahuSiderealLongitude = meanNodeLongitude - ayanamsa;
    if (rahuSiderealLongitude < 0) rahuSiderealLongitude += 360;
    if (rahuSiderealLongitude >= 360) rahuSiderealLongitude -= 360;
    
    return {
        Rahu: {
            longitude: rahuSiderealLongitude,
            latitude: 0,
            speed: -0.05295779
        },
        Ketu: {
            longitude: (rahuSiderealLongitude + 180) % 360,
            latitude: 0,
            speed: -0.05295779
        }
    };
}


// Enhanced nutation calculation
function calculateNutationInLongitude(T) {
    // Mean elongation of Moon from Sun
    const D = (297.8501921 + 445267.1114034 * T) * Math.PI / 180;
    
    // Mean anomaly of Sun
    const M = (357.5291092 + 35999.0502909 * T) * Math.PI / 180;
    
    // Mean anomaly of Moon
    const MP = (134.9633964 + 477198.8675055 * T) * Math.PI / 180;
    
    // Moon's argument of latitude
    const F = (93.2720950 + 483202.0175233 * T) * Math.PI / 180;
    
    // Longitude of ascending node
    const omega = (125.04452 - 1934.136261 * T) * Math.PI / 180;
    
    // Calculate nutation terms (main terms only for efficiency)
    const nutationTerms = [
        { coeff: -171996, period: [0, 0, 0, 0, 1] },        // Main term
        { coeff: -13187, period: [-2, 0, 0, 2, 2] },        // Semi-annual term
        { coeff: -2274, period: [0, 0, 0, 2, 2] },          // Fortnightly term
        { coeff: 2062, period: [0, 0, 0, 0, 2] },           // Monthly term
        { coeff: 1426, period: [0, 1, 0, 0, 0] },           // Annual term
        { coeff: 712, period: [0, 0, 2, -2, 2] },
        { coeff: -517, period: [-2, 1, 0, 2, 2] },
        { coeff: -386, period: [0, 0, 2, 0, 2] },
        { coeff: -301, period: [0, 0, 1, 0, 0] }
    ];
    
    let nutation = 0;
    for (const term of nutationTerms) {
        const argument = term.period[0] * D + term.period[1] * M + term.period[2] * MP + term.period[3] * F + term.period[4] * omega;
        nutation += term.coeff * Math.sin(argument);
    }
    
    // Convert from 0.1 milliarcseconds to degrees
    return nutation * 0.0001 / 3600;
}

// Updated getApproximatePosition for better Rahu/Ketu handling
function getApproximatePosition(planet, date, ayanamsa) {
    if (planet === 'Rahu' || planet === 'Ketu') {
        // Use the fallback method for nodes
        const nodes = calculateRahuKetuFallback(date, ayanamsa);
        return nodes[planet];
    }
    
    // Original calculation for other planets
    const year = date.getFullYear();
    const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));

    const approximatePositions = {
        'Sun': (dayOfYear * 0.9856) % 360,
        'Moon': (dayOfYear * 13.176) % 360,
        'Mercury': (dayOfYear * 4.092) % 360,
        'Venus': (dayOfYear * 1.602) % 360,
        'Mars': (dayOfYear * 0.524) % 360,
        'Jupiter': (dayOfYear * 0.083) % 360,
        'Saturn': (dayOfYear * 0.033) % 360
    };

    let longitude = approximatePositions[planet] || Math.random() * 360;
    longitude -= ayanamsa;
    if (longitude < 0) longitude += 360;

    return {
        longitude: longitude,
        latitude: 0,
        speed: 0
    };
}

function calculateAscendant(date, latitude, longitude) {
    try {
        // Calculate Local Sidereal Time
        const jd = (date.getTime() / 86400000) + 2440587.5;
        const gmst = (18.697374558 + 24.06570982441908 * (jd - 2451545.0)) % 24;
        const lst = (gmst + longitude / 15) % 24;

        // Calculate ascendant using simplified formula
        const latRad = latitude * Math.PI / 180;
        const lstRad = lst * Math.PI / 12;

        // Obliquity of ecliptic
        const obliquity = 23.43929111;
        const oblRad = obliquity * Math.PI / 180;

        // Calculate ascendant
        const ascRad = Math.atan2(Math.cos(lstRad), -Math.sin(lstRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad));
        let ascendant = ascRad * 180 / Math.PI;

        if (ascendant < 0) ascendant += 360;

        // Apply ayanamsa
        const ayanamsa = getLahiriAyanamsa(date);
        ascendant -= ayanamsa;
        if (ascendant < 0) ascendant += 360;

        return ascendant;
    } catch (error) {
        console.error('Error calculating ascendant:', error);
        // Fallback calculation
        return Math.random() * 360;
    }
}

function norm360(x) { return ((x % 360) + 360) % 360; }


function getRashiFromLongitude(longitude) {
    const rashiNumber = Math.floor(longitude / 30) + 1;
    return RASHIS[Math.min(rashiNumber - 1, 11)];
}

function getNakshatraFromLongitude(longitude) {
    // Each nakshatra spans 13°20' (13.333°)
    const nakshatraIndex = Math.floor(longitude / 13.333333);
    const nakshatra = NAKSHATRAS[Math.min(nakshatraIndex, 26)];

    // Calculate pada (quarter)
    const nakshatraPosition = longitude % 13.333333;
    const pada = Math.floor(nakshatraPosition / 3.333333) + 1;

    return { ...nakshatra, pada: Math.min(pada, 4) };
}

function calculateAdditionalDetails(planetaryPositions, moonRashi, ascendantRashi) {
    const moonLongitude = planetaryPositions.Moon.longitude;
    const sunLongitude = planetaryPositions.Sun.longitude;

    // Calculate Janma Rashi (Moon Sign)
    const janmaRashi = moonRashi;

    // Calculate Sun Sign
    const sunRashi = getRashiFromLongitude(sunLongitude);

    // Calculate Yoga (simplified)
    const sunMoonDistance = Math.abs(sunLongitude - moonLongitude);
    let yoga = 'Shukla Paksha';
    if (sunMoonDistance > 180) {
        yoga = 'Krishna Paksha';
    }

    return {
        janmaRashi,
        sunSign: sunRashi,
        yoga,
        moonPhase: sunMoonDistance > 180 ? 'Waning' : 'Waxing'
    };
}


module.exports = { validateInput,norm360, createDate, calculatePlanetaryPositions,getPlanetaryPositions, calculateAscendant, getRashiFromLongitude, getNakshatraFromLongitude, calculateAdditionalDetails };