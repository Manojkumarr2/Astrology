const Astronomy = require('astronomy-engine');
const { BirthChartGenerator } = require('./birthchart');

class AccuratePoruthamCalculator {
    constructor() {
        this.birthChartGenerator = new BirthChartGenerator();
        this.initializeAstrologicalData();
    }

    initializeAstrologicalData() {
        // Use the same nakshatra data as BirthChartGenerator for consistency
        this.NAKSHATRAS = this.birthChartGenerator.NAKSHATRAS;
        this.RASHIS = this.birthChartGenerator.RASHIS;
        
        // Initialize Porutham mappings
        this.initializePoruthamMappings();
    }

    initializePoruthamMappings() {
        // Gana mapping (temperament) - CORRECTED
        this.ganaMapping = {
            'Ashwini': 'Deva', 'Bharani': 'Manushya', 'Krittika': 'Rakshasa',
            'Rohini': 'Manushya', 'Mrigashira': 'Deva', 'Ardra': 'Manushya',
            'Punarvasu': 'Deva', 'Pushya': 'Deva', 'Ashlesha': 'Rakshasa',
            'Magha': 'Rakshasa', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya',
            'Hasta': 'Deva', 'Chitra': 'Rakshasa', 'Swati': 'Deva',
            'Vishakha': 'Rakshasa', 'Anuradha': 'Deva', 'Jyeshtha': 'Rakshasa',
            'Mula': 'Rakshasa', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya',
            'Shravana': 'Deva', 'Dhanishta': 'Rakshasa', 'Shatabhisha': 'Rakshasa',
            'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya', 'Revati': 'Deva'
        };

        // Yoni mapping (animal compatibility)
        this.yoniMapping = {
            'Ashwini': 'Horse', 'Bharani': 'Elephant', 'Krittika': 'Goat',
            'Rohini': 'Serpent', 'Mrigashira': 'Serpent', 'Ardra': 'Dog',
            'Punarvasu': 'Cat', 'Pushya': 'Goat', 'Ashlesha': 'Cat',
            'Magha': 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Bull',
            'Hasta': 'Buffalo', 'Chitra': 'Tiger', 'Swati': 'Buffalo',
            'Vishakha': 'Tiger', 'Anuradha': 'Deer', 'Jyeshtha': 'Deer',
            'Mula': 'Dog', 'Purva Ashadha': 'Monkey', 'Uttara Ashadha': 'Mongoose',
            'Shravana': 'Monkey', 'Dhanishta': 'Lion', 'Shatabhisha': 'Horse',
            'Purva Bhadrapada': 'Lion', 'Uttara Bhadrapada': 'Bull', 'Revati': 'Elephant'
        };

        // Yoni compatibility matrix
        this.yoniCompatibility = {
            'Horse-Horse': 4, 'Elephant-Elephant': 4, 'Goat-Goat': 4,
            'Serpent-Serpent': 4, 'Dog-Dog': 4, 'Cat-Cat': 4,
            'Rat-Rat': 4, 'Bull-Bull': 4, 'Buffalo-Buffalo': 4,
            'Tiger-Tiger': 4, 'Deer-Deer': 4, 'Monkey-Monkey': 4,
            'Mongoose-Mongoose': 4, 'Lion-Lion': 4,
            
            // Friendly pairs
            'Horse-Elephant': 3, 'Elephant-Horse': 3,
            'Horse-Buffalo': 3, 'Buffalo-Horse': 3,
            'Elephant-Lion': 3, 'Lion-Elephant': 3,
            'Goat-Monkey': 3, 'Monkey-Goat': 3,
            'Bull-Buffalo': 3, 'Buffalo-Bull': 3,
            'Deer-Monkey': 3, 'Monkey-Deer': 3,
            
            // Neutral pairs
            'Horse-Goat': 2, 'Goat-Horse': 2,
            'Elephant-Bull': 2, 'Bull-Elephant': 2,
            'Dog-Deer': 2, 'Deer-Dog': 2,
            'Cat-Lion': 2, 'Lion-Cat': 2,
            'Rat-Mongoose': 2, 'Mongoose-Rat': 2,
            
            // Unfriendly pairs
            'Cat-Rat': 1, 'Rat-Cat': 1,
            'Tiger-Deer': 1, 'Deer-Tiger': 1,
            'Buffalo-Tiger': 1, 'Tiger-Buffalo': 1,
            'Dog-Cat': 1, 'Cat-Dog': 1,
            
            // Enemy pairs
            'Serpent-Mongoose': 0, 'Mongoose-Serpent': 0,
            'Tiger-Bull': 0, 'Bull-Tiger': 0,
            'Lion-Horse': 0, 'Horse-Lion': 0
        };

        // Rajju mapping (longevity categories)
        this.rajjuMapping = {
            'Ashwini': 'Pada', 'Bharani': 'Pada', 'Krittika': 'Pada',
            'Rohini': 'Kanta', 'Mrigashira': 'Kanta', 'Ardra': 'Kanta',
            'Punarvasu': 'Kanta', 'Pushya': 'Kanta', 'Ashlesha': 'Kanta',
            'Magha': 'Nabhi', 'Purva Phalguni': 'Nabhi', 'Uttara Phalguni': 'Nabhi',
            'Hasta': 'Nabhi', 'Chitra': 'Nabhi', 'Swati': 'Kanta',
            'Vishakha': 'Kanta', 'Anuradha': 'Kanta', 'Jyeshtha': 'Kanta',
            'Mula': 'Nabhi', 'Purva Ashadha': 'Nabhi', 'Uttara Ashadha': 'Nabhi',
            'Shravana': 'Nabhi', 'Dhanishta': 'Pada', 'Shatabhisha': 'Pada',
            'Purva Bhadrapada': 'Pada', 'Uttara Bhadrapada': 'Pada', 'Revati': 'Pada'
        };

        // Naadi mapping (pulse/health compatibility)
        this.naadiMapping = {
            'Ashwini': 'Aadi', 'Bharani': 'Madhya', 'Krittika': 'Antya',
            'Rohini': 'Aadi', 'Mrigashira': 'Madhya', 'Ardra': 'Antya',
            'Punarvasu': 'Aadi', 'Pushya': 'Madhya', 'Ashlesha': 'Antya',
            'Magha': 'Aadi', 'Purva Phalguni': 'Madhya', 'Uttara Phalguni': 'Antya',
            'Hasta': 'Aadi', 'Chitra': 'Madhya', 'Swati': 'Antya',
            'Vishakha': 'Aadi', 'Anuradha': 'Madhya', 'Jyeshtha': 'Antya',
            'Mula': 'Aadi', 'Purva Ashadha': 'Madhya', 'Uttara Ashadha': 'Antya',
            'Shravana': 'Aadi', 'Dhanishta': 'Madhya', 'Shatabhisha': 'Antya',
            'Purva Bhadrapada': 'Aadi', 'Uttara Bhadrapada': 'Madhya', 'Revati': 'Antya'
        };

        // Vedha (obstruction) pairs
        this.vedhaPairs = [
            [1, 18], [2, 17], [3, 16], [4, 15], [5, 14], [6, 13], [7, 12], [8, 11], [9, 10],
            [19, 27], [20, 26], [21, 25], [22, 24]
        ];

        // Vashya mapping (mutual attraction)
        this.vashyaMapping = {
            'Mesha': ['Simha', 'Vrishchika'],
            'Vrishabha': ['Karka', 'Tula'],
            'Mithuna': ['Kanya'],
            'Karka': ['Vrishchika', 'Dhanu'],
            'Simha': ['Tula'],
            'Kanya': ['Mithuna', 'Meena'],
            'Tula': ['Makara'],
            'Vrishchika': ['Karka'],
            'Dhanu': ['Meena'],
            'Makara': ['Mesha', 'Kumbha'],
            'Kumbha': ['Mesha'],
            'Meena': ['Makara']
        };

        // Planetary friendships for Graha Maitri
        this.planetaryFriendships = this.birthChartGenerator.planetaryFriendships;
    }

