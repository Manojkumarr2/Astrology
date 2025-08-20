const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const { ImprovedNavamsaChart } = require('./utils/navamsachart'); // Assuming navamsa.js is in the same directory

const { BirthChartGenerator } = require('./utils/birthchart'); // Assuming navamsa.js is in the same directory

const { AccuratePoruthamCalculator } = require('./utils/porutham'); // Assuming porutham.js is in the same directory

const { BehaviorPredictor } = require('./utils/behaviorPredictor');

const { validateInput, createDate, calculatePlanetaryPositions, calculateAscendant, getRashiFromLongitude, getNakshatraFromLongitude, calculateAdditionalDetails } = require('./utils/common'); // Assuming porutham.js is in the same directory


const app = express();


// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {
        errors: [],
        result: null,
        form: {},
        title: 'CKC Astrology Portal'
    });
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Vedic Astrology Data

// Utility Functions



// Main calculation endpoint
app.post('/api/astrology/calculate', async (req, res) => {
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

        console.log(date, inputData.latitude, inputData.longitude);



        const { positions, ayanamsa } = calculatePlanetaryPositions(date, inputData.latitude, inputData.longitude);
        const ascendant = calculateAscendant(date, inputData.latitude, inputData.longitude);

        // Calculate Moon's rashi and nakshatra
        const moonLongitude = positions.Moon.longitude;
        const rashi = getRashiFromLongitude(moonLongitude);
        const nakshatra = getNakshatraFromLongitude(moonLongitude);

        // Calculate Lagna
        const lagna = getRashiFromLongitude(ascendant);


        console.log(positions);
        console.log(ayanamsa);
        console.log(ascendant);

        

        // Generate birth chart
        const birthChartGenerator = new BirthChartGenerator();


          const maandhiLongitude = birthChartGenerator.calculateAccurateMaandhi(
            date,
            inputData.latitude,
            inputData.longitude,
            calculateAscendant
        );

        // 2) Add Maandhi into planetary positions before generating chart
        //    Option A: as 'Maandhi'
        birthChartGenerator.addMaandhiToPositions(positions, {
            name: 'Maandhi',
            longitude: maandhiLongitude
        });

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
                birthChart: birthChart,
                navamsaChart: navamsaChart,
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

app.post('/api/compare-jadhagam-porutham', async (req, res) => {
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

        // Create AccuratePoruthamCalculator instance
        const poruthamCalculator = new AccuratePoruthamCalculator();

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

        console.log(`[${new Date().toISOString()}] Starting Porutham analysis by vikramNplus`);
        console.log(`Comparing charts for ${date1.toISOString()} and ${date2.toISOString()}`);

        // Prepare person data in the correct format for the calculator
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

        // Calculate compatibility - use simplified or full analysis
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

        console.log(`[${new Date().toISOString()}] Porutham analysis completed successfully by vikramNplus`);
        res.json(response);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in Porutham comparison by vikramNplus:`, error);
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

app.post('/api/behavior', async (req, res) => {
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

        console.log(date, inputData.latitude, inputData.longitude);

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

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});


app.listen(PORT, () => {
    console.log(`🌟 Vedic Astrology API server running on port ${PORT}`);
    console.log(`🔮 Main endpoint: POST http://localhost:${PORT}/api/astrology/calculate`);
    console.log(`📖 Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`⭐ Test with your birth data: node test-api.js`);
});

module.exports = app;