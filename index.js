const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const { ImprovedNavamsaChart } = require('./utils/navamsachart'); // Assuming navamsa.js is in the same directory

const { BirthChartGenerator } = require('./utils/birthchart'); // Assuming navamsa.js is in the same directory

const { AccuratePoruthamCalculator } = require('./utils/porutham'); // Assuming porutham.js is in the same directory

const { BehaviorPredictor } = require('./utils/behaviorPredictor');

const { validateInput, createDate, calculatePlanetaryPositions, calculateAscendant, getRashiFromLongitude, getNakshatraFromLongitude, calculateAdditionalDetails } = require('./utils/common'); // Assuming porutham.js is in the same directory


const { Country, State, City } = require('country-state-city');
const geoTz = require('geo-tz');
const moment = require('moment-timezone');

const app = express();

const cache = new NodeCache({ stdTTL: 3600 });
// Rate limiting: 100 requests per 15 minutes per IP
const locationRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: 'Too many location requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(locationRateLimit);


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
        console.log("inputData:", inputData);
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

        console.log("inputData:", inputData);

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


        // Transform birthChart houses from object to array based on signNumber
        const transformedBirthChart = {
            ...birthChart,
            houses: Object.values(birthChart.houses).sort((a, b) => a.signNumber - b.signNumber)
        };

        // Transform navamsaChart houses from object to array based on signNumber
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


