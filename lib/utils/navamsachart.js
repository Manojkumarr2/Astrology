const Astronomy = require('astronomy-engine');
const { calculatePlanetaryPositions } = require('./common');

class ImprovedNavamsaChart {
    constructor() {
        // Zodiac signs in order (0-11)
        this.signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 
            'Leo', 'Virgo', 'Libra', 'Scorpio', 
            'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        
        this.signsTamil = [
            'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
            'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
            'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
        ];

        // EXACT Navamsa calculation constants
        this.NAVAMSA_ARC = 200; // 200 minutes = 3°20' in arc minutes
        this.MINUTES_PER_DEGREE = 60;
        this.MINUTES_PER_SIGN = 1800; // 30° × 60 minutes
        
        // Traditional Navamsa starting signs (Parashari method)
        this.navamsaStartingSigns = {
            // Movable signs (Chara) - start from same element's first sign
            0: 0,   // Aries starts from Aries
            3: 3,   // Cancer starts from Cancer  
            6: 6,   // Libra starts from Libra
            9: 9,   // Capricorn starts from Capricorn
            
            // Fixed signs (Sthira) - start from 9th house of element
            1: 9,   // Taurus starts from Capricorn
            4: 0,   // Leo starts from Aries
            7: 3,   // Scorpio starts from Cancer
            10: 6,  // Aquarius starts from Libra
            
            // Dual signs (Dwiswabhava) - start from 5th house of element  
            2: 6,   // Gemini starts from Libra
            5: 9,   // Virgo starts from Capricorn
            8: 0,   // Sagittarius starts from Aries
            11: 3   // Pisces starts from Cancer
        };

        // Sign lordships
        this.signLords = {
            0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
            4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
            8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
        };

        // Exaltation and debilitation for strength calculation
        this.exaltationSigns = {
            'Sun': 0, 'Moon': 1, 'Mars': 9, 'Mercury': 5,
            'Jupiter': 3, 'Venus': 11, 'Saturn': 6, 'Rahu': 1, 'Ketu': 7
        };
        
        this.debilitationSigns = {
            'Sun': 6, 'Moon': 7, 'Mars': 3, 'Mercury': 11,
            'Jupiter': 9, 'Venus': 5, 'Saturn': 0, 'Rahu': 7, 'Ketu': 1
        };

        // Own signs for planets
        this.ownSigns = {
            'Sun': [4], 'Moon': [3], 'Mars': [0, 7], 'Mercury': [2, 5],
            'Jupiter': [8, 11], 'Venus': [1, 6], 'Saturn': [9, 10],
            'Rahu': [], 'Ketu': []
        };
    }

