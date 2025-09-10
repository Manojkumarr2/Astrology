// advancedBehavioralAnalysis.js - Complete Behavioral & Predictive Analysis System

class AdvancedBehavioralAnalyzer {
  constructor() {
    this.signDetails = {
      1: { // Aries
        element: 'Fire', nature: 'Chara', ruler: 'Mars',
        traits: {
          positive: ['leadership', 'courage', 'initiative', 'energy', 'pioneering'],
          negative: ['impulsive', 'aggressive', 'impatient', 'selfish', 'reckless'],
          behavioral: 'Quick to act, natural leader, competitive, direct communication, impatient with delays'
        },
        career: ['military', 'sports', 'entrepreneurship', 'emergency services'],
        relationships: 'Passionate, direct, needs independence, can be dominating',
        health: 'Head injuries, accidents, inflammation, high blood pressure'
      },
      2: { // Taurus
        element: 'Earth', nature: 'Sthira', ruler: 'Venus',
        traits: {
          positive: ['stability', 'patience', 'practicality', 'loyalty', 'sensuality'],
          negative: ['stubbornness', 'materialism', 'laziness', 'possessiveness', 'resistance to change'],
          behavioral: 'Methodical approach, values security, artistic appreciation, slow to anger but explosive when provoked'
        },
        career: ['banking', 'agriculture', 'arts', 'luxury goods', 'real estate'],
        relationships: 'Loyal, possessive, values physical comfort, slow to commit but stable',
        health: 'Throat problems, weight issues, diabetes, neck problems'
      },
      3: { // Gemini
        element: 'Air', nature: 'Dwiswabhava', ruler: 'Mercury',
        traits: {
          positive: ['communication', 'versatility', 'intelligence', 'adaptability', 'wit'],
          negative: ['superficiality', 'inconsistency', 'restlessness', 'gossiping', 'indecision'],
          behavioral: 'Curious mind, excellent communicator, multitasker, needs mental stimulation, changeable moods'
        },
        career: ['journalism', 'sales', 'teaching', 'writing', 'technology'],
        relationships: 'Needs intellectual connection, flirtatious, can be emotionally detached',
        health: 'Respiratory issues, nervous disorders, hand/arm problems'
      },
      4: { // Cancer
        element: 'Water', nature: 'Chara', ruler: 'Moon',
        traits: {
          positive: ['nurturing', 'intuition', 'empathy', 'loyalty', 'protectiveness'],
          negative: ['moodiness', 'oversensitivity', 'clinginess', 'manipulation', 'pessimism'],
          behavioral: 'Emotional responses, family-oriented, intuitive decisions, protective of loved ones, cyclical moods'
        },
        career: ['healthcare', 'hospitality', 'real estate', 'food industry', 'counseling'],
        relationships: 'Nurturing, needs emotional security, can be clingy, devoted partner',
        health: 'Stomach problems, breast issues, water retention, digestive disorders'
      },
      5: { // Leo
        element: 'Fire', nature: 'Sthira', ruler: 'Sun',
        traits: {
          positive: ['confidence', 'creativity', 'generosity', 'leadership', 'warmth'],
          negative: ['arrogance', 'drama', 'attention-seeking', 'stubbornness', 'vanity'],
          behavioral: 'Natural performer, needs recognition, generous spirit, dramatic expression, fixed opinions'
        },
        career: ['entertainment', 'politics', 'management', 'arts', 'luxury services'],
        relationships: 'Romantic, generous, needs admiration, can be self-centered',
        health: 'Heart problems, spine issues, high fever, circulation problems'
      },
      6: { // Virgo
        element: 'Earth', nature: 'Dwiswabhava', ruler: 'Mercury',
        traits: {
          positive: ['analytical', 'practical', 'helpful', 'organized', 'perfectionist'],
          negative: ['critical', 'worry', 'nitpicking', 'pessimism', 'self-criticism'],
          behavioral: 'Detail-oriented, service-minded, health-conscious, systematic approach, tends to worry'
        },
        career: ['healthcare', 'analysis', 'administration', 'research', 'service industries'],
        relationships: 'Practical in love, helpful partner, can be critical, slow to express emotions',
        health: 'Digestive issues, nervous disorders, skin problems, nutritional deficiencies'
      },
      7: { // Libra
        element: 'Air', nature: 'Chara', ruler: 'Venus',
        traits: {
          positive: ['diplomacy', 'balance', 'aesthetics', 'cooperation', 'charm'],
          negative: ['indecision', 'superficiality', 'codependency', 'avoidance', 'vanity'],
          behavioral: 'Seeks harmony, diplomatic approach, aesthetic appreciation, indecisive nature, people-pleasing'
        },
        career: ['law', 'diplomacy', 'arts', 'counseling', 'fashion'],
        relationships: 'Partnership-oriented, romantic, needs balance, can lose identity in relationships',
        health: 'Kidney problems, lower back pain, skin issues, hormonal imbalances'
      },
      8: { // Scorpio
        element: 'Water', nature: 'Sthira', ruler: 'Mars',
        traits: {
          positive: ['intensity', 'transformation', 'intuition', 'determination', 'depth'],
          negative: ['jealousy', 'secretiveness', 'revenge', 'obsession', 'manipulation'],
          behavioral: 'Intense emotions, transformative experiences, secretive nature, all-or-nothing approach, powerful intuition'
        },
        career: ['investigation', 'psychology', 'surgery', 'research', 'occult studies'],
        relationships: 'Intense, passionate, jealous, needs deep connection, transformative relationships',
        health: 'Reproductive issues, chronic diseases, accidents, psychological problems'
      },
      9: { // Sagittarius
        element: 'Fire', nature: 'Dwiswabhava', ruler: 'Jupiter',
        traits: {
          positive: ['optimism', 'philosophy', 'adventure', 'honesty', 'freedom'],
          negative: ['tactlessness', 'restlessness', 'overconfidence', 'carelessness', 'dogmatism'],
          behavioral: 'Philosophical outlook, love of freedom, direct communication, adventurous spirit, teaching tendency'
        },
        career: ['education', 'travel', 'publishing', 'law', 'philosophy'],
        relationships: 'Needs freedom, honest communication, can be commitment-phobic, philosophical discussions',
        health: 'Hip problems, liver issues, accidents while traveling, weight gain'
      },
      10: { // Capricorn
        element: 'Earth', nature: 'Chara', ruler: 'Saturn',
        traits: {
          positive: ['ambition', 'discipline', 'responsibility', 'perseverance', 'structure'],
          negative: ['pessimism', 'coldness', 'materialism', 'authoritarianism', 'depression'],
          behavioral: 'Goal-oriented, systematic approach, serious demeanor, delayed gratification, climbing social ladder'
        },
        career: ['management', 'government', 'engineering', 'mining', 'administration'],
        relationships: 'Traditional approach, serious about commitment, can be emotionally distant, provider mentality',
        health: 'Bone problems, arthritis, depression, skin issues, dental problems'
      },
      11: { // Aquarius
        element: 'Air', nature: 'Sthira', ruler: 'Saturn',
        traits: {
          positive: ['innovation', 'humanitarian', 'independence', 'originality', 'friendship'],
          negative: ['detachment', 'rebellion', 'unpredictability', 'aloofness', 'stubbornness'],
          behavioral: 'Forward-thinking, socially conscious, emotionally detached, unconventional approach, group-oriented'
        },
        career: ['technology', 'social work', 'science', 'astrology', 'humanitarian work'],
        relationships: 'Friendship-based, needs independence, can be emotionally aloof, unconventional partnerships',
        health: 'Circulatory problems, ankle issues, nervous disorders, unusual diseases'
      },
      12: { // Pisces
        element: 'Water', nature: 'Dwiswabhava', ruler: 'Jupiter',
        traits: {
          positive: ['compassion', 'intuition', 'creativity', 'spirituality', 'adaptability'],
          negative: ['escapism', 'confusion', 'victim mentality', 'addiction', 'deception'],
          behavioral: 'Highly empathetic, intuitive decisions, imaginative nature, spiritual inclination, boundary issues'
        },
        career: ['arts', 'healing', 'spirituality', 'charity', 'entertainment'],
        relationships: 'Compassionate, intuitive, can be martyrs, needs emotional connection, prone to illusions',
        health: 'Feet problems, addiction issues, immune system weakness, psychological disorders'
      }
    };

    this.planetaryPersonality = {
      Sun: {
        core: 'Self-identity, ego, father influence, authority, vitality',
        behavioral: 'Leadership qualities, self-expression, confidence levels, relationship with authority',
        career: 'Government, management, politics, entertainment, medicine',
        timing: 'Sunday, Leo periods, summer months'
      },
      Moon: {
        core: 'Emotions, mother influence, subconscious mind, habits, nurturing',
        behavioral: 'Emotional responses, mood patterns, nurturing tendencies, domestic inclinations',
        career: 'Healthcare, hospitality, food, real estate, public service',
        timing: 'Monday, Cancer periods, full moon phases'
      },
      Mercury: {
        core: 'Communication, intellect, learning, commerce, siblings',
        behavioral: 'Thinking patterns, communication style, learning ability, business acumen',
        career: 'Writing, teaching, sales, technology, transportation',
        timing: 'Wednesday, Gemini/Virgo periods, mercury transits'
      },
      Venus: {
        core: 'Love, beauty, relationships, luxury, arts',
        behavioral: 'Relationship approach, aesthetic sense, social skills, pleasure-seeking',
        career: 'Arts, fashion, entertainment, luxury goods, counseling',
        timing: 'Friday, Taurus/Libra periods, spring seasons'
      },
      Mars: {
        core: 'Energy, action, courage, anger, sexuality',
        behavioral: 'Drive, aggression, competitive nature, physical energy, conflict resolution',
        career: 'Military, sports, engineering, surgery, police',
        timing: 'Tuesday, Aries/Scorpio periods, summer heat'
      },
      Jupiter: {
        core: 'Wisdom, spirituality, expansion, teaching, luck',
        behavioral: 'Moral compass, philosophical outlook, teaching ability, optimism, spiritual growth',
        career: 'Education, law, philosophy, consulting, religious work',
        timing: 'Thursday, Sagittarius/Pisces periods, Jupiter transits'
      },
      Saturn: {
        core: 'Discipline, limitations, karma, responsibility, structure',
        behavioral: 'Work ethic, handling restrictions, karmic lessons, patience, maturity',
        career: 'Administration, mining, agriculture, elder care, research',
        timing: 'Saturday, Capricorn/Aquarius periods, Saturn returns'
      },
      Rahu: {
        core: 'Material desires, foreign elements, obsessions, innovation',
        behavioral: 'Unconventional pursuits, foreign connections, material ambitions, sudden changes',
        career: 'Technology, foreign trade, unusual professions, media',
        timing: 'Rahu periods, eclipse seasons, foreign travel'
      },
      Ketu: {
        core: 'Spirituality, detachment, past karma, liberation',
        behavioral: 'Spiritual inclinations, detached approach, intuitive insights, karmic patterns',
        career: 'Spirituality, research, occult, healing, liberation work',
        timing: 'Ketu periods, spiritual seasons, meditation retreats'
      }
    };

    this.yogaAnalysis = {
      rajayogas: ['Sun-Jupiter', 'Moon-Jupiter', 'Venus-Jupiter', 'Mercury-Jupiter'],
      dhanyogas: ['Venus-Jupiter', 'Mercury-Venus', 'Moon-Venus'],
      spiritual: ['Jupiter-Ketu', 'Moon-Ketu', 'Sun-Ketu'],
      challenging: ['Saturn-Mars', 'Sun-Saturn', 'Moon-Saturn']
    };

    this.dashaSystem = {
      planetaryPeriods: {
        Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16,
        Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20
      }
    };
  }