// Get all countries
app.get('/api/countries', (req, res) => {
    try {
        const countries = Country.getAllCountries();
        const formattedCountries = countries.map(country => ({
            id: country.isoCode,
            name: country.name,
            code: country.isoCode
        }));
        res.json(formattedCountries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get states by country
app.get('/api/states/:countryId', (req, res) => {
    try {
        const { countryId } = req.params;
        const states = State.getStatesOfCountry(countryId);
        const formattedStates = states.map(state => ({
            id: state.isoCode,
            name: state.name,
            code: state.isoCode,
            countryCode: state.countryCode
        }));
        res.json(formattedStates);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ error: 'Failed to fetch states' });
    }
});

// Get cities by state
app.get('/api/cities/:stateId/:countryId', (req, res) => {
    try {
        const { stateId, countryId } = req.params;

        console.log('Fetching cities for state:', stateId, 'in country:', countryId);
        const cities = City.getCitiesOfState(countryId, stateId);
        const formattedCities = cities.map(city => ({
            id: city.name,
            name: city.name,
            latitude: parseFloat(city.latitude) || 0,
            longitude: parseFloat(city.longitude) || 0,
            stateCode: city.stateCode,
            countryCode: city.countryCode
        }));
        res.json(formattedCities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// Geocoding endpoint for manual location input
app.get('/api/geocode', async (req, res) => {
    try {
        const { location } = req.query;
        const fetch = require('node-fetch'); // You may need to install: npm install node-fetch@2

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            const latitude = parseFloat(result.lat);
            const longitude = parseFloat(result.lon);

            // Get timezone
            const timezone = getTimezoneFromCoords(latitude, longitude);

            res.json({
                success: true,
                coordinates: { latitude, longitude },
                timezone: timezone,
                address: result.display_name
            });
        } else {
            res.json({
                success: false,
                error: 'Location not found'
            });
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({
            success: false,
            error: 'Geocoding service error'
        });
    }
});

// Reverse geocoding endpoint for current location
app.get('/api/reverse-geocode', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const fetch = require('node-fetch');

        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.address) {
            const address = data.address;
            const timezone = getTimezoneFromCoords(parseFloat(lat), parseFloat(lng));

            res.json({
                success: true,
                location: {
                    country: address.country || '',
                    state: address.state || address.region || '',
                    city: address.city || address.town || address.village || ''
                },
                timezone: timezone,
                fullAddress: data.display_name
            });
        } else {
            res.json({
                success: false,
                error: 'Unable to reverse geocode location'
            });
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        res.status(500).json({
            success: false,
            error: 'Reverse geocoding service error'
        });
    }
});

// Get timezone for coordinates
app.get('/api/timezone', (req, res) => {
    try {
        const { lat, lng } = req.query;
        const timezone = getTimezoneFromCoords(parseFloat(lat), parseFloat(lng));

        console.log(`Timezone for ${lat}, ${lng}: ${timezone}`);

        res.json({
            timezone: timezone,
            timezoneName: getTimezoneNameFromOffset(timezone)
        });
    } catch (error) {
        console.error('Timezone error:', error);
        res.status(500).json({
            timezone: 5.5, // Default to IST
            timezoneName: 'Asia/Kolkata'
        });
    }
});



// Enhanced timezone function that considers historical dates
function getTimezoneFromCoords(lat, lng, date = new Date()) {
    try {
        // Use geo-tz library for accurate timezone detection
        const timeZone = geoTz.find(lat, lng)[0];

        console.log(`Timezone for ${lat}, ${lng}: ${timeZone}`);

        if (timeZone) {
            // Get the offset for the SPECIFIC DATE in this timezone
            const offset = moment.tz(moment(date), timeZone).utcOffset() / 60;
            console.log(`Accurate timezone for ${lat}, ${lng} on ${moment(date).format('YYYY-MM-DD')}: ${timeZone} (offset: ${offset})`);
            return offset;
        }
    } catch (error) {
        console.error('Error with geo-tz:', error);
    }

    // Fallback to manual mapping for common locations - also pass the date
    return getTimezoneFromCoordsManual(lat, lng, date);
}

// Enhanced manual timezone detection with historical awareness
function getTimezoneFromCoordsManual(lat, lng, date = new Date()) {
    console.log(`Manual timezone calculation for lat: ${lat}, lng: ${lng}, date: ${moment(date).format('YYYY-MM-DD')}`);

    // Convert date to year for historical checks
    const year = moment(date).year();
    const month = moment(date).month() + 1; // 1-12

    // Apply historical timezone rules

    // India (standardized timezone in 1955)
    if (lat >= 6.0 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5) {
        // Before 1955, India had multiple time zones
        if (year < 1955) {
            // Bombay Time (GMT+4:51)
            if (lng < 77.0) return 4.85;
            // Calcutta Time (GMT+5:53)
            if (lng > 82.0) return 5.88;
            // Otherwise standard IST
        }
        console.log('Detected: India timezone');
        return 5.5; // IST (UTC+05:30)
    }

    // China standardized to one timezone in 1949
    if (lat >= 15.0 && lat <= 54.0 && lng >= 73.0 && lng <= 135.0) {
        if (year < 1949) {
            // Pre-1949 China had 5 time zones
            if (lng < 82.5) return 6; // Kunlun Time Zone
            if (lng < 97.5) return 7; // Tianshan Time Zone
            if (lng < 112.5) return 8; // Changbai Time Zone
            if (lng < 127.5) return 9; // Taipei Time Zone
            return 10; // Far Eastern Zone
        }
        console.log('Detected: China timezone');
        return 8; // CST (UTC+08:00)
    }

    // United States - need to check DST historically
    if (lat >= 25.0 && lat <= 72.0 && lng >= -180.0 && lng <= -66.0) {
        let baseOffset = 0;
        // Determine base timezone
        if (lng >= -180.0 && lng <= -130.0) {
            baseOffset = lat >= 51.0 ? -9 : -10; // Alaska: -9, Hawaii: -10
        } else if (lng >= -125.0 && lng <= -120.0) {
            baseOffset = -8; // PST
        } else if (lng >= -120.0 && lng <= -105.0) {
            baseOffset = -7; // MST
        } else if (lng >= -105.0 && lng <= -90.0) {
            baseOffset = -6; // CST
        } else if (lng >= -90.0 && lng <= -66.0) {
            baseOffset = -5; // EST
        }

        // Check if DST was in effect (simplified historical check)
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1; // Add 1 hour for DST
            console.log(`Historical DST applied for US date ${moment(date).format('YYYY-MM-DD')}`);
        }

        return baseOffset;
    }

    // Add more historical adjustments for other regions here...

    // For all other regions, first get standard offset
    let baseOffset = calculateBaseOffset(lat, lng);

    // Then check for historical DST
    if (isHistoricalDST(lat, lng, date)) {
        baseOffset += 1;
    }

    return baseOffset;
}

// Calculate base timezone offset (your existing logic)
function calculateBaseOffset(lat, lng) {
    // You can move most of your existing getTimezoneFromCoordsManual logic here
    // This would be used to determine the standard (non-DST) offset

    // Example for a few regions (you already have this logic in your original function)
    if (lat >= 26.0 && lat <= 31.0 && lng >= 80.0 && lng <= 88.5) {
        return 5.75; // Nepal
    }
    // Add more regions as needed...

    // Fallback to mathematical calculation
    let timezone = lng / 15;
    timezone = Math.round(timezone * 2) / 2; // Round to nearest 0.5
    return timezone;
}

// Check if DST was in effect historically (simplified)
function isHistoricalDST(lat, lng, date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const northern = lat > 0;

    // No DST before it was invented (first widely used in early 1900s)
    if (year < 1908) return false;

    // Different countries adopted DST at different times and with different rules
    // This is a simplified approach - a complete solution would need a historical DST database

    // United States - very simplified rule
    if (lat >= 25.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.0) {
        // US didn't have standard DST rules until 1966
        if (year < 1966) {
            // During World Wars, DST was observed year-round in some places
            if ((year >= 1942 && year <= 1945) || (year >= 1914 && year <= 1918)) {
                return true;
            }
            // Otherwise unpredictable, assume standard summer months
            return month > 4 && month < 10;
        }

        // 1966-1986: Last Sunday in April to last Sunday in October
        if (year < 1986) {
            return month > 4 && month < 10;
        }

        // 1986-2006: First Sunday in April to last Sunday in October
        if (year < 2007) {
            return month > 4 && month < 10;
        }

        // 2007-present: Second Sunday in March to first Sunday in November
        return month > 3 && month < 11;
    }

    // Europe - simplified
    if (lat >= 35.0 && lat <= 72.0 && lng >= -10.0 && lng <= 40.0) {
        // Various rules over time, simplifying greatly
        if (year < 1980) {
            return month > 3 && month < 10;
        }
        return month > 3 && month < 11;
    }

    // Southern hemisphere (Australia, South America, etc.)
    if (!northern) {
        return month < 4 || month > 9;
    }

    // General northern hemisphere fallback
    return month > 3 && month < 10;
}

// // Helper function to get timezone from coordinates
// function getTimezoneFromCoords(lat, lng) {
//     // Simple timezone calculation based on longitude
//     // For more accuracy, you could use a service like TimeZoneDB or Google TimeZone API

//     // Rough calculation: 15 degrees longitude = 1 hour
//     let timezone = lng / 15;

//     // Round to nearest 0.5 hour
//     timezone = Math.round(timezone * 2) / 2;

//     console.log('Initial timezone from longitude:', lat, lng);
//     console.log('Calculated timezone offset:', timezone);

//     // Some adjustments for common timezones
//     if (lat >= 20 && lat <= 40 && lng >= 68 && lng <= 97) {
//         // India
//         return 5.5;
//     } else if (lat >= 31 && lat <= 42 && lng >= 74 && lng <= 87) {
//         // China
//         return 8;
//     } else if (lat >= 49 && lat <= 60 && lng >= 2 && lng <= 10) {
//         // Central Europe
//         return 1;
//     } else if (lat >= 40 && lat <= 49 && lng >= -125 && lng <= -66) {
//         // US
//         if (lng >= -125 && lng <= -120) return -8; // PST
//         if (lng >= -120 && lng <= -105) return -7; // MST
//         if (lng >= -105 && lng <= -90) return -6;  // CST
//         if (lng >= -90 && lng <= -66) return -5;   // EST
//     }

//     console.log('Calculated timezone offset:', timezone);

//     return timezone;
// }

function getTimezoneNameFromOffset(offset) {
    const timezoneMap = {
        '-12': 'Pacific/Baker_Island',
        '-11': 'Pacific/Midway',
        '-10': 'Pacific/Honolulu',
        '-9': 'America/Anchorage',
        '-8': 'America/Los_Angeles',
        '-7': 'America/Denver',
        '-6': 'America/Chicago',
        '-5': 'America/New_York',
        '-4': 'America/Halifax',
        '-3': 'America/Sao_Paulo',
        '-2': 'Atlantic/South_Georgia',
        '-1': 'Atlantic/Azores',
        '0': 'Europe/London',
        '1': 'Europe/Berlin',
        '2': 'Europe/Athens',
        '3': 'Europe/Moscow',
        '4': 'Asia/Dubai',
        '5': 'Asia/Karachi',
        '5.5': 'Asia/Kolkata',
        '6': 'Asia/Dhaka',
        '7': 'Asia/Bangkok',
        '8': 'Asia/Shanghai',
        '9': 'Asia/Tokyo',
        '10': 'Australia/Sydney',
        '11': 'Pacific/Norfolk',
        '12': 'Pacific/Auckland',
        '13': 'Pacific/Tongatapu',
        '14': 'Pacific/Kiritimati'
    };

    return timezoneMap[offset.toString()] || 'UTC';
}

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




// Fallback city database for major cities
const fallbackCities = [
    { name: "Mumbai, Maharashtra, India", latitude: 19.0760, longitude: 72.8777, timezone: 5.5, region: "Maharashtra", country: "India" },
    { name: "Delhi, Delhi, India", latitude: 28.6139, longitude: 77.2090, timezone: 5.5, region: "Delhi", country: "India" },
    { name: "Bangalore, Karnataka, India", latitude: 12.9716, longitude: 77.5946, timezone: 5.5, region: "Karnataka", country: "India" },
    { name: "Chennai, Tamil Nadu, India", latitude: 13.0827, longitude: 80.2707, timezone: 5.5, region: "Tamil Nadu", country: "India" },
    { name: "Kolkata, West Bengal, India", latitude: 22.5726, longitude: 88.3639, timezone: 5.5, region: "West Bengal", country: "India" },
    { name: "Hyderabad, Telangana, India", latitude: 17.3850, longitude: 78.4867, timezone: 5.5, region: "Telangana", country: "India" },
    { name: "Pune, Maharashtra, India", latitude: 18.5204, longitude: 73.8567, timezone: 5.5, region: "Maharashtra", country: "India" },
    { name: "Ahmedabad, Gujarat, India", latitude: 23.0225, longitude: 72.5714, timezone: 5.5, region: "Gujarat", country: "India" },
    { name: "Jaipur, Rajasthan, India", latitude: 26.9124, longitude: 75.7873, timezone: 5.5, region: "Rajasthan", country: "India" },
    { name: "Lucknow, Uttar Pradesh, India", latitude: 26.8467, longitude: 80.9462, timezone: 5.5, region: "Uttar Pradesh", country: "India" },
    { name: "New York, NY, USA", latitude: 40.7128, longitude: -74.0060, timezone: -5, region: "New York", country: "USA" },
    { name: "London, England, UK", latitude: 51.5074, longitude: -0.1278, timezone: 0, region: "England", country: "UK" },
    { name: "Paris, Île-de-France, France", latitude: 48.8566, longitude: 2.3522, timezone: 1, region: "Île-de-France", country: "France" },
    { name: "Tokyo, Tokyo, Japan", latitude: 35.6762, longitude: 139.6503, timezone: 9, region: "Tokyo", country: "Japan" },
    { name: "Sydney, NSW, Australia", latitude: -33.8688, longitude: 151.2093, timezone: 10, region: "NSW", country: "Australia" },
    { name: "Dubai, Dubai, UAE", latitude: 25.2048, longitude: 55.2708, timezone: 4, region: "Dubai", country: "UAE" },
    { name: "Singapore, Singapore", latitude: 1.3521, longitude: 103.8198, timezone: 8, region: "Singapore", country: "Singapore" },
    { name: "Toronto, ON, Canada", latitude: 43.6532, longitude: -79.3832, timezone: -5, region: "Ontario", country: "Canada" },
    { name: "Berlin, Berlin, Germany", latitude: 52.5200, longitude: 13.4050, timezone: 1, region: "Berlin", country: "Germany" },
    { name: "Moscow, Moscow, Russia", latitude: 55.7558, longitude: 37.6176, timezone: 3, region: "Moscow", country: "Russia" }
];

// Utility function to validate input
function validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
        return false;
    }
    // Remove extra spaces and check length
    const trimmed = query.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
}

// Utility function to search fallback cities
function searchFallbackCities(query) {
    const searchTerm = query.toLowerCase();
    return fallbackCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm) ||
        city.region.toLowerCase().includes(searchTerm) ||
        city.country.toLowerCase().includes(searchTerm)
    ).slice(0, 5); // Limit to 5 results
}