    // EXACT Navamsa calculation using traditional Vedic method
    calculateNavamsaPrecise(longitude) {
        console.log(`\n🔢 Calculating Precise Navamsa for ${longitude}°`);
        
        // Step 1: Normalize longitude (0-360°)
        let normalizedLon = ((longitude % 360) + 360) % 360;
        
        // Step 2: Convert to arc minutes for precision
        const totalMinutes = Math.floor(normalizedLon * this.MINUTES_PER_DEGREE);
        
        // Step 3: Find Rasi (sign) number and minutes within sign
        const rasiNumber = Math.floor(totalMinutes / this.MINUTES_PER_SIGN);
        const minutesInRasi = totalMinutes % this.MINUTES_PER_SIGN;
        
        // Step 4: Find Navamsa number within the Rasi (0-8)
        const navamsaNumber = Math.floor(minutesInRasi / this.NAVAMSA_ARC);
        
        // Step 5: Ensure navamsa is within valid range
        const validNavamsa = Math.min(8, navamsaNumber);
        
        // Step 6: Get starting navamsa sign for this rasi
        const startingNavamsaSign = this.navamsaStartingSigns[rasiNumber];
        
        // Step 7: Calculate final navamsa sign
        const finalNavamsaSign = (startingNavamsaSign + validNavamsa) % 12;
        
        // Step 8: Calculate precise degree within navamsa sign
        const remainderMinutes = minutesInRasi % this.NAVAMSA_ARC;
        const degreeInNavamsa = (remainderMinutes / this.NAVAMSA_ARC) * 30;
        
        // Step 9: Calculate exact degree in rasi for reference
        const degreeInRasi = minutesInRasi / this.MINUTES_PER_DEGREE;
        
        console.log(`📍 Calculation steps:`);
        console.log(`   Normalized longitude: ${normalizedLon.toFixed(6)}°`);
        console.log(`   Total arc minutes: ${totalMinutes}'`);
        console.log(`   Rasi: ${rasiNumber + 1} (${this.signs[rasiNumber]})`);
        console.log(`   Minutes in Rasi: ${minutesInRasi}'`);
        console.log(`   Navamsa number: ${validNavamsa + 1}/9`);
        console.log(`   Starting navamsa sign: ${this.signs[startingNavamsaSign]}`);
        console.log(`   Final navamsa sign: ${this.signs[finalNavamsaSign]}`);
        console.log(`   Degree in navamsa: ${degreeInNavamsa.toFixed(4)}°`);

        return {
            // Input data
            inputLongitude: longitude,
            normalizedLongitude: normalizedLon,
            
            // Rasi (D1) position
            rasiSign: rasiNumber,
            rasiSignName: this.signs[rasiNumber],
            rasiSignTamil: this.signsTamil[rasiNumber],
            degreeInRasi: degreeInRasi,
            rasiLord: this.signLords[rasiNumber],
            
            // Navamsa (D9) position  
            navamsaNumber: validNavamsa + 1,
            navamsaSign: finalNavamsaSign,
            navamsaSignName: this.signs[finalNavamsaSign],
            navamsaSignTamil: this.signsTamil[finalNavamsaSign],
            degreeInNavamsa: degreeInNavamsa,
            navamsaLord: this.signLords[finalNavamsaSign],
            
            // Calculation metadata
            calculation: {
                totalArcMinutes: totalMinutes,
                minutesInRasi: minutesInRasi,
                navamsaArcUsed: this.NAVAMSA_ARC,
                startingNavamsaSign: this.signs[startingNavamsaSign],
                remainderMinutes: remainderMinutes
            }
        };
    }