  generateComprehensiveAnalysis(chartData) {
    return {
      personalityProfile: this.generateDetailedPersonality(chartData),
      behavioralPatterns: this.analyzeBehavioralPatterns(chartData),
      relationshipAnalysis: this.analyzeRelationships(chartData),
      careerAndFinance: this.analyzeCareerFinance(chartData),
      futureOutlook: this.generateFuturePredictions(chartData),
      remedialMeasures: this.suggestRemedies(chartData),
    };
  }

  generateDetailedPersonality(chartData) {
    const lagna = chartData.lagna;
    const moon = chartData.birthChart.planets.Moon;
    const sun = chartData.birthChart.planets.Sun;
    const lagnaLord = this.getLagnaLord(chartData);
    
    const personalityCore = {
      ascendantPersonality: {
        sign: lagna.name,
        traits: this.signDetails[lagna.number].traits,
        element: lagna.element,
        behavior: this.signDetails[lagna.number].traits.behavioral,
        lifeApproach: this.getLifeApproach(lagna.number),
        physicalAppearance: this.getPhysicalTraits(lagna.number),
      },
      
      mentalMakeup: {
        moonSign: moon.sign,
        emotionalNature: this.signDetails[moon.signNumber].traits.behavioral,
      },
    };

    return personalityCore;
  }