// // Utility function to get timezone from coordinates
// async function getTimezoneFromCoords(lat, lng) {
//     try {
//         // Try GeoNames API first (free, but requires registration)
//         // You can register at http://www.geonames.org/login and replace 'demo' with your username
//         const response = await axios.get(`http://api.geonames.org/timezoneJSON`, {
//             params: {
//                 lat: lat,
//                 lng: lng,
//                 username: 'demo' // Replace with your GeoNames username
//             },
//             timeout: 5000
//         });

//         console.log('Timezone for', response.data);

//         if (response.data && response.data.gmtOffset !== undefined) {
//             return parseFloat(response.data.gmtOffset);
//         }
//     } catch (error) {
//         console.log('GeoNames timezone API failed, using fallback');
//     }

//     // Fallback timezone calculation (rough approximation based on longitude)
//     const timezoneOffset = Math.round(lng / 15);
//     return Math.max(-12, Math.min(12, timezoneOffset));
// }

// Main location search endpoint
app.post('/api/places/search', async (req, res) => {
    try {
        // Extract query and birthDate parameters
        const { query, birthDate } = req.body;

        // Validate input
        if (!validateSearchQuery(query)) {
            return res.status(400).json({
                success: false,
                error: 'Query must be between 2 and 100 characters'
            });
        }

        const searchQuery = query.trim();
        
        // Create a date-specific cache key if birthDate is provided
        const dateStr = birthDate ? new Date(birthDate).toISOString().split('T')[0] : 'current';
        const cacheKey = `search_${searchQuery.toLowerCase()}_${dateStr}`;

        // Check cache first with date-aware key
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        let results = [];

        console.log(`Searching for: ${searchQuery} (Birth date: ${birthDate || 'not provided'})`);

        try {
            // Use Google Places API Autocomplete with NO type restriction
            const googleApiKey = 'AIzaSyD55md0K5igC3zEp0_FMhvQ2ZSL8QM2AjE';
            
            if (!googleApiKey) {
                throw new Error('Google Places API key not configured');
            }

            const autocompleteResponse = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
                params: {
                    input: searchQuery,
                    key: googleApiKey,
                    // REMOVED the 'types' restriction to allow all location types
                    // Add language parameter for better international support
                    language: 'en',
                    // Optionally use sessiontoken for better billing practices
                    sessiontoken: require('crypto').randomBytes(16).toString('hex')
                },
                timeout: 8000
            });

            if (autocompleteResponse.data && autocompleteResponse.data.predictions && autocompleteResponse.data.predictions.length > 0) {
                // Get place details for each prediction
                const promises = autocompleteResponse.data.predictions
                    .slice(0, 8) // Increased from 5 to 8 results to show more options
                    .map(async (prediction) => {
                        try {
                            // Get place details using place_id
                            const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
                                params: {
                                    place_id: prediction.place_id,
                                    key: googleApiKey,
                                    fields: 'geometry,address_components,name,formatted_address,vicinity,types'
                                },
                                timeout: 5000
                            });

                            if (detailsResponse.data && detailsResponse.data.result) {
                                const place = detailsResponse.data.result;
                                const lat = place.geometry.location.lat;
                                const lng = place.geometry.location.lng;
                                
                                // Parse birth date if provided, otherwise use current date
                                const dateForTimezone = birthDate ? new Date(birthDate) : new Date();
                                
                                // Get timezone for the specific date
                                const timezone = await getTimezoneFromCoords(lat, lng, dateForTimezone);
                                
                                // Parse address components with more detail
                                const addressComponents = place.address_components || [];
                                let locality = '';
                                let sublocality = '';
                                let neighborhood = '';
                                let city = '';
                                let district = '';
                                let state = '';
                                let country = '';
                                let postalCode = '';
                                
                                addressComponents.forEach(component => {
                                    if (component.types.includes('locality')) {
                                        city = component.long_name;
                                    } else if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
                                        sublocality = component.long_name;
                                    } else if (component.types.includes('neighborhood')) {
                                        neighborhood = component.long_name;
                                    } else if (component.types.includes('administrative_area_level_2')) {
                                        district = component.long_name;
                                    } else if (component.types.includes('administrative_area_level_1')) {
                                        state = component.short_name;
                                    } else if (component.types.includes('country')) {
                                        country = component.long_name;
                                    } else if (component.types.includes('postal_code')) {
                                        postalCode = component.long_name;
                                    }
                                });
                                
                                // Use the most specific name available for the location
                                const specificLocation = neighborhood || sublocality || city || district || '';
                                
                                // Build detailed display name with all available components
                                let displayName = place.name;
                                
                                // Use formatted_address if it exists, otherwise build a detailed name
                                if (place.formatted_address) {
                                    displayName = place.formatted_address;
                                } else {
                                    let nameParts = [];
                                    
                                    // Add the specific place name if different from the administrative areas
                                    if (place.name && place.name !== specificLocation && 
                                        place.name !== city && place.name !== district) {
                                        nameParts.push(place.name);
                                    }
                                    
                                    // Add locality information
                                    if (specificLocation) nameParts.push(specificLocation);
                                    if (city && city !== specificLocation) nameParts.push(city);
                                    if (district && !nameParts.includes(district)) nameParts.push(district);
                                    if (state) nameParts.push(state);
                                    if (country) nameParts.push(country);
                                    
                                    displayName = nameParts.join(', ');
                                }

                                // Determine the location type for filtering/display
                                const locationType = determineLocationType(place.types);

                                return {
                                    name: displayName,
                                    placeId: prediction.place_id,
                                    latitude: lat,
                                    longitude: lng,
                                    timezone: timezone,
                                    historicalOffset: birthDate ? true : false,
                                    formattedAddress: place.formatted_address || displayName,
                                    specificLocation: specificLocation,
                                    city: city,
                                    district: district,
                                    region: state,
                                    country: country,
                                    postalCode: postalCode,
                                    locationType: locationType,
                                    referenceDate: birthDate ? new Date(birthDate).toISOString() : new Date().toISOString()
                                };
                            }
                        } catch (detailError) {
                            console.error('Error fetching place details:', detailError.message);
                            return null;
                        }
                    });

                const resolvedResults = await Promise.all(promises);
                results = resolvedResults.filter(result => result !== null);
            }
        } catch (apiError) {
            console.error('Google Places API error:', apiError.message);
            // Continue to fallback search
        }

        // Check if the query might be coordinates
        if (results.length === 0) {
            const coordsResult = await tryParseCoordinates(searchQuery, birthDate);
            if (coordsResult) {
                results = [coordsResult];
            }
        }

        // If no results from API or coords, search fallback locations
        if (results.length === 0) {
            // Pass the birth date to your fallback search function if you have one
            results = searchFallbackLocations(searchQuery, birthDate ? new Date(birthDate) : null);
        }

        // If still no results, provide a default option
        if (results.length === 0) {
            // Use the birth date for calculating the default timezone if provided
            const defaultTimezone = birthDate ? 
                await getTimezoneFromCoords(28.6139, 77.2090, new Date(birthDate)) : 5.5;
            
            results = [{
                name: `${searchQuery} (Default Location)`,
                latitude: 28.6139, // Default to Delhi
                longitude: 77.2090,
                timezone: defaultTimezone,
                historicalOffset: birthDate ? true : false,
                formattedAddress: `${searchQuery} (Default coordinates used)`,
                specificLocation: searchQuery,
                city: 'Unknown',
                district: 'Unknown',
                region: 'Unknown',
                country: 'Unknown',
                locationType: 'unknown',
                referenceDate: birthDate ? new Date(birthDate).toISOString() : null
            }];
        }

        const response = {
            success: true,
            results: results
        };

        // Cache the result
        cache.set(cacheKey, response);

        res.json(response);

    } catch (error) {
        console.error('Location search error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during location search'
        });
    }
});

