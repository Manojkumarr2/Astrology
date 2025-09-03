const { validateInput, createDate, calculatePlanetaryPositions, 
        calculateAscendant, getRashiFromLongitude, getNakshatraFromLongitude, 
        calculateAdditionalDetails } = require('./utils/common');
const { BirthChartGenerator } = require('./utils/birthchart');
const { BehaviorPredictor } = require('./utils/behaviorPredictor');

module.exports = (api) => {
  const router = require('express').Router();
  
  // Behavior prediction endpoint
  router.post('/predict', async (req, res) => {
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

      // Additional calculations
      const additionalDetails = calculateAdditionalDetails(positions, rashi, lagna);

      // Create an instance of the predictor
      const predictor = new BehaviorPredictor();

      // Call the prediction method
      const result = predictor.generateBehaviorPredictions(
        birthChart,
        {
          ayanamsa: Math.round(ayanamsa * 1000) / 1000,
          ascendant: Math.round(ascendant * 100) / 100,
          rawPositions: Object.fromEntries(
            Object.entries(positions).map(([planet, data]) => [
              planet,
              Math.round(data.longitude * 100) / 100
            ])
          )
        },
        ascendant,
        {
          ...additionalDetails,
          birthDateTime: date.toISOString(),
          coordinates: {
            latitude: inputData.latitude,
            longitude: inputData.longitude
          },
          timezone: inputData.timezone
        }
      );

      // Send back the prediction result
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  return router;
};