  analyzeBehavioralPatterns(chartData) {
    const patterns = {
      communicationStyle: this.analyzeCommunication(chartData),
      decisionMaking: this.analyzeDecisionMaking(chartData),
      conflictResolution: this.analyzeConflictStyle(chartData),
      socialBehavior: this.analyzeSocialPatterns(chartData),
      workStyle: this.analyzeWorkPatterns(chartData),
      stressResponse: this.analyzeStressPatterns(chartData),
      motivationFactors: this.analyzeMotivation(chartData),
      learningStyle: this.analyzeLearningStyle(chartData)
    };

    return patterns;
  }

  analyzeRelationships(chartData) {
    const venus = chartData.birthChart.planets.Venus;
    const mars = chartData.birthChart.planets.Mars;
    const navamsa = chartData.navamsaChart;

    return {
      loveAndAttraction: {
        venusPosition: this.getVenusAnalysis(venus),
      },
      
      marriageAnalysis: {
        spouseCharacteristics: this.getSpouseTraits(seventhHouse, navamsa),
        marriageTimming: this.getMarriageTimming(chartData),
      },
    
    };
  }


  generateFuturePredictions(chartData) {
    const currentDasha = this.getCurrentDasha(chartData);
    const transits = this.getImportantTransits(chartData);
    
    return {
      next5Years: this.get5YearForecast(chartData, currentDasha),
      next10Years: this.get10YearForecast(chartData),
      lifePhases: this.getLifePhases(chartData),
      majorTransits: this.getMajorTransitEffects(transits),
      
      careerForecast: {
        nextPromotion: this.getProfessionalTimming(chartData),
        careerChanges: this.getCareerChangeTimming(chartData),
        businessOpportunities: this.getBusinessTimming(chartData)
      },
      
      relationshipForecast: {
        marriageTimming: this.getMarriageTimming(chartData),
        relationshipChallenges: this.getRelationshipTimming(chartData),
        familyEvents: this.getFamilyEventTimming(chartData)
      },
      
      financialForecast: {
        wealthPeriods: this.getWealthPeriods(chartData),
        investmentTimming: this.getInvestmentTimming(chartData),
        propertyTimming: this.getPropertyTimming(chartData)
      },
      
      healthForecast: {
        vulnerablePeriods: this.getHealthVulnerablePeriods(chartData),
        recoveryPeriods: this.getHealthRecoveryPeriods(chartData),
        preventiveMeasures: this.getHealthPrevention(chartData)
      },
      
      spiritualForecast: {
        spiritualAwakening: this.getSpiritualAwakeningPeriods(chartData),
        pilgrimageTiming: this.getPilgrimageTiming(chartData),
        guruConnection: this.getGuruConnectionTiming(chartData)
      }
    };
  }