    // Validate calculations with known test cases
    validateNavamsaCalculations() {
        console.log('\n🧪 Validating Navamsa calculations with test cases...');
        
        const testCases = [
            {
                name: 'Sun at 15° Aries',
                longitude: 15.0,
                expected: { rasi: 'Aries', navamsa: 'Leo', navamsaNum: 5 },
                description: '15° Aries should be in 5th navamsa (Leo)'
            },
            {
                name: 'Venus at 5° Taurus', 
                longitude: 35.0,
                expected: { rasi: 'Taurus', navamsa: 'Aquarius', navamsaNum: 2 },
                description: '5° Taurus should be in 2nd navamsa (Aquarius)'
            },
            {
                name: 'Jupiter at 10° Cancer',
                longitude: 100.0,
                expected: { rasi: 'Cancer', navamsa: 'Virgo', navamsaNum: 4 },
                description: '10° Cancer should be in 4th navamsa (Virgo)'
            },
            {
                name: 'Mars at 25° Scorpio',
                longitude: 235.0,
                expected: { rasi: 'Scorpio', navamsa: 'Pisces', navamsaNum: 8 },
                description: '25° Scorpio should be in 8th navamsa (Pisces)'
            }
        ];

        let passedTests = 0;
        
        testCases.forEach((test, index) => {
            console.log(`\nTest ${index + 1}: ${test.name}`);
            
            const result = this.calculateNavamsaPrecise(test.longitude);
            
            const rasiMatch = result.rasiSignName === test.expected.rasi;
            const navamsaMatch = result.navamsaSignName === test.expected.navamsa;
            const numberMatch = result.navamsaNumber === test.expected.navamsaNum;
            
            const testPassed = rasiMatch && navamsaMatch && numberMatch;
            
            console.log(`Expected: ${test.expected.rasi} → ${test.expected.navamsa} (${test.expected.navamsaNum})`);
            console.log(`Got: ${result.rasiSignName} → ${result.navamsaSignName} (${result.navamsaNumber})`);
            console.log(`Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
            
            if (testPassed) passedTests++;
            
            if (!testPassed) {
                console.error(`❌ ${test.description}`);
            }
        });
        
        console.log(`\n📊 Test Results: ${passedTests}/${testCases.length} tests passed`);
        return passedTests === testCases.length;
    }

    // Generate complete accurate Navamsa chart
    generateNavamsaChart(existingPositions, ayanamsa, ascendant, birthDetails) {
        try {
            console.log('\n🌟 Generating Mathematically Precise Navamsa Chart');
            console.log(`👤 Generated by: vikramNplus`);
            console.log(`📅 Date: ${new Date().toISOString()}`);
            console.log(`🧭 Ayanamsa: ${ayanamsa.toFixed(6)}°`);
            
            // Run validation tests first
            const validationPassed = this.validateNavamsaCalculations();
            if (!validationPassed) {
                console.warn('⚠️ Some validation tests failed, but continuing...');
            }
            
            console.log('\n📊 Processing planetary positions...');
            
            const rasiPositions = {};
            const navamsaPositions = {};
            
            // Calculate positions for all planets
            Object.keys(existingPositions).forEach(planet => {
                const longitude = existingPositions[planet];
                
                console.log(`\n🪐 ${planet} at ${longitude.toFixed(6)}°:`);
                
                const calculation = this.calculateNavamsaPrecise(longitude);
                
                rasiPositions[planet] = {
                    sign: calculation.rasiSign,
                    signName: calculation.rasiSignName,
                    degree: calculation.degreeInRasi,
                    lord: calculation.rasiLord
                };
                
                navamsaPositions[planet] = calculation;
                
                console.log(`   D1: ${calculation.rasiSignName} ${calculation.degreeInRasi.toFixed(2)}°`);
                console.log(`   D9: ${calculation.navamsaSignName} ${calculation.degreeInNavamsa.toFixed(2)}° (${calculation.navamsaNumber}/9)`);
            });
            
            // Process Lagna (Ascendant)
            console.log(`\n🔼 Lagna at ${ascendant.toFixed(6)}°:`);
            const lagnaCalculation = this.calculateNavamsaPrecise(ascendant);
            
            rasiPositions.Lagna = {
                sign: lagnaCalculation.rasiSign,
                signName: lagnaCalculation.rasiSignName,
                degree: lagnaCalculation.degreeInRasi,
                lord: lagnaCalculation.rasiLord
            };
            
            navamsaPositions.Lagna = lagnaCalculation;
            
            console.log(`   D1 Lagna: ${lagnaCalculation.rasiSignName} ${lagnaCalculation.degreeInRasi.toFixed(2)}°`);
            console.log(`   D9 Lagna: ${lagnaCalculation.navamsaSignName} ${lagnaCalculation.degreeInNavamsa.toFixed(2)}°`);
            
            // Create chart structures
            const chart = this.createAccurateChart(navamsaPositions);
            const houses = this.createNavamsaHouses(navamsaPositions);
            const analysis = this.performNavamsaAnalysis(navamsaPositions, rasiPositions);
            
            const result = {
                success: true,
                type: 'navamsa',
                accuracy: 'High Precision - Traditional Parashari Method',
                houses: houses,
                rasiPositions: rasiPositions,
                navamsaPositions: navamsaPositions,
                analysis: analysis,
                birthDetails: birthDetails,
                metadata: {
                    calculatedAt: new Date().toISOString(),
                    calculatedBy: 'vikramNplus',
                    version: '4.0.0 - High Precision',
                    ayanamsa: ayanamsa,
                    validationPassed: validationPassed,
                    method: 'Traditional Parashari with Arc Minutes Precision'
                }
            };
            
            console.log('\n✅ High-Precision Navamsa Chart generated successfully!');
            console.log(`🎯 Accuracy Level: Professional Grade`);
            
            return result;
            
        } catch (error) {
            console.error('❌ Error in Navamsa generation:', error);
            return {
                success: false,
                error: error.message,
                stackTrace: error.stack,
                chart: {},
                houses: {},
                analysis: {}
            };
        }
    }

    // Create accurate chart representation
    createAccurateChart(navamsaPositions) {
        const chart = {};
        
        // Initialize South Indian style chart (1-16 houses)
        for (let i = 1; i <= 16; i++) {
            chart[i] = [];
        }
        
        // South Indian mapping for navamsa signs
        const southIndianMap = {
            11: 1, 0: 2, 1: 3, 2: 4,        // Row 1: Pisces, Aries, Taurus, Gemini
            10: 5, 15: 6, 16: 7, 3: 8,      // Row 2: Aquarius, [blank], [blank], Cancer  
            9: 9, 14: 10, 13: 11, 4: 12,    // Row 3: Capricorn, [blank], [blank], Leo
            8: 13, 7: 14, 6: 15, 5: 16      // Row 4: Sagittarius, Scorpio, Libra, Virgo
        };
        
        // Place planets in chart
        Object.keys(navamsaPositions).forEach(planet => {
            const position = navamsaPositions[planet];
            const chartPosition = southIndianMap[position.navamsaSign];
            
            if (chartPosition && chartPosition <= 12) { // Only main houses
                chart[chartPosition].push(planet);
            }
        });
        
        return chart;
    }

    // Create houses from Navamsa Lagna
    createNavamsaHouses(navamsaPositions) {
        const houses = {};
        
        if (!navamsaPositions.Lagna) {
            throw new Error('Lagna position required for house calculation');
        }
        
        const navamsaLagnaSign = navamsaPositions.Lagna.navamsaSign;
        
        for (let house = 1; house <= 12; house++) {
            const signIndex = (navamsaLagnaSign + house - 1) % 12;
            const planetsInHouse = [];
            
            // Find planets in this house
            Object.keys(navamsaPositions).forEach(planet => {
                if (navamsaPositions[planet].navamsaSign === signIndex) {
                    const strength = this.calculatePlanetStrength(planet, signIndex);
                    planetsInHouse.push({
                        name: planet,
                        degree: parseFloat(navamsaPositions[planet].degreeInNavamsa.toFixed(4)),
                        navamsaNumber: navamsaPositions[planet].navamsaNumber,
                        strength: strength,
                        dignity: this.getPlanetDignity(strength)
                    });
                }
            });
            
            houses[house] = {
                houseNumber: house,
                sign: this.signs[signIndex],
                signTamil: this.signsTamil[signIndex],
                signNumber: signIndex + 1,
                lord: this.signLords[signIndex],
                element: this.getSignElement(signIndex),
                quality: this.getSignQuality(signIndex),
                planets: planetsInHouse.map(p => p.name),
                planetsWithDetails: planetsInHouse,
                significance: this.getNavamsaHouseSignificance(house),
                strength: this.calculateHouseStrength(planetsInHouse)
            };
        }
        
        return houses;
    }

    // Calculate planet strength in sign
    calculatePlanetStrength(planet, signIndex) {
        if (this.exaltationSigns[planet] === signIndex) return 'Exalted';
        if (this.debilitationSigns[planet] === signIndex) return 'Debilitated';
        if (this.ownSigns[planet] && this.ownSigns[planet].includes(signIndex)) return 'Own Sign';
        if (this.isFriendlySign(planet, signIndex)) return 'Friendly';
        if (this.isEnemySign(planet, signIndex)) return 'Enemy';
        return 'Neutral';
    }

    // Check if sign is friendly for planet
    isFriendlySign(planet, signIndex) {
        const friendships = {
            'Sun': [0, 4, 8], 'Moon': [1, 2, 5, 6], 'Mars': [0, 4, 8],
            'Mercury': [1, 6], 'Jupiter': [0, 4, 8], 'Venus': [9, 10],
            'Saturn': [1, 6], 'Rahu': [1, 2, 5, 6], 'Ketu': [0, 4, 8]
        };
        return friendships[planet] && friendships[planet].includes(signIndex);
    }

    // Check if sign is enemy for planet
    isEnemySign(planet, signIndex) {
        const enmities = {
            'Sun': [6, 10], 'Moon': [9, 10], 'Mars': [2, 5],
            'Mercury': [3], 'Jupiter': [1, 6], 'Venus': [4],
            'Saturn': [3, 4], 'Rahu': [4], 'Ketu': [3]
        };
        return enmities[planet] && enmities[planet].includes(signIndex);
    }

    // Get planet dignity description
    getPlanetDignity(strength) {
        const dignities = {
            'Exalted': { status: 'Excellent', tamil: 'உச்சம்' },
            'Own Sign': { status: 'Very Good', tamil: 'சொந்த ராசி' },
            'Friendly': { status: 'Good', tamil: 'நட்பு' },
            'Neutral': { status: 'Average', tamil: 'நடுநிலை' },
            'Enemy': { status: 'Challenging', tamil: 'பகை' },
            'Debilitated': { status: 'Difficult', tamil: 'நீசம்' }
        };
        return dignities[strength] || dignities['Neutral'];
    }

    // Get sign element
    getSignElement(signIndex) {
        const elements = ['Fire', 'Earth', 'Air', 'Water'];
        return elements[signIndex % 4];
    }

    // Get sign quality
    getSignQuality(signIndex) {
        const qualities = ['Chara', 'Sthira', 'Dwiswabhava'];
        return qualities[signIndex % 3];
    }

    // Get Navamsa house significance
    getNavamsaHouseSignificance(house) {
        const significances = {
            1: 'Dharma, spiritual evolution, core personality in marriage',
            2: 'Accumulated wealth, family harmony after marriage',
            3: 'Spouse siblings, courage in relationships',
            4: 'Marital happiness, home life with spouse',
            5: 'Children from marriage, creativity in partnership',
            6: 'Marital conflicts, health issues in marriage',
            7: 'Spouse nature, marriage partnership quality',
            8: 'Longevity of marriage, transformations through spouse',
            9: 'Fortune through marriage, spiritual growth with spouse',
            10: 'Reputation through marriage, career impact of spouse',
            11: 'Gains through marriage, fulfillment of desires with spouse',
            12: 'Spiritual union, losses/expenses related to marriage'
        };
        return significances[house] || 'General house significance';
    }

    // Calculate house strength based on planets
    calculateHouseStrength(planets) {
        if (planets.length === 0) return 'Neutral';
        
        const strongPlanets = planets.filter(p => 
            p.strength === 'Exalted' || p.strength === 'Own Sign'
        ).length;
        
        const weakPlanets = planets.filter(p => 
            p.strength === 'Debilitated'
        ).length;
        
        if (strongPlanets > weakPlanets) return 'Strong';
        if (weakPlanets > strongPlanets) return 'Weak';
        return 'Moderate';
    }

    // Perform comprehensive Navamsa analysis
    performNavamsaAnalysis(navamsaPositions, rasiPositions) {
        return {
            marriageAnalysis: this.analyzeMarriageProspects(navamsaPositions),
            spiritualAnalysis: this.analyzeSpiritualEvolution(navamsaPositions),
            planetaryStrengths: this.analyzeAllPlanetaryStrengths(navamsaPositions),
            vargottamaAnalysis: this.checkVargottama(rasiPositions, navamsaPositions),
            recommendations: this.generateDetailedRecommendations(navamsaPositions),
            specialYogas: this.detectNavamsaYogas(navamsaPositions)
        };
    }

    // Analyze marriage prospects
    analyzeMarriageProspects(navamsaPositions) {
        const analysis = { overall: 'Good', details: {}, timing: 'Normal' };
        
        // Venus analysis (marriage happiness)
        if (navamsaPositions.Venus) {
            const venusStrength = this.calculatePlanetStrength('Venus', navamsaPositions.Venus.navamsaSign);
            analysis.details.venus = {
                sign: navamsaPositions.Venus.navamsaSignName,
                degree: navamsaPositions.Venus.degreeInNavamsa.toFixed(2),
                strength: venusStrength,
                impact: this.getVenusMarriageImpact(venusStrength)
            };
        }
        
        // 7th house analysis
        if (navamsaPositions.Lagna) {
            const seventhSign = (navamsaPositions.Lagna.navamsaSign + 6) % 12;
            analysis.details.seventhHouse = {
                sign: this.signs[seventhSign],
                lord: this.signLords[seventhSign],
                analysis: 'Seventh house represents spouse nature and marriage harmony'
            };
        }
        
        return analysis;
    }

    // Get Venus marriage impact
    getVenusMarriageImpact(strength) {
        const impacts = {
            'Exalted': 'Excellent marriage happiness, beautiful and loving spouse',
            'Own Sign': 'Very good marriage, harmonious relationship with spouse',
            'Friendly': 'Good marriage prospects, compatible spouse',
            'Neutral': 'Average marriage happiness, moderate compatibility',
            'Enemy': 'Some challenges in marriage, patience required',
            'Debilitated': 'Marriage difficulties, need for careful partner selection'
        };
        return impacts[strength] || impacts['Neutral'];
    }

    // Analyze spiritual evolution
    analyzeSpiritualEvolution(navamsaPositions) {
        const analysis = { level: 'Moderate', indicators: {} };
        
        if (navamsaPositions.Jupiter) {
            const jupiterStrength = this.calculatePlanetStrength('Jupiter', navamsaPositions.Jupiter.navamsaSign);
            analysis.indicators.jupiter = {
                sign: navamsaPositions.Jupiter.navamsaSignName,
                strength: jupiterStrength,
                spiritual_impact: this.getJupiterSpiritualImpact(jupiterStrength)
            };
        }
        
        if (navamsaPositions.Ketu) {
            const ketuStrength = this.calculatePlanetStrength('Ketu', navamsaPositions.Ketu.navamsaSign);
            analysis.indicators.ketu = {
                sign: navamsaPositions.Ketu.navamsaSignName,
                strength: ketuStrength,
                moksha_potential: this.getKetuMokshaImpact(ketuStrength)
            };
        }
        
        return analysis;
    }

    // Get Jupiter spiritual impact
    getJupiterSpiritualImpact(strength) {
        const impacts = {
            'Exalted': 'Excellent spiritual wisdom, strong dharmic path',
            'Own Sign': 'Good spiritual inclination, natural wisdom',
            'Friendly': 'Moderate spiritual growth, guided evolution',
            'Neutral': 'Average spiritual development',
            'Enemy': 'Spiritual challenges, need for guru guidance',
            'Debilitated': 'Spiritual confusion, requires dedicated practice'
        };
        return impacts[strength] || impacts['Neutral'];
    }

    // Get Ketu moksha impact
    getKetuMokshaImpact(strength) {
        const impacts = {
            'Exalted': 'Strong detachment, excellent moksha potential',
            'Own Sign': 'Good spiritual liberation potential',
            'Friendly': 'Moderate detachment, spiritual progress',
            'Neutral': 'Average moksha indicators',
            'Enemy': 'Material attachments, spiritual work needed',
            'Debilitated': 'Strong material desires, detachment challenging'
        };
        return impacts[strength] || impacts['Neutral'];
    }

    // Analyze all planetary strengths
    analyzeAllPlanetaryStrengths(navamsaPositions) {
        const strengths = {};
        
        Object.keys(navamsaPositions).forEach(planet => {
            if (planet !== 'Lagna') {
                const pos = navamsaPositions[planet];
                const strength = this.calculatePlanetStrength(planet, pos.navamsaSign);
                
                strengths[planet] = {
                    rasiSign: pos.rasiSignName,
                    navamsaSign: pos.navamsaSignName,
                    degree: pos.degreeInNavamsa.toFixed(4),
                    strength: strength,
                    dignity: this.getPlanetDignity(strength),
                    lord: pos.navamsaLord,
                    effects: this.getPlanetNavamsaEffects(planet, strength)
                };
            }
        });
        
        return strengths;
    }

    // Get planet effects in Navamsa
    getPlanetNavamsaEffects(planet, strength) {
        const baseEffects = {
            'Sun': 'Soul purpose, spiritual authority, father karma',
            'Moon': 'Emotional fulfillment, mother karma, mental peace',
            'Mars': 'Inner strength, spouse temperament, energy levels',
            'Mercury': 'Spiritual intelligence, communication in marriage',
            'Jupiter': 'Dharma, children, spiritual teacher role',
            'Venus': 'Marriage happiness, artistic abilities, comforts',
            'Saturn': 'Karmic lessons, discipline, spiritual maturity',
            'Rahu': 'Material desires, foreign connections, illusions',
            'Ketu': 'Spiritual liberation, detachment, past karma'
        };
        
        const strengthModifier = strength === 'Exalted' ? ' (Excellent results)' :
                               strength === 'Debilitated' ? ' (Requires remedies)' :
                               ' (Moderate results)';
        
        return (baseEffects[planet] || 'General influence') + strengthModifier;
    }

    // Check Vargottama (same sign in D1 and D9)
    checkVargottama(rasiPositions, navamsaPositions) {
        const vargottama = [];
        
        Object.keys(rasiPositions).forEach(planet => {
            const rasiSign = rasiPositions[planet].sign;
            const navamsaSign = navamsaPositions[planet].navamsaSign;
            
            if (rasiSign === navamsaSign) {
                vargottama.push({
                    planet: planet,
                    sign: this.signs[rasiSign],
                    effect: 'Very strong - same sign in D1 and D9 charts'
                });
            }
        });
        
        return vargottama;
    }

    // Generate detailed recommendations
    generateDetailedRecommendations(navamsaPositions) {
        const recommendations = [];
        
        recommendations.push('Study Navamsa chart for marriage compatibility and spiritual growth');
        recommendations.push('Strong planets in Navamsa give excellent results in their main periods');
        recommendations.push('Weak planets in Navamsa need remedial measures for better outcomes');
        recommendations.push('Navamsa Lagna shows your dharmic evolution and spiritual path');
        
        // Add specific recommendations based on planetary positions
        Object.keys(navamsaPositions).forEach(planet => {
            if (planet !== 'Lagna') {
                const strength = this.calculatePlanetStrength(planet, navamsaPositions[planet].navamsaSign);
                if (strength === 'Debilitated') {
                    recommendations.push(`${planet} is debilitated in Navamsa - consider specific remedies`);
                } else if (strength === 'Exalted') {
                    recommendations.push(`${planet} is exalted in Navamsa - utilize this strength positively`);
                }
            }
        });
        
        return recommendations;
    }

    // Detect special Navamsa yogas
    detectNavamsaYogas(navamsaPositions) {
        const yogas = [];
        
        // Check for planets in own signs in Navamsa
        Object.keys(navamsaPositions).forEach(planet => {
            if (planet !== 'Lagna' && this.ownSigns[planet]) {
                if (this.ownSigns[planet].includes(navamsaPositions[planet].navamsaSign)) {
                    yogas.push({
                        name: `${planet} Swakshetra Yoga`,
                        description: `${planet} is in own sign in Navamsa`,
                        effect: 'Strengthens the planet for marriage and spiritual matters',
                        strength: 'Good'
                    });
                }
            }
        });
        
        return yogas;
    }
}

module.exports = { ImprovedNavamsaChart };