// Helper function to determine location type from Google place types
function determineLocationType(types) {
    if (!types || !Array.isArray(types)) return 'unknown';
    
    if (types.includes('point_of_interest') || types.includes('establishment')) 
        return 'place';
    if (types.includes('neighborhood') || types.includes('sublocality')) 
        return 'neighborhood';
    if (types.includes('locality')) 
        return 'city';
    if (types.includes('administrative_area_level_2')) 
        return 'district';
    if (types.includes('administrative_area_level_1')) 
        return 'region';
    if (types.includes('country')) 
        return 'country';
    
    return 'location';
}

// Try to parse coordinates from user input like "40.7128, -74.0060"
async function tryParseCoordinates(query, birthDate) {
    // Match patterns like "40.7128, -74.0060" or "40.7128 -74.0060" or "40.7128,-74.0060"
    const coordsRegex = /^\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*$/;
    const match = query.match(coordsRegex);
    
    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinate ranges
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            // Try to get a reverse geocode to get the location name
            try {
                const googleApiKey = 'AIzaSyD55md0K5igC3zEp0_FMhvQ2ZSL8QM2AjE';
                const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        latlng: `${lat},${lng}`,
                        key: googleApiKey
                    },
                    timeout: 5000
                });
                
                let locationName = `Coordinates (${lat}, ${lng})`;
                let formattedAddress = locationName;
                let city = 'Unknown';
                let region = 'Unknown';
                let country = 'Unknown';
                
                // Extract address components from reverse geocoding
                if (geocodeResponse.data && 
                    geocodeResponse.data.results && 
                    geocodeResponse.data.results.length > 0) {
                    
                    const result = geocodeResponse.data.results[0];
                    formattedAddress = result.formatted_address || formattedAddress;
                    locationName = formattedAddress;
                    
                    // Extract components
                    if (result.address_components) {
                        result.address_components.forEach(component => {
                            if (component.types.includes('locality')) {
                                city = component.long_name;
                            } else if (component.types.includes('administrative_area_level_1')) {
                                region = component.short_name;
                            } else if (component.types.includes('country')) {
                                country = component.long_name;
                            }
                        });
                    }
                }
                
                // Get timezone for the specific date
                const dateForTimezone = birthDate ? new Date(birthDate) : new Date();
                const timezone = await getTimezoneFromCoords(lat, lng, dateForTimezone);
                
                return {
                    name: locationName,
                    latitude: lat,
                    longitude: lng,
                    timezone: timezone,
                    historicalOffset: birthDate ? true : false,
                    formattedAddress: formattedAddress,
                    specificLocation: `Coordinates (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
                    city: city,
                    region: region,
                    country: country,
                    locationType: 'coordinates',
                    referenceDate: birthDate ? new Date(birthDate).toISOString() : new Date().toISOString()
                };
            } catch (error) {
                console.error('Error in reverse geocoding:', error);
                
                // Even if reverse geocoding fails, return a basic coordinate result
                const dateForTimezone = birthDate ? new Date(birthDate) : new Date();
                const timezone = await getTimezoneFromCoords(lat, lng, dateForTimezone);
                
                return {
                    name: `Coordinates (${lat}, ${lng})`,
                    latitude: lat,
                    longitude: lng,
                    timezone: timezone,
                    historicalOffset: birthDate ? true : false,
                    formattedAddress: `Coordinates (${lat}, ${lng})`,
                    specificLocation: `Exact coordinates`,
                    city: 'Unknown',
                    region: 'Unknown',
                    country: 'Unknown',
                    locationType: 'coordinates',
                    referenceDate: birthDate ? new Date(birthDate).toISOString() : null
                };
            }
        }
    }
    
    return null;
}

// Fallback search function with enhanced granularity
function searchFallbackLocations(query, birthDate) {
    // Implement your fallback search here, but with more detailed location info
    // This should match the structure of the Google Places results
    
    // This is just a placeholder - replace with your actual implementation
    return [];
}

// Geocoding endpoint (fallback)
app.post('/api/places/geocode', async (req, res) => {
    try {
        const { address } = req.body;

        if (!validateSearchQuery(address)) {
            return res.status(400).json({
                success: false,
                error: 'Address must be between 2 and 100 characters'
            });
        }

        const cacheKey = `geocode_${address.toLowerCase()}`;
        const cachedResult = cache.get(cacheKey);

        if (cachedResult) {
            return res.json(cachedResult);
        }

        let result = null;

        try {
            // Try OpenStreetMap Nominatim for geocoding
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: address,
                    format: 'json',
                    limit: 1,
                    'accept-language': 'en',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'AstrologyPortal/1.0 (your-email@domain.com)'
                },
                timeout: 8000
            });

            if (response.data && response.data.length > 0) {
                const place = response.data[0];
                const lat = parseFloat(place.lat);
                const lng = parseFloat(place.lon);
                const timezone = await getTimezoneFromCoords(lat, lng);

                result = {
                    formatted_address: place.display_name,
                    latitude: lat,
                    longitude: lng,
                    timezone: timezone
                };
            }
        } catch (apiError) {
            console.error('Geocoding API error:', apiError.message);
        }

        // Fallback to manual entry with default coordinates
        if (!result) {
            result = {
                formatted_address: address,
                latitude: 28.6139,
                longitude: 77.2090,
                timezone: 5.5
            };
        }

        const response = {
            success: true,
            results: [result]
        };

        cache.set(cacheKey, response);
        res.json(response);

    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during geocoding'
        });
    }
});

// Timezone endpoint
app.get('/api/places/timezone', async (req, res) => {
    try {
        const { lat, lng } = req.query;

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid latitude or longitude'
            });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                error: 'Latitude must be between -90 and 90, longitude between -180 and 180'
            });
        }

        const cacheKey = `timezone_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
        const cachedResult = cache.get(cacheKey);

        if (cachedResult) {
            return res.json(cachedResult);
        }

        const timezone = await getTimezoneFromCoords(latitude, longitude);

        const response = {
            success: true,
            timezone: timezone
        };

        cache.set(cacheKey, response);
        res.json(response);

    } catch (error) {
        console.error('Timezone error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during timezone lookup'
        });
    }
});


module.exports = app;