  suggestRemedies(chartData) {
    const weakPlanets = this.getWeakPlanets(chartData);
    const maleficInfluences = this.getMaleficInfluences(chartData);
    
    return {
      planetaryRemedies: this.getPlanetaryRemedies(weakPlanets),
      gemstones: this.getGemstoneRemedies(chartData),
      mantras: this.getMantraRemedies(chartData),
      charityAndDonation: this.getCharityRemedies(chartData),
      lifestyle: this.getLifestyleRemedies(chartData),
      spiritual: this.getSpiritualRemedies(chartData),
      timing: this.getRemedyTiming(chartData)
    };
  }

  // Detailed helper methods (Implementation examples)
  
  getLifeApproach(signNumber) {
    const approaches = {
      1: "Direct, impulsive, leadership-oriented approach to life",
      2: "Steady, practical, security-focused approach",
      3: "Versatile, communicative, mentally-stimulated approach",
      4: "Emotional, nurturing, family-centered approach",
      5: "Creative, confident, recognition-seeking approach",
      6: "Analytical, service-oriented, health-conscious approach",
      7: "Diplomatic, relationship-focused, harmony-seeking approach",
      8: "Intense, transformative, depth-seeking approach",
      9: "Philosophical, adventurous, meaning-seeking approach",
      10: "Ambitious, disciplined, achievement-oriented approach",
      11: "Innovative, humanitarian, group-oriented approach",
      12: "Intuitive, spiritual, compassionate approach"
    };
    return approaches[signNumber];
  }