    // ACCURATE Lahiri Ayanamsa calculation
    calculateAccurateLahiriAyanamsa(date) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        const ayanamsa = 23.85 + T * 50.2564 + T * T * 0.0222 + T * T * T * (-0.000654);
        return ayanamsa;
    }

    // ACCURATE Julian Day calculation
    getJulianDay(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();

        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;

        const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;
        
        return jd;
    }

    // FIXED: Robust planetary position calculation using mathematical methods
    async calculateAccuratePlanetaryPositions(date, latitude, longitude) {
        const ayanamsa = this.calculateAccurateLahiriAyanamsa(date);
        const positions = {};

        console.log(`Calculating positions for date: ${date.toISOString()}`);
        console.log(`Ayanamsa: ${ayanamsa}°`);
        
        // Use mathematical calculations for reliable positions
        positions['Sun'] = this.calculateSunPosition(date, ayanamsa);
        positions['Moon'] = this.calculateMoonPosition(date, ayanamsa);
        positions['Mercury'] = this.calculateMercuryPosition(date, ayanamsa);
        positions['Venus'] = this.calculateVenusPosition(date, ayanamsa);
        positions['Mars'] = this.calculateMarsPosition(date, ayanamsa);
        positions['Jupiter'] = this.calculateJupiterPosition(date, ayanamsa);
        positions['Saturn'] = this.calculateSaturnPosition(date, ayanamsa);
        
        // Calculate Rahu and Ketu
        const nodes = this.calculateLunarNodes(date, ayanamsa);
        positions['Rahu'] = nodes.rahu;
        positions['Ketu'] = nodes.ketu;

        console.log('All planetary positions calculated successfully');
        console.log('Moon position:', positions['Moon'].longitude);
        
        return { positions, ayanamsa };
    }

    // Accurate Sun position calculation
    calculateSunPosition(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const n = jd - 2451545.0;
        
        // Mean longitude of Sun
        let L = (280.460 + 0.9856474 * n) % 360;
        if (L < 0) L += 360;
        
        // Mean anomaly
        let g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
        
        // Ecliptic longitude
        let lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
        
        // Convert to sidereal
        let siderealLongitude = lambda - ayanamsa;
        if (siderealLongitude < 0) siderealLongitude += 360;
        if (siderealLongitude >= 360) siderealLongitude -= 360;
        
        console.log(`Sun position: ${siderealLongitude}°`);
        
        return {
            longitude: siderealLongitude,
            latitude: 0,
            speed: 0.9856,
            isRetrograde: false
        };
    }

    // Accurate Moon position calculation
    calculateMoonPosition(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        
        // Moon's mean longitude
        let L = (218.3164591 + 481267.88134236 * T - 0.0013268 * T * T) % 360;
        if (L < 0) L += 360;
        
        // Moon's mean elongation
        let D = ((297.8502042 + 445267.1115168 * T - 0.0016300 * T * T) % 360) * Math.PI / 180;
        
        // Sun's mean anomaly
        let M = ((357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) % 360) * Math.PI / 180;
        
        // Moon's mean anomaly
        let Mp = ((134.9634114 + 477198.8676313 * T + 0.0089970 * T * T) % 360) * Math.PI / 180;
        
        // Moon's argument of latitude
        let F = ((93.2720993 + 483202.0175273 * T - 0.0034029 * T * T) % 360) * Math.PI / 180;
        
        // Apply major periodic terms
        let deltaL = 6.289 * Math.sin(Mp) + 1.274 * Math.sin(2 * D - Mp) + 0.658 * Math.sin(2 * D);
        deltaL += -0.186 * Math.sin(M) - 0.059 * Math.sin(2 * Mp - 2 * D) - 0.057 * Math.sin(Mp - 2 * D + M);
        
        let moonLongitude = L + deltaL;
        
        // Convert to sidereal
        let siderealLongitude = moonLongitude - ayanamsa;
        if (siderealLongitude < 0) siderealLongitude += 360;
        if (siderealLongitude >= 360) siderealLongitude -= 360;
        
        console.log(`Moon position: ${siderealLongitude}°`);
        
        return {
            longitude: siderealLongitude,
            latitude: 0,
            speed: 13.176,
            isRetrograde: false
        };
    }

    // Calculate other planetary positions
    calculateMercuryPosition(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        
        let L = (252.250906 + 149472.6746358 * T - 0.00000536 * T * T) % 360;
        if (L < 0) L += 360;
        
        let siderealLongitude = L - ayanamsa;
        if (siderealLongitude < 0) siderealLongitude += 360;
        if (siderealLongitude >= 360) siderealLongitude -= 360;
        
        return {
            longitude: siderealLongitude,
            latitude: 0,
            speed: 4.092,
            isRetrograde: false
        };
    }

    calculateVenusPosition(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        
        let L = (181.979801 + 58517.8156760 * T + 0.00000165 * T * T) % 360;
        if (L < 0) L += 360;
        
        let siderealLongitude = L - ayanamsa;
        if (siderealLongitude < 0) siderealLongitude += 360;
        if (siderealLongitude >= 360) siderealLongitude -= 360;
        
        return {
            longitude: siderealLongitude,
            latitude: 0,
            speed: 1.602,
            isRetrograde: false
        };
    }

    calculateMarsPosition(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        
        let L = (355.453 + 19140.299 * T) % 360;
        if (L < 0) L += 360;
        
        let siderealLongitude = L - ayanamsa;
        if (siderealLongitude < 0) siderealLongitude += 360;
        if (siderealLongitude >= 360) siderealLongitude -= 360;
        
        return {
            longitude: siderealLongitude,
            latitude: 0,
            speed: 0.524,
            isRetrograde: false
        };
    }

    calculateJupiterPosition(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        
        let L = (34.351 + 3034.905 * T) % 360;
        if (L < 0) L += 360;
        
        let siderealLongitude = L - ayanamsa;
        if (siderealLongitude < 0) siderealLongitude += 360;
        if (siderealLongitude >= 360) siderealLongitude -= 360;
        
        return {
            longitude: siderealLongitude,
            latitude: 0,
            speed: 0.083,
            isRetrograde: false
        };
    }

    calculateSaturnPosition(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        
        let L = (49.944 + 1222.114 * T) % 360;
        if (L < 0) L += 360;
        
        let siderealLongitude = L - ayanamsa;
        if (siderealLongitude < 0) siderealLongitude += 360;
        if (siderealLongitude >= 360) siderealLongitude -= 360;
        
        return {
            longitude: siderealLongitude,
            latitude: 0,
            speed: 0.033,
            isRetrograde: false
        };
    }

    // Calculate lunar nodes
    calculateLunarNodes(date, ayanamsa) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525.0;
        
        let meanNodeLongitude = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
        meanNodeLongitude = ((meanNodeLongitude % 360) + 360) % 360;
        
        let rahuLongitude = meanNodeLongitude - ayanamsa;
        if (rahuLongitude < 0) rahuLongitude += 360;
        if (rahuLongitude >= 360) rahuLongitude -= 360;
        
        let ketuLongitude = (rahuLongitude + 180) % 360;
        
        return {
            rahu: {
                longitude: rahuLongitude,
                latitude: 0,
                speed: -0.0529539,
                isRetrograde: true
            },
            ketu: {
                longitude: ketuLongitude,
                latitude: 0,
                speed: -0.0529539,
                isRetrograde: true
            }
        };
    }

    // ACCURATE nakshatra calculation using BirthChartGenerator
    getNakshatraFromLongitude(longitude) {
        return this.birthChartGenerator.getNakshatraInfo(longitude);
    }

    // ACCURATE rashi calculation using BirthChartGenerator
    getRashiFromLongitude(longitude) {
        longitude = ((longitude % 360) + 360) % 360;
        const rashiNumber = Math.floor(longitude / 30) + 1;
        const validRashiNumber = Math.max(1, Math.min(12, rashiNumber));
        
        return {
            ...this.RASHIS[validRashiNumber - 1],
            degreeInRashi: longitude % 30
        };
    }

    // Generate complete birth chart using integrated approach
    async generateCompleteBirthChart(date, latitude, longitude) {
        try {
            console.log(`Generating complete chart for: ${date.toISOString()}, Lat: ${latitude}, Lng: ${longitude}`);
            
            // Calculate accurate planetary positions
            const { positions, ayanamsa } = await this.calculateAccuratePlanetaryPositions(date, latitude, longitude);
            
            if (!positions['Moon'] || isNaN(positions['Moon'].longitude)) {
                throw new Error('Invalid Moon position calculated');
            }
            
            console.log(`Moon longitude: ${positions['Moon'].longitude}°`);
            
            // Calculate accurate ascendant
            const ascendant = await this.calculateAccurateAscendant(date, latitude, longitude, ayanamsa);
            console.log(`Ascendant: ${ascendant}°`);

            // Generate complete birth chart using BirthChartGenerator
            const birthChart = this.birthChartGenerator.generateBirthChart(positions, ascendant);

            // Extract moon information for Porutham calculations
            const moonPlanet = birthChart.planets['Moon'];
            if (!moonPlanet) {
                throw new Error('Moon information not found in birth chart');
            }

            return {
                date: date,
                ayanamsa: ayanamsa,
                ascendant: ascendant,
                moonSign: {
                    name: moonPlanet.sign,
                    number: moonPlanet.signNumber,
                    lord: moonPlanet.lord,
                    tamil: moonPlanet.signTamil
                },
                moonNakshatra: {
                    name: moonPlanet.nakshatra,
                    number: moonPlanet.nakshatraNumber,
                    lord: moonPlanet.nakshatraLord,
                    tamil: moonPlanet.nakshatraTamil,
                    pada: moonPlanet.pada
                },
                positions: positions,
                houses: birthChart.houses,
                planets: birthChart.planets,
                accuracy: 'High - Based on integrated BirthChart calculations'
            };

        } catch (error) {
            console.error('Error generating complete chart:', error);
            throw new Error(`Chart generation failed: ${error.message}`);
        }
    }

    // Calculate accurate ascendant
    async calculateAccurateAscendant(date, latitude, longitude, ayanamsa) {
        try {
            const jd = this.getJulianDay(date);
            const T = (jd - 2451545.0) / 36525.0;
            
            let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                      0.000387933 * T * T - T * T * T / 38710000.0;
            gmst = ((gmst % 360) + 360) % 360;

            let lst = gmst + longitude;
            lst = ((lst % 360) + 360) % 360;

            const latRad = latitude * Math.PI / 180;
            const lstRad = lst * Math.PI / 180;

            const obliquity = 23.4392911 - 0.0130042 * T;
            const oblRad = obliquity * Math.PI / 180;

            const ascRad = Math.atan2(
                Math.cos(lstRad), 
                -Math.sin(lstRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad)
            );
            
            let ascendant = ascRad * 180 / Math.PI;
            if (ascendant < 0) ascendant += 360;

            ascendant -= ayanamsa;
            if (ascendant < 0) ascendant += 360;

            return ascendant;

        } catch (error) {
            console.error('Error calculating ascendant:', error);
            return 180; // Fallback value
        }
    }

    // ===== ALL PORUTHAM CALCULATIONS =====

    // 1. Dina Porutham
    calculateDinaPorutham(nakshatra1, nakshatra2) {
        const nak1Num = nakshatra1.number;
        const nak2Num = nakshatra2.number;

        const count = ((nak2Num - nak1Num + 27) % 27);
        const countForCheck = count === 0 ? 27 : count;
        const remainder = countForCheck % 9;
        
        let score = 0;
        let status = 'Poor';
        let description = '';

        if ([2, 4, 6, 8, 0].includes(remainder)) {
            score = 3;
            status = 'Excellent';
            description = 'Highly favorable for prosperity, happiness and longevity';
        } else if ([1, 3, 5, 7].includes(remainder)) {
            score = 1;
            status = 'Average';
            description = 'Moderate compatibility with some challenges';
        }

        return {
            name: 'Dina Porutham',
            tamilName: 'தின பொருத்தம்',
            score: score,
            maxScore: 3,
            percentage: (score / 3) * 100,
            status: status,
            description: description,
            calculation: {
                person1Nakshatra: nakshatra1.name,
                person2Nakshatra: nakshatra2.name,
                count: countForCheck,
                remainder: remainder
            }
        };
    }

    // 2. Gana Porutham
    calculateGanaPorutham(nakshatra1, nakshatra2) {
        const gana1 = this.ganaMapping[nakshatra1.name];
        const gana2 = this.ganaMapping[nakshatra2.name];

        let score = 0;
        let status = 'Poor';
        let description = '';

        if (gana1 === gana2) {
            score = 6;
            status = 'Excellent';
            description = 'Same temperament - perfect mental harmony and understanding';
        } else if ((gana1 === 'Deva' && gana2 === 'Manushya') || (gana1 === 'Manushya' && gana2 === 'Deva')) {
            score = 5;
            status = 'Very Good';
            description = 'Divine-Human combination - complementary temperaments';
        } else if ((gana1 === 'Manushya' && gana2 === 'Rakshasa') || (gana1 === 'Rakshasa' && gana2 === 'Manushya')) {
            score = 1;
            status = 'Below Average';
            description = 'Human-Demon combination - significant temperament differences';
        } else if ((gana1 === 'Deva' && gana2 === 'Rakshasa') || (gana1 === 'Rakshasa' && gana2 === 'Deva')) {
            score = 0;
            status = 'Poor';
            description = 'Divine-Demon combination - conflicting temperaments, not recommended';
        }

        return {
            name: 'Gana Porutham',
            tamilName: 'கண பொருத்தம்',
            score: score,
            maxScore: 6,
            percentage: (score / 6) * 100,
            status: status,
            description: description,
            calculation: {
                person1Gana: gana1,
                person2Gana: gana2
            }
        };
    }

    // 3. Mahendra Porutham
    calculateMahendraPorutham(nakshatra1, nakshatra2) {
        const nak1Num = nakshatra1.number;
        const nak2Num = nakshatra2.number;

        const count = ((nak2Num - nak1Num + 27) % 27);
        const countForCheck = count === 0 ? 27 : count;
        const favorablePositions = [1, 4, 7, 10, 13, 16, 19, 22, 25];
        
        let score = favorablePositions.includes(countForCheck) ? 2 : 0;
        let status = score > 0 ? 'Excellent' : 'Poor';
        let description = score > 0 ? 'Favorable for prosperity, progeny and family welfare' : 'May face challenges in prosperity and progeny';

        return {
            name: 'Mahendra Porutham',
            tamilName: 'மகேந்திர பொருத்தம்',
            score: score,
            maxScore: 2,
            percentage: (score / 2) * 100,
            status: status,
            description: description,
            calculation: {
                count: countForCheck,
                isFavorable: favorablePositions.includes(countForCheck)
            }
        };
    }

    // 4. Stree Deergha Porutham
    calculateStreeDeerghaPorutham(nakshatra1, nakshatra2, gender1, gender2) {
        const nak1Num = nakshatra1.number;
        const nak2Num = nakshatra2.number;

        let brideNak, groomNak;
        if (gender1.toLowerCase() === 'female' || gender1.toLowerCase() === 'f') {
            brideNak = nak1Num;
            groomNak = nak2Num;
        } else {
            brideNak = nak2Num;
            groomNak = nak1Num;
        }

        const count = ((groomNak - brideNak + 27) % 27);
        const countForCheck = count === 0 ? 27 : count;
        
        let score = countForCheck >= 13 ? 2 : 0;
        let status = score > 0 ? 'Excellent' : 'Poor';
        let description = score > 0 ? 
            'Favorable for longevity and well-being of wife' : 
            'May affect longevity and health of wife - requires remedies';

        return {
            name: 'Stree Deergha Porutham',
            tamilName: 'ஸ்திரீ தீர்க்க பொருத்தம்',
            score: score,
            maxScore: 2,
            percentage: (score / 2) * 100,
            status: status,
            description: description,
            calculation: {
                brideNakshatra: brideNak,
                groomNakshatra: groomNak,
                count: countForCheck,
                isLongEnough: countForCheck >= 13
            }
        };
    }

    // 5. Yoni Porutham
    calculateYoniPorutham(nakshatra1, nakshatra2) {
        const yoni1 = this.yoniMapping[nakshatra1.name];
        const yoni2 = this.yoniMapping[nakshatra2.name];

        const key1 = `${yoni1}-${yoni2}`;
        const key2 = `${yoni2}-${yoni1}`;
        
        let score = 0;
        let status = 'Poor';
        let description = '';

        if (yoni1 === yoni2) {
            score = 4;
            status = 'Excellent';
            description = 'Same yoni - perfect physical and sexual compatibility';
        } else {
            score = this.yoniCompatibility[key1] || this.yoniCompatibility[key2] || 2;
            
            if (score === 4) {
                status = 'Excellent';
                description = 'Highly compatible yonis - excellent physical relationship';
            } else if (score === 3) {
                status = 'Very Good';
                description = 'Good yoni compatibility - harmonious physical relationship';
            } else if (score === 2) {
                status = 'Average';
                description = 'Moderate yoni compatibility - requires understanding';
            } else if (score === 1) {
                status = 'Below Average';
                description = 'Challenging yoni combination - may have physical incompatibility';
            } else {
                status = 'Poor';
                description = 'Incompatible yonis - significant physical challenges';
            }
        }

        return {
            name: 'Yoni Porutham',
            tamilName: 'யோனி பொருத்தம்',
            score: score,
            maxScore: 4,
            percentage: (score / 4) * 100,
            status: status,
            description: description,
            calculation: {
                person1Yoni: yoni1,
                person2Yoni: yoni2,
                compatibilityScore: score
            }
        };
    }

    // 6. Rasi Porutham
    calculateRasiPorutham(moonSign1, moonSign2) {
        const rasi1Num = moonSign1.number;
        const rasi2Num = moonSign2.number;

        const distance = Math.abs(rasi2Num - rasi1Num);
        const adjustedDistance = Math.min(distance, 12 - distance);

        let score = 0;
        let status = 'Poor';
        let description = '';

        if (adjustedDistance === 0) {
            score = 5;
            status = 'Excellent';
            description = 'Same moon sign - perfect emotional understanding';
        } else if ([2, 4, 6].includes(adjustedDistance)) {
            score = 4;
            status = 'Very Good';
            description = 'Favorable moon sign combination - good emotional compatibility';
        } else if ([1, 3, 5].includes(adjustedDistance)) {
            score = 2;
            status = 'Average';
            description = 'Moderate moon sign compatibility - requires adjustment';
        }

        return {
            name: 'Rasi Porutham',
            tamilName: 'ராசி பொருத்தம்',
            score: score,
            maxScore: 5,
            percentage: (score / 5) * 100,
            status: status,
            description: description,
            calculation: {
                person1Rasi: moonSign1.name,
                person2Rasi: moonSign2.name,
                distance: adjustedDistance
            }
        };
    }

    // 7. Graha Maitri Porutham
    calculateGrahaMaitriPorutham(moonSign1, moonSign2) {
        const lord1 = moonSign1.lord;
        const lord2 = moonSign2.lord;

        let score = 0;
        let status = 'Poor';
        let description = '';

        if (lord1 === lord2) {
            score = 5;
            status = 'Excellent';
            description = 'Same ruling planet - perfect mental harmony';
        } else if (this.planetaryFriendships[lord1]?.friends?.includes(lord2)) {
            score = 4;
            status = 'Very Good';
            description = 'Friendly planetary rulers - good mental compatibility';
        } else if (this.planetaryFriendships[lord1]?.neutrals?.includes(lord2)) {
            score = 3;
            status = 'Good';
            description = 'Neutral planetary relationship - moderate compatibility';
        } else if (this.planetaryFriendships[lord1]?.enemies?.includes(lord2)) {
            score = 1;
            status = 'Poor';
            description = 'Enemy planetary rulers - mental conflicts likely';
        } else {
            score = 2;
            status = 'Average';
            description = 'Unknown planetary relationship - moderate compatibility';
        }

        return {
            name: 'Graha Maitri Porutham',
            tamilName: 'கிரக மைத்ரி பொருத்தம்',
            score: score,
            maxScore: 5,
            percentage: (score / 5) * 100,
            status: status,
            description: description,
            calculation: {
                person1Lord: lord1,
                person2Lord: lord2,
                relationship: score >= 4 ? 'Friends' : score >= 3 ? 'Neutral' : score <= 1 ? 'Enemies' : 'Average'
            }
        };
    }

    // 8. Rajju Porutham
    calculateRajjuPorutham(nakshatra1, nakshatra2) {
        const rajju1 = this.rajjuMapping[nakshatra1.name];
        const rajju2 = this.rajjuMapping[nakshatra2.name];

        let score = 0;
        let status = 'Poor';
        let description = '';

        if (rajju1 !== rajju2) {
            score = 2;
            status = 'Excellent';
            description = 'Different Rajju categories - favorable for longevity and health';
        } else {
            score = 0;
            status = 'Poor';
            description = 'Same Rajju category - may affect longevity, requires strong remedies';
            
            if (rajju1 === 'Pada') {
                description += ' (Pada Rajju - may affect travel and movement)';
            } else if (rajju1 === 'Kanta') {
                description += ' (Kanta Rajju - may affect throat/neck area)';
            } else if (rajju1 === 'Nabhi') {
                description += ' (Nabhi Rajju - may affect stomach/navel area)';
            }
        }

        return {
            name: 'Rajju Porutham',
            tamilName: 'ரஜ்ஜு பொருத்தம்',
            score: score,
            maxScore: 2,
            percentage: (score / 2) * 100,
            status: status,
            description: description,
            calculation: {
                person1Rajju: rajju1,
                person2Rajju: rajju2,
                isDifferent: rajju1 !== rajju2
            }
        };
    }

    // 9. Vedha Porutham
    calculateVedhaPorutham(nakshatra1, nakshatra2) {
        const nak1Num = nakshatra1.number;
        const nak2Num = nakshatra2.number;

        let hasVedha = false;
        let vedhaPair = null;

        for (const pair of this.vedhaPairs) {
            if ((pair[0] === nak1Num && pair[1] === nak2Num) ||
                (pair[1] === nak1Num && pair[0] === nak2Num)) {
                hasVedha = true;
                vedhaPair = pair;
                break;
            }
        }

        let score = !hasVedha ? 2 : 0;
        let status = score > 0 ? 'Excellent' : 'Poor';
        let description = score > 0 ? 
            'No Vedha found - no major obstacles in relationship' : 
            `Vedha present (${vedhaPair[0]}-${vedhaPair[1]}) - may cause obstacles and difficulties`;

        return {
            name: 'Vedha Porutham',
            tamilName: 'வேதை பொருத்தம்',
            score: score,
            maxScore: 2,
            percentage: (score / 2) * 100,
            status: status,
            description: description,
            calculation: {
                hasVedha: hasVedha,
                vedhaPair: vedhaPair
            }
        };
    }

    // 10. Vashya Porutham
    calculateVashyaPorutham(moonSign1, moonSign2) {
        const rasi1Name = moonSign1.name;
        const rasi2Name = moonSign2.name;
        
        const vashyaSigns1 = this.vashyaMapping[rasi1Name] || [];
        const vashyaSigns2 = this.vashyaMapping[rasi2Name] || [];

        let score = 0;
        let status = 'Poor';
        let description = '';

        if (rasi1Name === rasi2Name) {
            score = 2;
            status = 'Excellent';
            description = 'Same rashi - natural mutual attraction and understanding';
        } else if (vashyaSigns1.includes(rasi2Name) && vashyaSigns2.includes(rasi1Name)) {
            score = 2;
            status = 'Excellent';
            description = 'Mutual Vashya - both partners attract and control each other equally';
        } else if (vashyaSigns1.includes(rasi2Name)) {
            score = 1;
            status = 'Average';
            description = 'One-way Vashya - person 1 attracts and influences person 2';
        } else if (vashyaSigns2.includes(rasi1Name)) {
            score = 1;
            status = 'Average';
            description = 'One-way Vashya - person 2 attracts and influences person 1';
        } else {
            score = 0;
            status = 'Poor';
            description = 'No Vashya - lack of mutual attraction and influence';
        }

        return {
            name: 'Vashya Porutham',
            tamilName: 'வசிய பொருத்தம்',
            score: score,
            maxScore: 2,
            percentage: (score / 2) * 100,
            status: status,
            description: description,
            calculation: {
                person1VashyaSigns: vashyaSigns1,
                person2VashyaSigns: vashyaSigns2,
                mutualVashya: vashyaSigns1.includes(rasi2Name) && vashyaSigns2.includes(rasi1Name)
            }
        };
    }

    // 11. Naadi Porutham
    calculateNaadiPorutham(chart1, chart2) {
        const naadi1 = this.naadiMapping[chart1.moonNakshatra.name];
        const naadi2 = this.naadiMapping[chart2.moonNakshatra.name];

        let score = 0;
        let status = 'Poor';
        let description = '';

        if (naadi1 !== naadi2) {
            score = 8;
            status = 'Excellent';
            description = 'Different Naadi - excellent for health, vitality and progeny';
        } else {
            score = 0;
            status = 'Poor';
            description = `Same Naadi (${naadi1}) - may affect health and children, strong remedies required`;
            
            if (naadi1 === 'Aadi') {
                description += ' (Aadi Naadi - may affect Vata constitution)';
            } else if (naadi1 === 'Madhya') {
                description += ' (Madhya Naadi - may affect Pitta constitution)';
            } else if (naadi1 === 'Antya') {
                description += ' (Antya Naadi - may affect Kapha constitution)';
            }
        }

        return {
            name: 'Naadi Porutham',
            tamilName: 'நாடி பொருத்தம்',
            score: score,
            maxScore: 8,
            percentage: (score / 8) * 100,
            status: status,
            description: description,
            calculation: {
                person1Naadi: naadi1,
                person2Naadi: naadi2,
                isDifferent: naadi1 !== naadi2
            }
        };
    }

    // Calculate overall compatibility
    calculateOverallCompatibility(poruthams) {
        let totalScore = 0;
        let maxScore = 0;
        
        const weights = {
            naadiPorutham: 1.5,
            ganaPorutham: 1.3,
            yoniPorutham: 1.2,
            rajjuPorutham: 1.2,
            grahaMaitriPorutham: 1.1,
        };

        for (const [key, porutham] of Object.entries(poruthams)) {
            const weight = weights[key] || 1.0;
            totalScore += porutham.score * weight;
            maxScore += porutham.maxScore * weight;
        }

        const percentage = Math.round((totalScore / maxScore) * 100);

        let grade, status;
        if (percentage >= 95) {
            grade = 'A+'; status = 'Exceptional Match - Highly Recommended';
        } else if (percentage >= 85) {
            grade = 'A'; status = 'Excellent Match - Strongly Recommended';
        } else if (percentage >= 75) {
            grade = 'B+'; status = 'Very Good Match - Recommended';
        } else if (percentage >= 65) {
            grade = 'B'; status = 'Good Match - Suitable with Minor Remedies';
        } else if (percentage >= 55) {
            grade = 'C+'; status = 'Average Match - Moderate Remedies Required';
        } else if (percentage >= 45) {
            grade = 'C'; status = 'Below Average - Significant Remedies Required';
        } else if (percentage >= 35) {
            grade = 'D'; status = 'Poor Match - Extensive Remedies Required';
        } else {
            grade = 'F'; status = 'Not Recommended - Major Doshas Present';
        }

        return {
            percentage,
            grade,
            status,
            totalScore: Math.round(totalScore * 100) / 100,
            maxScore: Math.round(maxScore * 100) / 100,
            weightedCalculation: true
        };
    }

    // Generate detailed analysis
    generateDetailedAnalysis(poruthams, chart1, chart2) {
        const strengths = [];
        const weaknesses = [];
        const criticalIssues = [];
        const recommendations = [];
        const remedialMeasures = [];

        for (const [key, porutham] of Object.entries(poruthams)) {
            if (porutham.percentage >= 80) {
                strengths.push({
                    name: porutham.name,
                    tamilName: porutham.tamilName,
                    score: porutham.score,
                    percentage: porutham.percentage,
                    description: porutham.description
                });
            } else if (porutham.percentage <= 20) {
                if (key === 'naadiPorutham' || key === 'rajjuPorutham') {
                    criticalIssues.push({
                        name: porutham.name,
                        tamilName: porutham.tamilName,
                        score: porutham.score,
                        percentage: porutham.percentage,
                        description: porutham.description,
                        severity: 'Critical'
                    });
                } else {
                    weaknesses.push({
                        name: porutham.name,
                        tamilName: porutham.tamilName,
                        score: porutham.score,
                        percentage: porutham.percentage,
                        description: porutham.description
                    });
                }
            }
        }

        // Generate specific recommendations and remedies
        if (criticalIssues.length > 0) {
            recommendations.push('CRITICAL: Major doshas found - consult qualified astrologer immediately');
            recommendations.push('Perform comprehensive remedial measures before considering marriage');
        }

        if (poruthams.naadiPorutham && poruthams.naadiPorutham.score === 0) {
            remedialMeasures.push({
                dosha: 'Naadi Dosha',
                tamilName: 'நாடி தோஷம்',
                severity: 'Critical',
                remedies: [
                    'Perform Mahamrityunjaya mantra japa (1,25,000 times)',
                    'Donate gold equal to bride\'s weight',
                    'Perform Rudrabhishek on Mondays for 11 weeks',
                    'Feed Brahmins and distribute food to the needy',
                    'Perform Pitra Paksha rituals for ancestors'
                ],
                tamilRemedies: [
                    'மகாம்ருத்யுஞ்ஜய மந்திர ஜபம் செய்யவும்',
                    'தங்கம் தானம் செய்யவும்',
                    'ருத்ராபிஷேகம் செய்யவும்'
                ]
            });
        }

        if (poruthams.rajjuPorutham && poruthams.rajjuPorutham.score === 0) {
            remedialMeasures.push({
                dosha: 'Rajju Dosha',
                tamilName: 'ரஜ்ஜு தோஷம்',
                severity: 'Critical',
                remedies: [
                    'Perform Ayush Homa for longevity',
                    'Worship Lord Vishnu with Vishnu Sahasranama',
                    'Donate sesame seeds and black cloth',
                    'Perform charity for elderly people',
                    'Recite Vishnu mantras daily'
                ],
                tamilRemedies: [
                    'ஆயுஷ் ஹோமம் செய்யவும்',
                    'விஷ்ணு சகஸ்ரநாமம் ஜபிக்கவும்'
                ]
            });
        }

        if (poruthams.ganaPorutham && poruthams.ganaPorutham.score <= 1) {
            remedialMeasures.push({
                dosha: 'Gana Dosha',
                tamilName: 'கண தோஷம்',
                severity: 'Moderate',
                remedies: [
                    'Perform Shiva-Parvati puja together',
                    'Visit Shiva temples on Mondays',
                    'Recite Om Namah Shivaya mantra',
                    'Donate white flowers and milk to temples',
                    'Perform Pradosha Vrata'
                ],
                tamilRemedies: [
                    'சிவ பார்வதி பூஜை செய்யவும்',
                    'ஓம் நம சிவாய ஜபிக்கவும்'
                ]
            });
        }

        return {
            strengths,
            weaknesses,
            criticalIssues,
            recommendations,
            remedialMeasures,
            overallAssessment: this.generateOverallAssessment(strengths.length, weaknesses.length, criticalIssues.length),
            marriageRecommendation: this.generateMarriageRecommendation(criticalIssues, strengths, weaknesses),
            compatibilityInsights: this.generateCompatibilityInsights(poruthams, chart1, chart2)
        };
    }

    generateOverallAssessment(strengthCount, weaknessCount, criticalCount) {
        if (criticalCount > 0) {
            return {
                rating: 'Critical Issues Present',
                tamilRating: 'முக்கிய பிரச்சினைகள் உள்ளன',
                recommendation: 'Not recommended without extensive remedies',
                tamilRecommendation: 'விரிவான பரிகாரங்கள் இல்லாமல் பரிந்துரைக்கப்படவில்லை',
                description: 'Major doshas detected that require immediate attention'
            };
        } else if (strengthCount >= 8) {
            return {
                rating: 'Exceptional Compatibility',
                tamilRating: 'அசாதாரண பொருத்தம்',
                recommendation: 'Highly recommended for marriage',
                tamilRecommendation: 'திருமணத்திற்கு மிகவும் பரிந்துரைக்கப்படுகிறது',
                description: 'Outstanding compatibility in most areas'
            };
        } else if (strengthCount >= 6) {
            return {
                rating: 'Excellent Compatibility',
                tamilRating: 'சிறந்த பொருத்தம்',
                recommendation: 'Strongly recommended for marriage',
                tamilRecommendation: 'திருமணத்திற்கு வலுவாக பரிந்துரைக்கப்படுகிறது',
                description: 'Very good compatibility with minor adjustments needed'
            };
        } else if (strengthCount >= 4) {
            return {
                rating: 'Good Compatibility',
                tamilRating: 'நல்ல பொருத்தம்',
                recommendation: 'Suitable for marriage with appropriate remedies',
                tamilRecommendation: 'தகுந்த பரிகாரங்களுடன் திருமணத்திற்கு ஏற்றது',
                description: 'Reasonable compatibility with some areas needing attention'
            };
        } else {
            return {
                rating: 'Challenging Compatibility',
                tamilRating: 'சவால் நிறைந்த பொருத்தம்',
                recommendation: 'Requires careful consideration and remedies',
                tamilRecommendation: 'கவனமான பரிசீலனை மற்றும் பரிகாரங்கள் தேவை',
                description: 'Several compatibility challenges need to be addressed'
            };
        }
    }

    generateMarriageRecommendation(criticalIssues, strengths, weaknesses) {
        const totalPoints = strengths.length * 3 + weaknesses.length * (-1) + criticalIssues.length * (-5);
        
        if (criticalIssues.length >= 2) {
            return {
                recommendation: 'Not Recommended',
                tamilRecommendation: 'பரிந்துரைக்கப்படவில்லை',
                reason: 'Multiple critical doshas present',
                tamilReason: 'பல முக்கிய தோஷங்கள் உள்ளன',
                action: 'Extensive remedies required before considering marriage'
            };
        } else if (criticalIssues.length === 1) {
            return {
                recommendation: 'Conditional Recommendation',
                tamilRecommendation: 'நிபந்தனை பரிந்துரை',
                reason: 'One critical dosha needs attention',
                tamilReason: 'ஒரு முக்கிய தோஷம் கவனம் தேவை',
                action: 'Perform specific remedies and consult astrologer'
            };
        } else if (totalPoints >= 15) {
            return {
                recommendation: 'Highly Recommended',
                tamilRecommendation: 'மிகவும் பரிந்துரைக்கப்படுகிறது',
                reason: 'Excellent overall compatibility',
                tamilReason: 'சிறந்த ஒட்டுமொத்த பொருத்தம்',
                action: 'Proceed with marriage plans'
            };
        } else if (totalPoints >= 8) {
            return {
                recommendation: 'Recommended',
                tamilRecommendation: 'பரிந்துரைக்கப்படுகிறது',
                reason: 'Good compatibility with minor adjustments',
                tamilReason: 'சிறிய சரிசெய்தல்களுடன் நல்ல பொருத்தம்',
                action: 'Minor remedies recommended'
            };
        } else {
            return {
                recommendation: 'Consider Carefully',
                tamilRecommendation: 'கவனமாக பரிசீலிக்கவும்',
                reason: 'Mixed compatibility results',
                tamilReason: 'கலந்த பொருத்தம் முடிவுகள்',
                action: 'Detailed analysis and remedies needed'
            };
        }
    }

       generateCompatibilityInsights(poruthams, chart1, chart2) {
        const insights = [];

        // Mental compatibility insights
        const mentalScore = (poruthams.ganaPorutham.percentage + poruthams.grahaMaitriPorutham.percentage) / 2;
        insights.push({
            category: 'Mental Compatibility',
            tamilCategory: 'மன பொருத்தம்',
            score: Math.round(mentalScore),
            description: mentalScore >= 80 ? 'Excellent mental harmony expected' : 
                        mentalScore >= 60 ? 'Good mental compatibility' : 'Mental adjustments needed',
            tamilDescription: mentalScore >= 80 ? 'சிறந்த மன இணக்கம் எதிர்பார்க்கப்படுகிறது' :
                             mentalScore >= 60 ? 'நல்ல மன பொருத்தம்' : 'மன சரிசெய்தல்கள் தேவை'
        });

        // Physical compatibility insights
        const physicalScore = poruthams.yoniPorutham.percentage;
        insights.push({
            category: 'Physical Compatibility',
            tamilCategory: 'உடல் பொருத்தம்',
            score: physicalScore,
            description: physicalScore >= 80 ? 'Excellent physical harmony' :
                        physicalScore >= 60 ? 'Good physical compatibility' : 'Physical adjustments needed',
            tamilDescription: physicalScore >= 80 ? 'சிறந்த உடல் இணக்கம்' :
                             physicalScore >= 60 ? 'நல்ல உடல் பொருத்தம்' : 'உடல் சரிசெய்தல்கள் தேவை'
        });

        // Health and longevity insights
        const healthScore = (poruthams.naadiPorutham.percentage + poruthams.rajjuPorutham.percentage) / 2;
        insights.push({
            category: 'Health & Longevity',
            tamilCategory: 'ஆரோக்கியம் மற்றும் நீண்ட ஆயுள்',
            score: Math.round(healthScore),
            description: healthScore >= 80 ? 'Excellent health prospects' :
                        healthScore >= 60 ? 'Good health compatibility' : 'Health concerns - remedies needed',
            tamilDescription: healthScore >= 80 ? 'சிறந்த ஆரோக்கிய வாய்ப்புகள்' :
                             healthScore >= 60 ? 'நல்ல ஆரோக்கிய பொருத்தம்' : 'ஆரோக்கிய கவலைகள் - பரிகாரங்கள் தேவை'
        });

        // Prosperity insights
        const prosperityScore = poruthams.mahendraPorutham.percentage;
        insights.push({
            category: 'Prosperity & Progeny',
            tamilCategory: 'செழிப்பு மற்றும் சந்ததி',
            score: prosperityScore,
            description: prosperityScore >= 80 ? 'Excellent prospects for prosperity and children' :
                        prosperityScore >= 60 ? 'Good prospects for family growth' : 'May face challenges in prosperity',
            tamilDescription: prosperityScore >= 80 ? 'செழிப்பு மற்றும் குழந்தைகளுக்கு சிறந்த வாய்ப்புகள்' :
                             prosperityScore >= 60 ? 'குடும்ப வளர்ச்சிக்கு நல்ல வாய்ப்புகள்' : 'செழிப்பில் சவால்களை எதிர்கொள்ளலாம்'
        });

        return insights;
    }

    // Main method to calculate all Poruthams using BirthChart integration
    async calculateAllPortuthams(person1Data, person2Data) {
        try {
            console.log('Starting Porutham calculations with integrated birth charts...');
            
            // Generate complete birth charts for both persons
            const chart1 = await this.generateCompleteBirthChart(
                person1Data.date, 
                person1Data.latitude, 
                person1Data.longitude
            );
            
            const chart2 = await this.generateCompleteBirthChart(
                person2Data.date, 
                person2Data.latitude, 
                person2Data.longitude
            );

            console.log('Both complete charts generated successfully',chart1.houses);
            console.log('Chart1 Moon:', chart1.moonSign.name, chart1.moonNakshatra.name);
            console.log('Chart2 Moon:', chart2.moonSign.name, chart2.moonNakshatra.name);

            // Calculate all poruthams using the integrated chart data
            const poruthams = {
                dinaPorutham: this.calculateDinaPorutham(chart1.moonNakshatra, chart2.moonNakshatra),
                ganaPorutham: this.calculateGanaPorutham(chart1.moonNakshatra, chart2.moonNakshatra),
                mahendraPorutham: this.calculateMahendraPorutham(chart1.moonNakshatra, chart2.moonNakshatra),
                streeDeerghaPorutham: this.calculateStreeDeerghaPorutham(
                    chart1.moonNakshatra, 
                    chart2.moonNakshatra, 
                    person1Data.gender, 
                    person2Data.gender
                ),
                yoniPorutham: this.calculateYoniPorutham(chart1.moonNakshatra, chart2.moonNakshatra),
                rasiPorutham: this.calculateRasiPorutham(chart1.moonSign, chart2.moonSign),
                grahaMaitriPorutham: this.calculateGrahaMaitriPorutham(chart1.moonSign, chart2.moonSign),
                rajjuPorutham: this.calculateRajjuPorutham(chart1.moonNakshatra, chart2.moonNakshatra),
                vedhaPorutham: this.calculateVedhaPorutham(chart1.moonNakshatra, chart2.moonNakshatra),
                vashyaPorutham: this.calculateVashyaPorutham(chart1.moonSign, chart2.moonSign),
                naadiPorutham: this.calculateNaadiPorutham(chart1, chart2)
            };

            console.log('All Poruthams calculated successfully');

            // Calculate overall compatibility
            const overallCompatibility = this.calculateOverallCompatibility(poruthams);
            
            // Generate detailed analysis
            const analysis = this.generateDetailedAnalysis(poruthams, chart1, chart2);

            // Calculate category-wise compatibility
            const categoryCompatibility = this.calculateCategoryCompatibility(poruthams);

            // Generate marriage timing recommendations
            const marriageTiming = this.generateMarriageTimingRecommendations(chart1, chart2);

            return {
                success: true,
                data: {
                    person1Chart: chart1,
                    person2Chart: chart2,
                    poruthams: poruthams,
                    compatibility: overallCompatibility,
                    analysis: analysis,
                    categoryCompatibility: categoryCompatibility,
                    marriageTiming: marriageTiming,
                    calculatedBy: 'vikramNplus',
                    calculatedAt: new Date().toISOString(),
                    version: '3.0.0'
                }
            };

        } catch (error) {
            console.error('Error calculating poruthams:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Calculate category-wise compatibility
    calculateCategoryCompatibility(poruthams) {
        const categories = {
            mental: {
                name: 'Mental Compatibility',
                tamilName: 'மன பொருத்தம்',
                poruthams: ['ganaPorutham', 'grahaMaitriPorutham'],
                description: 'Indicates mental harmony and understanding between partners',
                tamilDescription: 'பங்குதாரர்களுக்கிடையே மன இணக்கம் மற்றும் புரிதலை குறிக்கிறது'
            },
            physical: {
                name: 'Physical Compatibility',
                tamilName: 'உடல் பொருத்தம்',
                poruthams: ['yoniPorutham', 'rasiPorutham'],
                description: 'Indicates physical attraction and sexual compatibility',
                tamilDescription: 'உடல் ஈர்ப்பு மற்றும் பாலியல் பொருத்தத்தை குறிக்கிறது'
            },
            spiritual: {
                name: 'Spiritual Compatibility',
                tamilName: 'ஆன்மீக பொருத்தம்',
                poruthams: ['naadiPorutham', 'rajjuPorutham', 'vedhaPorutham'],
                description: 'Indicates spiritual harmony and life path compatibility',
                tamilDescription: 'ஆன்மீக இணக்கம் மற்றும் வாழ்க்கைப் பாதை பொருத்தத்தை குறிக்கிறது'
            },
            prosperity: {
                name: 'Prosperity & Growth',
                tamilName: 'செழிப்பு மற்றும் வளர்ச்சி',
                poruthams: ['mahendraPorutham', 'streeDeerghaPorutham', 'dinaPorutham'],
                description: 'Indicates prospects for wealth, family growth and happiness',
                tamilDescription: 'செல்வம், குடும்ப வளர்ச்சி மற்றும் மகிழ்ச்சிக்கான வாய்ப்புகளை குறிக்கிறது'
            },
            attraction: {
                name: 'Mutual Attraction',
                tamilName: 'பரஸ்பர ஈர்ப்பு',
                poruthams: ['vashyaPorutham'],
                description: 'Indicates mutual attraction and influence between partners',
                tamilDescription: 'பங்குதாரர்களுக்கிடையே பரஸ்பர ஈர்ப்பு மற்றும் செல்வாக்கை குறிக்கிறது'
            }
        };

        const categoryScores = {};

        for (const [categoryKey, categoryInfo] of Object.entries(categories)) {
            let totalScore = 0;
            let maxScore = 0;
            let categoryPoruthams = [];

            categoryInfo.poruthams.forEach(poruthamparam => {
                if (poruthams[poruthamparam]) {
                    totalScore += poruthams[poruthamparam].score;
                    maxScore += poruthams[poruthamparam].maxScore;
                    categoryPoruthams.push({
                        name: poruthams[poruthamparam].name,
                        tamilName: poruthams[poruthamparam].tamilName,
                        score: poruthams[poruthamparam].score,
                        percentage: poruthams[poruthamparam].percentage,
                        status: poruthams[poruthamparam].status
                    });
                }
            });

            const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
            const status = this.getCompatibilityStatus(percentage);

            categoryScores[categoryKey] = {
                ...categoryInfo,
                score: totalScore,
                maxScore: maxScore,
                percentage: percentage,
                status: status.status,
                statusColor: status.color,
                tamilStatus: status.tamil,
                poruthams: categoryPoruthams,
                recommendation: this.getCategoryRecommendation(percentage, categoryKey)
            };
        }

        return categoryScores;
    }

    // Get compatibility status based on percentage
    getCompatibilityStatus(percentage) {
        if (percentage >= 90) return { status: 'Excellent', color: '#4CAF50', tamil: 'சிறந்தது' };
        if (percentage >= 75) return { status: 'Very Good', color: '#8BC34A', tamil: 'மிகவும் நல்லது' };
        if (percentage >= 60) return { status: 'Good', color: '#CDDC39', tamil: 'நல்லது' };
        if (percentage >= 40) return { status: 'Average', color: '#FF9800', tamil: 'சராசரி' };
        if (percentage >= 25) return { status: 'Below Average', color: '#FF5722', tamil: 'சராசரிக்கு கீழ்' };
        return { status: 'Poor', color: '#F44336', tamil: 'மோசம்' };
    }

    // Get category-specific recommendations
    getCategoryRecommendation(percentage, category) {
        const recommendations = {
            mental: {
                excellent: 'Perfect mental harmony - excellent communication expected',
                good: 'Good mental compatibility - minor adjustments in communication style',
                average: 'Moderate mental compatibility - patience and understanding required',
                poor: 'Mental compatibility challenges - counseling and remedies recommended'
            },
            physical: {
                excellent: 'Excellent physical attraction and compatibility',
                good: 'Good physical compatibility with strong attraction',
                average: 'Moderate physical compatibility - emotional bonding important',
                poor: 'Physical compatibility concerns - focus on emotional connection'
            },
            spiritual: {
                excellent: 'Perfect spiritual alignment and life path harmony',
                good: 'Good spiritual compatibility with shared values',
                average: 'Moderate spiritual alignment - respect for differences needed',
                poor: 'Spiritual compatibility challenges - remedies and mutual respect essential'
            },
            prosperity: {
                excellent: 'Excellent prospects for wealth, family growth and happiness',
                good: 'Good potential for prosperity and family welfare',
                average: 'Moderate prospects - effort and planning required for success',
                poor: 'Prosperity challenges - hard work and remedies needed'
            },
            attraction: {
                excellent: 'Strong mutual attraction and influence',
                good: 'Good mutual attraction with balanced influence',
                average: 'Moderate attraction - work on building connection',
                poor: 'Attraction challenges - focus on compatibility building'
            }
        };

        const categoryRecommendations = recommendations[category] || recommendations.mental;

        if (percentage >= 80) return categoryRecommendations.excellent;
        if (percentage >= 60) return categoryRecommendations.good;
        if (percentage >= 40) return categoryRecommendations.average;
        return categoryRecommendations.poor;
    }

    // Generate marriage timing recommendations
    generateMarriageTimingRecommendations(chart1, chart2) {
        const recommendations = {
            auspiciousPeriods: [],
            avoidPeriods: [],
            generalGuidance: [],
            monthlyGuidance: [],
            seasonalGuidance: {}
        };

        // Based on moon signs and planetary positions
        const moonSign1 = chart1.moonSign?.name;
        const moonSign2 = chart2.moonSign?.name;

        // General auspicious periods
        recommendations.auspiciousPeriods = [
            {
                period: 'Chaitra (March-April)',
                tamilPeriod: 'சித்திரை (மார்ச்-ஏப்ரல்)',
                reason: 'New beginnings and fresh start',
                tamilReason: 'புதிய தொடக்கங்கள் மற்றும் புதிய ஆரம்பம்'
            },
            {
                period: 'Vaishakha (April-May)',
                tamilPeriod: 'வைகாசி (ஏப்ரல்-மே)',
                reason: 'Prosperity and growth',
                tamilReason: 'செழிப்பு மற்றும் வளர்ச்சி'
            },
            {
                period: 'Margashirsha (November-December)',
                tamilPeriod: 'மார்கழி (நவம்பர்-டிசம்பர்)',
                reason: 'Divine blessings and spiritual growth',
                tamilReason: 'தெய்வீக ஆசீர்வாதங்கள் மற்றும் ஆன்மீக வளர்ச்சி'
            },
            {
                period: 'Pausha (December-January)',
                tamilPeriod: 'மார்கழி-தை (டிசம்பர்-ஜனவரி)',
                reason: 'Stability and harmony',
                tamilReason: 'நிலைத்தன்மை மற்றும் இணக்கம்'
            }
        ];

        // Periods to avoid
        recommendations.avoidPeriods = [
            {
                period: 'Ashadha (June-July)',
                tamilPeriod: 'ஆடி (ஜூன்-ஜூலை)',
                reason: 'Monsoon challenges and obstacles',
                tamilReason: 'மழைக்கால சவால்கள் மற்றும் தடைகள்'
            },
            {
                period: 'Bhadrapada (August-September)',
                tamilPeriod: 'ஆவணி (ஆகஸ்ட்-செப்டம்பர்)',
                reason: 'Potential obstacles and delays',
                tamilReason: 'சாத்தியமான தடைகள் மற்றும் தாமதங்கள்'
            },
            {
                period: 'Eclipse periods',
                tamilPeriod: 'கிரகண காலங்கள்',
                reason: 'Inauspicious for new beginnings',
                tamilReason: 'புதிய தொடக்கங்களுக்கு அசுபகரம்'
            },
            {
                period: 'Rahu Kaal timings',
                tamilPeriod: 'ராகு கால நேரங்கள்',
                reason: 'Inauspicious planetary influence',
                tamilReason: 'அசுபகரமான கிரக செல்வாக்கு'
            }
        ];

        // General guidance
        recommendations.generalGuidance = [
            {
                guidance: 'Choose muhurat timing based on both birth charts',
                tamilGuidance: 'இரு ஜாதகங்களின் அடிப்படையில் முகூர்த்த நேரத்தை தேர்வு செய்யுங்கள்'
            },
            {
                guidance: 'Avoid retrograde Mercury periods for ceremonies',
                tamilGuidance: 'சடங்குகளுக்கு பின்னோக்கி புதன் காலங்களை தவிர்க்கவும்'
            },
            {
                guidance: 'Consider lunar calendar for auspicious dates',
                tamilGuidance: 'சுப நாட்களுக்கு சந்திர காலண்டரை கருத்தில் கொள்ளுங்கள்'
            },
            {
                guidance: 'Consult family astrologer for precise timing',
                tamilGuidance: 'துல்லியமான நேரத்திற்கு குடும்ப ஜோதிடரை அணுகுங்கள்'
            }
        ];

        // Monthly guidance based on current date
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const tamilMonths = [
            'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
            'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
        ];

        for (let i = 0; i < 12; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const monthGuidance = this.getMonthlyMarriageGuidance(monthIndex, moonSign1, moonSign2);
            recommendations.monthlyGuidance.push({
                month: monthNames[monthIndex],
                tamilMonth: tamilMonths[monthIndex],
                ...monthGuidance
            });
        }

        // Seasonal guidance
        recommendations.seasonalGuidance = {
            spring: {
                season: 'Spring (March-May)',
                tamilSeason: 'வசந்த காலம் (மார்ச்-மே)',
                suitability: 'Highly Favorable',
                tamilSuitability: 'மிகவும் சாதகமானது',
                reason: 'New growth, fresh beginnings, and positive energy'
            },
            summer: {
                season: 'Summer (June-August)',
                tamilSeason: 'கோடை காலம் (ஜூன்-ஆகஸ்ட்)',
                suitability: 'Moderate',
                tamilSuitability: 'மிதமானது',
                reason: 'Some challenges but manageable with proper planning'
            },
            autumn: {
                season: 'Autumn (September-November)',
                tamilSeason: 'இலையுதிர் காலம் (செப்டம்பர்-நவம்பர்)',
                suitability: 'Favorable',
                tamilSuitability: 'சாதகமானது',
                reason: 'Stability and harvest time - good for long-term commitment'
            },
            winter: {
                season: 'Winter (December-February)',
                tamilSeason: 'குளிர் காலம் (டிசம்பர்-பிப்ரவரி)',
                suitability: 'Very Favorable',
                tamilSuitability: 'மிகவும் சாதகமானது',
                reason: 'Peaceful time, good for ceremonies and celebrations'
            }
        };

        return recommendations;
    }

    // Get monthly marriage guidance
    getMonthlyMarriageGuidance(monthIndex, moonSign1, moonSign2) {
        const monthGuidance = [
            { // January
                favorability: 'Very Good',
                tamilFavorability: 'மிகவும் நல்லது',
                description: 'Excellent time for new beginnings and commitments',
                tamilDescription: 'புதிய தொடக்கங்கள் மற்றும் உறுதிமொழிகளுக்கு சிறந்த நேரம்',
                specialDays: ['Makar Sankranti', 'Republic Day'],
                tamilSpecialDays: ['மகர சங்கராந்தி', 'குடியரசு நாள்']
            },
            { // February
                favorability: 'Good',
                tamilFavorability: 'நல்லது',
                description: 'Good time for love and relationships',
                tamilDescription: 'அன்பு மற்றும் உறவுகளுக்கு நல்ல நேரம்',
                specialDays: ['Vasant Panchami', 'Maha Shivratri'],
                tamilSpecialDays: ['வசந்த பஞ்சமி', 'மகா சிவராத்திரி']
            },
            // Add more months as needed...
        ];

        return monthGuidance[monthIndex] || {
            favorability: 'Moderate',
            tamilFavorability: 'மிதமானது',
            description: 'Consult astrologer for specific guidance',
            tamilDescription: 'குறிப்பிட்ட வழிகாட்டுதலுக்கு ஜோதிடரை கலந்தாலோசிக்கவும்',
            specialDays: [],
            tamilSpecialDays: []
        };
    }

    // Additional utility methods for validation and error handling
    validateInputData(personData) {
        const required = ['date', 'latitude', 'longitude', 'gender'];
        const missing = required.filter(field => !personData[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate date
        if (!(personData.date instanceof Date) || isNaN(personData.date.getTime())) {
            throw new Error('Invalid date provided');
        }

        // Validate coordinates
        if (Math.abs(personData.latitude) > 90) {
            throw new Error('Invalid latitude: must be between -90 and 90 degrees');
        }

        if (Math.abs(personData.longitude) > 180) {
            throw new Error('Invalid longitude: must be between -180 and 180 degrees');
        }

        // Validate gender
        if (!['male', 'female', 'm', 'f'].includes(personData.gender.toLowerCase())) {
            throw new Error('Invalid gender: must be male, female, m, or f');
        }

        return true;
    }

    // Method to calculate compatibility with comprehensive validation
    async calculatePortuthamWithValidation(person1Data, person2Data) {
        try {
            // Validate input data
            this.validateInputData(person1Data);
            this.validateInputData(person2Data);

            // Calculate poruthams with full integration
            const result = await this.calculateAllPortuthams(person1Data, person2Data);
            
            if (result.success) {
                // Add validation metadata
                result.data.validation = {
                    person1Validated: true,
                    person2Validated: true,
                    dataQuality: 'High',
                    calculationMethod: 'Integrated BirthChart + Porutham Analysis',
                    validatedBy: 'vikramNplus',
                    validatedAt: new Date().toISOString()
                };
            }

            return result;

        } catch (error) {
            console.error('Validation or calculation error:', error);
            return {
                success: false,
                error: error.message,
                details: 'Please check your input data and try again',
                timestamp: new Date().toISOString(),
                validatedBy: 'vikramNplus'
            };
        }
    }

    // Method to get simplified results for quick checking
    async getSimplifiedCompatibility(person1Data, person2Data) {
        try {
            const result = await this.calculatePortuthamWithValidation(person1Data, person2Data);
            
            if (!result.success) {
                return result;
            }

            const { poruthams, compatibility, analysis } = result.data;
            
            // Extract key metrics
            const keyMetrics = {
                overallCompatibility: compatibility.percentage,
                grade: compatibility.grade,
                status: compatibility.status,
                criticalIssues: analysis.criticalIssues.map(issue => issue.name),
                majorStrengths: analysis.strengths.slice(0, 3).map(strength => strength.name),
                quickRecommendation: analysis.marriageRecommendation.recommendation,
                tamilRecommendation: analysis.marriageRecommendation.tamilRecommendation,
                remediesRequired: analysis.remedialMeasures.length > 0,
                calculatedBy: 'vikramNplus'
            };

            return {
                success: true,
                simplified: keyMetrics,
                fullData: result.data,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Method to export results to different formats
    exportResults(results, format = 'json') {
        const timestamp = new Date().toISOString();
        const exportMetadata = {
            exportedBy: 'vikramNplus',
            exportedAt: timestamp,
            format: format,
            version: '3.0.0'
        };

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify({
                    ...results,
                    exportMetadata
                }, null, 2);
            
            case 'text':
                return this.formatTextReport(results, exportMetadata);
            
            case 'html':
                return this.formatHtmlReport(results, exportMetadata);
            
            case 'csv':
                return this.formatCsvReport(results, exportMetadata);
            
            default:
                return JSON.stringify({
                    ...results,
                    exportMetadata
                }, null, 2);
        }
    }

    // Format text report
    formatTextReport(results, metadata) {
        let report = '=== COMPREHENSIVE PORUTHAM COMPATIBILITY REPORT ===\n';
        report += `Generated by: ${metadata.exportedBy}\n`;
        report += `Generated on: ${metadata.exportedAt}\n\n`;
        
        if (results.success && results.data) {
            const { compatibility, poruthams, analysis } = results.data;
            
            report += `Overall Compatibility: ${compatibility.percentage}% (${compatibility.grade})\n`;
            report += `Recommendation: ${compatibility.status}\n\n`;
            
            report += 'DETAILED PORUTHAM ANALYSIS:\n';
            report += '-'.repeat(60) + '\n';
            
            Object.entries(poruthams).forEach(([key, porutham]) => {
                report += `${porutham.name} (${porutham.tamilName}): ${porutham.percentage}% - ${porutham.status}\n`;
                report += `  Description: ${porutham.description}\n\n`;
            });
            
            if (analysis.recommendations && analysis.recommendations.length > 0) {
                report += 'RECOMMENDATIONS:\n';
                report += '-'.repeat(60) + '\n';
                analysis.recommendations.forEach((rec, index) => {
                    report += `${index + 1}. ${rec}\n`;
                });
                report += '\n';
            }

            if (analysis.remedialMeasures && analysis.remedialMeasures.length > 0) {
                report += 'REMEDIAL MEASURES:\n';
                report += '-'.repeat(60) + '\n';
                analysis.remedialMeasures.forEach((remedy, index) => {
                    report += `${index + 1}. ${remedy.dosha} (${remedy.tamilName}):\n`;
                    remedy.remedies.forEach((r, i) => {
                        report += `   ${String.fromCharCode(97 + i)}. ${r}\n`;
                    });
                    report += '\n';
                });
            }
        } else {
            report += 'ERROR IN CALCULATION:\n';
            report += results.error || 'Unknown error occurred\n';
        }
        
        report += '\n' + '='.repeat(60) + '\n';
        report += 'Report generated by vikramNplus Astrology System\n';
        
        return report;
    }

    // Format HTML report
    formatHtmlReport(results, metadata) {
        const timestamp = new Date(metadata.exportedAt).toLocaleString();
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Porutham Compatibility Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .porutham { background: #f9f9f9; margin: 15px 0; padding: 15px; border-radius: 5px; border-left: 5px solid #ccc; }
        .porutham.excellent { border-left-color: #4CAF50; }
        .porutham.good { border-left-color: #8BC34A; }
        .porutham.average { border-left-color: #FF9800; }
        .porutham.poor { border-left-color: #F44336; }
        .score-circle { display: inline-block; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: white; font-weight: bold; margin-right: 15px; }
        .metadata { background: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 30px; font-size: 0.9em; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕉 Porutham Compatibility Report</h1>
            <p>Comprehensive Vedic Compatibility Analysis</p>
        </div>`;

        if (results.success && results.data) {
            const { compatibility, poruthams, analysis, categoryCompatibility } = results.data;
            
            html += `
        <div class="section">
            <h2>📊 Overall Compatibility Assessment</h2>
            <div style="text-align: center; margin: 20px 0;">
                <div class="score-circle" style="background: ${this.getScoreColor(compatibility.percentage)}; font-size: 1.2em; width: 100px; height: 100px; line-height: 100px;">
                    ${compatibility.percentage}%
                </div>
                <h3>Grade: ${compatibility.grade}</h3>
                <p><strong>Status:</strong> ${compatibility.status}</p>
                <p><strong>Total Score:</strong> ${compatibility.totalScore}/${compatibility.maxScore}</p>
            </div>
        </div>

        <div class="section">
            <h2>🔍 Detailed Porutham Analysis</h2>
            <div class="grid">`;

            Object.entries(poruthams).forEach(([key, porutham]) => {
                const statusClass = this.getStatusClass(porutham.percentage);
                html += `
                <div class="card porutham ${statusClass}">
                    <h4>${porutham.name} (${porutham.tamilName})</h4>
                    <div class="score-circle" style="background: ${this.getScoreColor(porutham.percentage)}; width: 50px; height: 50px; line-height: 50px; font-size: 0.9em;">
                        ${porutham.percentage}%
                    </div>
                    <p><strong>Score:</strong> ${porutham.score}/${porutham.maxScore}</p>
                    <p><strong>Status:</strong> ${porutham.status}</p>
                    <p>${porutham.description}</p>
                </div>`;
            });

            html += `
            </div>
        </div>`;

            if (categoryCompatibility) {
                html += `
        <div class="section">
            <h2>📈 Category-wise Compatibility</h2>
            <div class="grid">`;

                Object.entries(categoryCompatibility).forEach(([key, category]) => {
                    html += `
                <div class="card">
                    <h4>${category.name} (${category.tamilName})</h4>
                    <div class="score-circle" style="background: ${category.statusColor}; width: 50px; height: 50px; line-height: 50px; font-size: 0.9em;">
                        ${category.percentage}%
                    </div>
                    <p><strong>Status:</strong> ${category.status} (${category.tamilStatus})</p>
                    <p>${category.description}</p>
                    <p><em>${category.recommendation}</em></p>
                </div>`;
                });

                html += `
            </div>
        </div>`;
            }

            if (analysis.remedialMeasures && analysis.remedialMeasures.length > 0) {
                html += `
        <div class="section">
            <h2>🙏 Remedial Measures</h2>`;

                analysis.remedialMeasures.forEach(remedy => {
                    html += `
                <div class="card" style="border-left: 4px solid ${remedy.severity === 'Critical' ? '#F44336' : '#FF9800'};">
                    <h4>${remedy.dosha} (${remedy.tamilName})</h4>
                    <p><strong>Severity:</strong> ${remedy.severity}</p>
                    <ul>`;
                    remedy.remedies.forEach(r => {
                        html += `<li>${r}</li>`;
                    });
                    html += `
                    </ul>
                </div>`;
                });

                html += `
        </div>`;
            }
        } else {
            html += `
        <div class="section">
            <h2>❌ Error in Calculation</h2>
            <p style="color: #F44336; font-size: 1.1em;">${results.error || 'Unknown error occurred'}</p>
        </div>`;
        }

        html += `
        <div class="metadata">
            <p><strong>Report Generated:</strong> ${timestamp}</p>
            <p><strong>Generated By:</strong> ${metadata.exportedBy}</p>
            <p><strong>System Version:</strong> ${metadata.version}</p>
            <p><strong>Format:</strong> ${metadata.format.toUpperCase()}</p>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    // Format CSV report
    formatCsvReport(results, metadata) {
        let csv = 'Porutham Compatibility Report\n';
        csv += `Generated by,${metadata.exportedBy}\n`;
        csv += `Generated on,${metadata.exportedAt}\n\n`;

        if (results.success && results.data) {
            const { compatibility, poruthams } = results.data;
            
            csv += 'Overall Compatibility\n';
            csv += `Percentage,${compatibility.percentage}%\n`;
            csv += `Grade,${compatibility.grade}\n`;
            csv += `Status,${compatibility.status}\n\n`;
            
            csv += 'Porutham Name,Tamil Name,Score,Max Score,Percentage,Status,Description\n';
            Object.entries(poruthams).forEach(([key, porutham]) => {
                csv += `"${porutham.name}","${porutham.tamilName}",${porutham.score},${porutham.maxScore},${porutham.percentage}%,"${porutham.status}","${porutham.description}"\n`;
            });
        } else {
            csv += `Error,${results.error || 'Unknown error occurred'}\n`;
        }

        return csv;
    }

    // Helper methods for formatting
    getScoreColor(percentage) {
        if (percentage >= 80) return '#4CAF50';
        if (percentage >= 60) return '#8BC34A';
        if (percentage >= 40) return '#FF9800';
        return '#F44336';
    }

    getStatusClass(percentage) {
        if (percentage >= 80) return 'excellent';
        if (percentage >= 60) return 'good';
        if (percentage >= 40) return 'average';
        return 'poor';
    }
}

module.exports = { AccuratePoruthamCalculator };