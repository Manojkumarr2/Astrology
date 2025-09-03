const { AccuratePoruthamCalculator } = require('./utils/porutham');

module.exports = (api) => {
  const router = require('express').Router();
  const poruthamCalculator = new AccuratePoruthamCalculator();
  
  // Porutham comparison endpoint
  router.post('/compare', async (req, res) => {
    try {
      const {
        person1: {
          name: name1,
          gender: gender1,
          birthDate: birthDate1,
          birthTime: birthTime1,
          latitude: lat1,
          longitude: lng1
        },
        person2: {
          name: name2,
          gender: gender2,
          birthDate: birthDate2,
          birthTime: birthTime2,
          latitude: lat2,
          longitude: lng2
        },
        detailedAnalysis = true,
        includeRemedies = true,
        exportFormat = 'json',
        simplified = false
      } = req.body;

      // Validate required fields
      if (!name1 || !name2 || !birthDate1 || !birthDate2 || !birthTime1 || !birthTime2) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields for compatibility analysis',
          required: ['person1.name', 'person1.birthDate', 'person1.birthTime', 'person2.name', 'person2.birthDate', 'person2.birthTime'],
          providedBy: 'vikramNplus',
          timestamp: new Date().toISOString()
        });
      }

      // Validate gender values
      const validGenders = ['male', 'female', 'M', 'F', 'm', 'f'];
      if (!validGenders.includes(gender1) || !validGenders.includes(gender2)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender values. Use: male, female, M, F, m, or f',
          providedBy: 'vikramNplus',
          timestamp: new Date().toISOString()
        });
      }

      // Create Date objects for both persons
      const date1 = new Date(`${birthDate1}T${birthTime1}`);
      const date2 = new Date(`${birthDate2}T${birthTime2}`);

      // Validate dates
      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD for date and HH:MM for time',
          providedBy: 'vikramNplus',
          timestamp: new Date().toISOString()
        });
      }

      // Prepare person data
      const person1Data = {
        name: name1,
        gender: gender1.toLowerCase(),
        date: date1,
        latitude: lat1 || 13.0827,
        longitude: lng1 || 80.2707
      };

      const person2Data = {
        name: name2,
        gender: gender2.toLowerCase(),
        date: date2,
        latitude: lat2 || 13.0827,
        longitude: lng2 || 80.2707
      };

      // Calculate compatibility
      let result;
      if (simplified) {
        result = await poruthamCalculator.getSimplifiedCompatibility(person1Data, person2Data);
      } else {
        result = await poruthamCalculator.calculatePortuthamWithValidation(person1Data, person2Data);
      }

      // Check if calculation was successful
      if (!result.success) {
        return res.status(422).json({
          success: false,
          message: 'Failed to calculate Porutham compatibility',
          error: result.error,
          details: result.details,
          providedBy: 'vikramNplus',
          timestamp: result.timestamp || new Date().toISOString()
        });
      }

      let response;

      if (simplified) {
        // Return simplified response
        response = {
          success: true,
          type: 'simplified',
          data: {
            persons: {
              person1: {
                name: name1,
                gender: gender1,
                birthDate: birthDate1,
                birthTime: birthTime1,
                coordinates: { latitude: person1Data.latitude, longitude: person1Data.longitude }
              },
              person2: {
                name: name2,
                gender: gender2,
                birthDate: birthDate2,
                birthTime: birthTime2,
                coordinates: { latitude: person2Data.latitude, longitude: person2Data.longitude }
              }
            },
            simplified: result.simplified,
            metadata: {
              calculatedAt: result.timestamp,
              calculatedBy: 'vikramNplus',
              version: '3.0.0',
              type: 'simplified_analysis'
            }
          }
        };
      } else {
        // Extract comprehensive data from result
        const { person1Chart, person2Chart, poruthams, compatibility, analysis, categoryCompatibility, marriageTiming } = result.data;

        // Format comprehensive response
        response = {
          success: true,
          type: 'comprehensive',
          data: {
            persons: {
              person1: {
                name: name1,
                gender: gender1,
                birthDate: birthDate1,
                birthTime: birthTime2,
                coordinates: { latitude: person1Data.latitude, longitude: person1Data.longitude }
              },
              person2: {
                name: name2,
                gender: gender2,
                birthDate: birthDate2,
                birthTime: birthTime2,
                coordinates: { latitude: person2Data.latitude, longitude: person2Data.longitude }
              }
            },
            compatibility: {
              overallPercentage: compatibility.percentage,
              overallGrade: compatibility.grade,
              recommendationStatus: compatibility.status,
              totalScore: compatibility.totalScore,
              maxPossibleScore: compatibility.maxScore,
              weightedCalculation: compatibility.weightedCalculation || false
            },
            poruthams: poruthams,
            charts: {
              person1: {
                moonSign: person1Chart.moonSign,
                moonNakshatra: person1Chart.moonNakshatra,
                ascendant: person1Chart.ascendant,
                ayanamsa: person1Chart.ayanamsa,
                accuracy: person1Chart.accuracy,
                houses: detailedAnalysis ? person1Chart.houses : undefined,
                planets: detailedAnalysis ? person1Chart.planets : undefined
              },
              person2: {
                moonSign: person2Chart.moonSign,
                moonNakshatra: person2Chart.moonNakshatra,
                ascendant: person2Chart.ascendant,
                ayanamsa: person2Chart.ayanamsa,
                accuracy: person2Chart.accuracy,
                houses: detailedAnalysis ? person2Chart.houses : undefined,
                planets: detailedAnalysis ? person2Chart.planets : undefined
              }
            },
            analysis: detailedAnalysis ? analysis : {
              overallAssessment: analysis.overallAssessment,
              marriageRecommendation: analysis.marriageRecommendation
            },
            categoryCompatibility: categoryCompatibility,
            marriageTiming: marriageTiming,
            remedialMeasures: includeRemedies ? analysis.remedialMeasures : undefined,
            metadata: {
              calculatedAt: result.data.calculatedAt,
              calculatedBy: 'vikramNplus',
              version: '3.0.0',
              processingTime: Date.now() - req.startTime,
              type: 'comprehensive_analysis',
              validation: result.data.validation
            }
          }
        };
      }

      // Export in requested format
      if (exportFormat !== 'json') {
        const exportedData = poruthamCalculator.exportResults(response, exportFormat);

        if (exportFormat === 'html') {
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Content-Disposition', `attachment; filename="porutham-report-${Date.now()}.html"`);
        } else if (exportFormat === 'text') {
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', `attachment; filename="porutham-report-${Date.now()}.txt"`);
        } else if (exportFormat === 'csv') {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="porutham-report-${Date.now()}.csv"`);
        }

        return res.send(exportedData);
      }

      res.json(response);

    } catch (error) {
      console.error('Error in Porutham comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during compatibility analysis',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        providedBy: 'vikramNplus',
        requestId: req.id || 'unknown'
      });
    }
  });
  
  return router;
};