  getPhysicalTraits(signNumber) {
    const traits = {
      1: "Medium height, athletic build, prominent forehead, energetic presence",
      2: "Sturdy build, attractive features, strong neck, pleasant voice",
      3: "Tall, slender, expressive hands, youthful appearance",
      4: "Round face, prominent chest, soft features, fluctuating weight",
      5: "Impressive stature, strong back, radiant presence, thick hair",
      6: "Medium height, delicate features, health-conscious appearance",
      7: "Well-proportioned, attractive, graceful movements, charming smile",
      8: "Intense eyes, strong body, magnetic presence, distinctive features",
      9: "Tall, athletic, prominent thighs, optimistic expression",
      10: "Lean build, prominent knees, serious expression, ages well",
      11: "Tall, unique features, strong calves, unconventional style",
      12: "Soft features, prominent feet, dreamy eyes, fluid movements"
    };
    return traits[signNumber];
  }

  getCurrentDasha(chartData) {
    // Calculate current Mahadasha and Antardasha
    const birthDate = new Date(chartData.additionalInfo.birthDateTime);
    const now = new Date();
    const ageInYears = (now - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Simplified dasha calculation (in real implementation, use precise Vimshottari calculation)
    const dashaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const dashaPeriods = [7, 20, 6, 10, 7, 18, 16, 19, 17];
    
    let totalYears = 0;
    let currentDasha = '';
    
    for (let i = 0; i < dashaOrder.length; i++) {
      totalYears += dashaPeriods[i];
      if (ageInYears <= totalYears) {
        currentDasha = dashaOrder[i];
        break;
      }
    }
    
    return {
      mahadasha: currentDasha,
      remainingYears: totalYears - ageInYears,
      effects: this.getDashaEffects(currentDasha, chartData)
    };
  }

  get5YearForecast(chartData, currentDasha) {
    const forecast = [];
    const startYear = new Date().getFullYear();
    
    for (let i = 0; i < 5; i++) {
      const year = startYear + i;
      forecast.push({
        year: year,
        theme: this.getYearTheme(year, chartData),
        career: this.getYearCareerForecast(year, chartData),
        relationships: this.getYearRelationshipForecast(year, chartData),
        health: this.getYearHealthForecast(year, chartData),
        finances: this.getYearFinanceForecast(year, chartData),
        opportunities: this.getYearOpportunities(year, chartData),
        challenges: this.getYearChallenges(year, chartData)
      });
    }
    
    return forecast;
  }

  // Additional comprehensive methods would continue here...
  // For brevity, I'm showing the structure. Each method would have detailed implementations.

  getLagnaLord(chartData) {
    const lagnaSign = chartData.lagna.number;
    const rulers = {
      1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
      7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
    };
    
    const rulerPlanet = rulers[lagnaSign];
    const planetData = chartData.birthChart.planets[rulerPlanet];
    
    return {
      planet: rulerPlanet,
      placement: planetData.sign,
      house: planetData.house,
      strength: planetData.shadbala,
      dignity: planetData.dignity
    };
  }

  // Placeholder implementations for comprehensive analysis
  analyzeCommunication(data) { return "Direct and honest communication style with occasional tactlessness"; }
  analyzeDecisionMaking(data) { return "Quick decisions based on intuition and emotions"; }
  analyzeConflictStyle(data) { return "Direct confrontation, prefers to resolve quickly"; }
  analyzeSocialPatterns(data) { return "Selective social circle, loyal friendships"; }
  analyzeWorkPatterns(data) { return "Methodical approach with attention to detail"; }
  analyzeStressPatterns(data) { return "Physical activity and solitude for stress relief"; }
  analyzeMotivation(data) { return "Recognition, security, and personal growth"; }
  analyzeLearningStyle(data) { return "Practical, hands-on learning with real applications"; }
  
  getVenusAnalysis(venus) { return { attraction: "Artistic and refined", needs: "Harmony and beauty" }; }
  getSpouseTraits(house, navamsa) { return "Practical, reliable partner with artistic inclinations"; }
  getMarriageTimming(data) { return "Favorable periods: 25-28 years, 30-32 years"; }
  getNaturalTalents(data) { return ["Leadership", "Communication", "Problem-solving"]; }
  getWealthPotential(second, eleventh) { return "Good earning potential through steady efforts"; }
  
  // Continue with all other method implementations...
}


module.exports = { AdvancedBehavioralAnalyzer };