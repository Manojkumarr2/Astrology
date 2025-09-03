const { validateInput, createDate, calculatePlanetaryPositions, 
        calculateAscendant, getRashiFromLongitude, getNakshatraFromLongitude, 
        calculateAdditionalDetails } = require('./utils/common');
const { BirthChartGenerator } = require('./utils/birthchart');
const { ImprovedNavamsaChart } = require('./utils/navamsachart');

module.exports = (api) => {
  const router = require('express').Router();
  
  // Main calculation endpoint
  router.post('/calculate', async (req, res) => {
    try {
      const inputData = req.body;
      const errors = validateInput(inputData);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: errors
        });
      }

      const date = createDate(
        inputData.year,
        inputData.month,
        inputData.day,
        inputData.hour,
        inputData.minute,
        inputData.timezone
      );

      const { positions, ayanamsa } = calculatePlanetaryPositions(date, inputData.latitude, inputData.longitude);
      const ascendant = calculateAscendant(date, inputData.latitude, inputData.longitude);

      // Calculate Moon's rashi and nakshatra
      const moonLongitude = positions.Moon.longitude;
      const rashi = getRashiFromLongitude(moonLongitude);
      const nakshatra = getNakshatraFromLongitude(moonLongitude);

      // Calculate Lagna
      const lagna = getRashiFromLongitude(ascendant);

      // Generate birth chart
      const birthChartGenerator = new BirthChartGenerator();
      const birthChart = birthChartGenerator.generateBirthChart(positions, ascendant);

      // Generate navamsa chart
      const navamsa = new ImprovedNavamsaChart();
      const navamsaChart = navamsa.generateNavamsaChart(
        Object.fromEntries(
          Object.entries(positions).map(([planet, data]) => [planet, data.longitude])
        ),
        ayanamsa,
        ascendant,
        {
          date: `${inputData.year}-${String(inputData.month).padStart(2, '0')}-${String(inputData.day).padStart(2, '0')}`,
          time: `${String(inputData.hour).padStart(2, '0')}:${String(inputData.minute).padStart(2, '0')}`,
          latitude: inputData.latitude,
          longitude: inputData.longitude,
          timezone: inputData.timezone
        }
      );

      // Transform charts for response
      const transformedBirthChart = {
        ...birthChart,
        houses: Object.values(birthChart.houses).sort((a, b) => a.signNumber - b.signNumber)
      };

      const transformedNavamsaChart = {
        ...navamsaChart,
        houses: Object.values(navamsaChart.houses).sort((a, b) => a.signNumber - b.signNumber)
      };

      // Additional calculations
      const additionalDetails = calculateAdditionalDetails(positions, rashi, lagna);

      const response = {
        success: true,
        data: {
          rasi: {
            name: rashi.name,
            number: rashi.number,
            lord: rashi.lord,
            element: rashi.element,
            english: rashi.english,
            degree: Math.round((moonLongitude % 30) * 100) / 100
          },
          nakshatra: {
            name: nakshatra.name,
            number: nakshatra.number,
            lord: nakshatra.lord,
            pada: nakshatra.pada,
            rashi: nakshatra.rashi,
            deity: nakshatra.deity
          },
          lagna: {
            name: lagna.name,
            number: lagna.number,
            lord: lagna.lord,
            element: lagna.element,
            english: lagna.english,
            degree: Math.round((ascendant % 30) * 100) / 100
          },
          birthChart: transformedBirthChart,
          navamsaChart: transformedNavamsaChart,
          planetaryPositions: {
            ayanamsa: Math.round(ayanamsa * 1000) / 1000,
            ascendant: Math.round(ascendant * 100) / 100,
            rawPositions: Object.fromEntries(
              Object.entries(positions).map(([planet, data]) => [
                planet,
                Math.round(data.longitude * 100) / 100
              ])
            )
          },
          additionalInfo: {
            ...additionalDetails,
            birthDateTime: date.toISOString(),
            coordinates: {
              latitude: inputData.latitude,
              longitude: inputData.longitude
            },
            timezone: inputData.timezone
          }
        },
        inputData: {
          birthDate: `${inputData.year}-${String(inputData.month).padStart(2, '0')}-${String(inputData.day).padStart(2, '0')}T${String(inputData.hour).padStart(2, '0')}:${String(inputData.minute).padStart(2, '0')}:00`,
          coordinates: {
            latitude: inputData.latitude,
            longitude: inputData.longitude
          },
          timezone: inputData.timezone
        },
      };

      res.json(response);

    } catch (error) {
      console.error('Calculation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during calculation',
        message: error.message
      });
    }
  });
  
  return router;
};