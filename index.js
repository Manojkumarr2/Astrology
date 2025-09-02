const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const Astronomy = require('astronomy-engine');
const { getAstrologyData } = require('./utils/timeZoneUtils');

const tzlookup = require('tz-lookup');

const { ImprovedNavamsaChart } = require('./utils/navamsachart'); // Assuming navamsa.js is in the same directory

const { BirthChartGenerator } = require('./utils/birthchart'); // Assuming navamsa.js is in the same directory

const { AccuratePoruthamCalculator } = require('./utils/porutham'); // Assuming porutham.js is in the same directory

const { BehaviorPredictor } = require('./utils/behaviorPredictor');

const { validateInput, createDate, calculatePlanetaryPositions, calculateAscendant, getRashiFromLongitude, getNakshatraFromLongitude, calculateAdditionalDetails } = require('./utils/common'); // Assuming porutham.js is in the same directory


const { Country, State, City } = require('country-state-city');
const geoTz = require('geo-tz');
const moment = require('moment-timezone');

const tzUtil = require('./utils/timeZonesUtils');


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
        // birthChartGenerator.addMaandhiToPositions(positions, {
        //     name: 'Maandhi',
        //     longitude: maandhiLongitude
        // });

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

app.post('/api/places/search', async (req, res) => {
    try {
        // Extract query and birthDate parameters
        const { query, date } = req.body;

        console.log('Search query:', req.body);

        // Validate input
        if (!validateSearchQuery(query)) {
            return res.status(400).json({
                success: false,
                error: 'Query must be between 2 and 100 characters'
            });
        }
        
        const searchQuery = query.trim();

        // Create a date-specific cache key if date is provided
        const dateStr = date ? new Date(date).toISOString().split('T')[0] : 'current';
        const cacheKey = `search_${searchQuery.toLowerCase()}_${dateStr}`;

        // Check cache first with date-aware key
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        let results = [];

        console.log(`Searching for: ${searchQuery} (Date: ${date || 'not provided'})`);

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

                                // Parse date if provided, otherwise use current date
                                const dateForTimezone = date ? new Date(date) : new Date();

                                console.log('Date for timezone calculation:', dateForTimezone);
                                
                                // Get timezone for the specific date
                                let timezone = await getTimezoneFromCoords(lat, lng, dateForTimezone);

                                const timeZone1 = await getAstrologyData(lat, lng, dateForTimezone);

                                console.log('Astrology Data Timezone:', timezone);
                                console.log('Astrology Data Timezone:', timeZone1);

                                console.log('Astrology Data Timezone1:',tzUtil.lookupTimezoneByCoordinates(lat, lng,dateForTimezone));


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
                                    timezone: timeZone1.offsets.current                                                   ,
                                    historicalOffset: date ? true : false,
                                    formattedAddress: place.formatted_address || displayName,
                                    specificLocation: specificLocation,
                                    city: city,
                                    district: district,
                                    region: state,
                                    country: country,
                                    postalCode: postalCode,
                                    locationType: locationType,
                                    referenceDate: date ? new Date(date).toISOString() : new Date().toISOString()
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
            const coordsResult = await tryParseCoordinates(searchQuery, date);
            if (coordsResult) {
                results = [coordsResult];
            }
        }

        // If no results from API or coords, search fallback locations
        if (results.length === 0) {
            // Pass the date to your fallback search function if you have one
            results = searchFallbackLocations(searchQuery, date ? new Date(date) : null);
        }

        // If still no results, provide a default option
        if (results.length === 0) {
            // Use the birth date for calculating the default timezone if provided
            const defaultTimezone = date ? 
                await getTimezoneFromCoords(28.6139, 77.2090, new Date(date)) : 5.5;
            
            results = [{
                name: `${searchQuery} (Default Location)`,
                latitude: 28.6139, // Default to Delhi
                longitude: 77.2090,
                timezone: defaultTimezone,
                historicalOffset: date ? true : false,
                formattedAddress: `${searchQuery} (Default coordinates used)`,
                specificLocation: searchQuery,
                city: 'Unknown',
                district: 'Unknown',
                region: 'Unknown',
                country: 'Unknown',
                locationType: 'unknown',
                referenceDate: date ? new Date(date).toISOString() : null
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

// Utility function to validate input
function validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
        return false;
    }
    // Remove extra spaces and check length
    const trimmed = query.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
}


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

    // ASIA - Enhanced coverage with precise offsets
    
    // India (standardized timezone in 1955)
    if (lat >= 6.0 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5) {
        if (year < 1955) {
            if (lng < 77.0) return 4.85; // Bombay Time (GMT+4:51)
            if (lng > 82.0) return 5.88; // Calcutta Time (GMT+5:53)
        }
        console.log('Detected: India timezone');
        return 5.5; // IST (UTC+05:30)
    }

    // Nepal - UTC+05:45
    if (lat >= 26.0 && lat <= 31.0 && lng >= 80.0 && lng <= 88.5) {
        console.log('Detected: Nepal timezone');
        return 5.75; // NPT (UTC+05:45)
    }

    // Myanmar - UTC+06:30
    if (lat >= 9.0 && lat <= 29.0 && lng >= 92.0 && lng <= 102.0) {
        console.log('Detected: Myanmar timezone');
        return 6.5; // MMT (UTC+06:30)
    }

    // Iran - UTC+03:30
    if (lat >= 25.0 && lat <= 40.0 && lng >= 44.0 && lng <= 64.0) {
        console.log('Detected: Iran timezone');
        return 3.5; // IRST (UTC+03:30)
    }

    // Afghanistan - UTC+04:30
    if (lat >= 29.0 && lat <= 39.0 && lng >= 60.0 && lng <= 75.0) {
        console.log('Detected: Afghanistan timezone');
        return 4.5; // AFT (UTC+04:30)
    }

    // Bangladesh - UTC+06:00
    if (lat >= 20.0 && lat <= 27.0 && lng >= 88.0 && lng <= 93.0) {
        console.log('Detected: Bangladesh timezone');
        return 6.0; // BST (UTC+06:00)
    }

    // Sri Lanka - UTC+05:30
    if (lat >= 5.0 && lat <= 10.0 && lng >= 79.0 && lng <= 82.0) {
        console.log('Detected: Sri Lanka timezone');
        return 5.5; // SLST (UTC+05:30)
    }

    // Pakistan - UTC+05:00
    if (lat >= 23.0 && lat <= 37.0 && lng >= 60.0 && lng <= 78.0) {
        console.log('Detected: Pakistan timezone');
        return 5.0; // PKT (UTC+05:00)
    }

    // Thailand, Vietnam, Cambodia, Laos - UTC+07:00
    if (lat >= 5.0 && lat <= 24.0 && lng >= 92.0 && lng <= 110.0) {
        console.log('Detected: Southeast Asia timezone');
        return 7.0; // ICT (UTC+07:00)
    }

    // Indonesia - Multiple zones
    if (lat >= -11.0 && lat <= 6.0 && lng >= 95.0 && lng <= 141.0) {
        if (lng <= 120.0) return 7.0; // WIB (Western Indonesia)
        if (lng <= 140.0) return 8.0; // WITA (Central Indonesia)
        return 9.0; // WIT (Eastern Indonesia)
    }

    // Malaysia, Singapore, Philippines - UTC+08:00
    if (lat >= -3.0 && lat <= 20.0 && lng >= 99.0 && lng <= 127.0) {
        console.log('Detected: Malaysia/Singapore/Philippines timezone');
        return 8.0; // MYT/SGT/PHT (UTC+08:00)
    }

    // Japan - UTC+09:00
    if (lat >= 24.0 && lat <= 46.0 && lng >= 123.0 && lng <= 146.0) {
        console.log('Detected: Japan timezone');
        return 9.0; // JST (UTC+09:00)
    }

    // South Korea - UTC+09:00
    if (lat >= 33.0 && lat <= 39.0 && lng >= 124.0 && lng <= 132.0) {
        console.log('Detected: South Korea timezone');
        return 9.0; // KST (UTC+09:00)
    }

    // North Korea - UTC+08:30 (changed in 2015, was +09:00)
    if (lat >= 37.0 && lat <= 43.0 && lng >= 124.0 && lng <= 131.0) {
        if (year >= 2015 && year < 2018) return 8.5; // PYT (UTC+08:30)
        return 9.0; // KST (UTC+09:00)
    }

    // China (standardized to one timezone in 1949)
    if (lat >= 15.0 && lat <= 54.0 && lng >= 73.0 && lng <= 135.0) {
        if (year < 1949) {
            if (lng < 82.5) return 6; // Kunlun Time Zone
            if (lng < 97.5) return 7; // Tianshan Time Zone
            if (lng < 112.5) return 8; // Changbai Time Zone
            if (lng < 127.5) return 9; // Taipei Time Zone
            return 10; // Far Eastern Zone
        }
        console.log('Detected: China timezone');
        return 8; // CST (UTC+08:00)
    }

    // EUROPE - With DST considerations
    
    // United Kingdom and Ireland - UTC+00:00/+01:00
    if (lat >= 49.0 && lat <= 61.0 && lng >= -11.0 && lng <= 2.0) {
        let baseOffset = 0; // GMT
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1; // BST
        }
        console.log('Detected: UK/Ireland timezone');
        return baseOffset;
    }

    // Western Europe (Portugal, Spain) - UTC+00:00/+01:00 or UTC+01:00/+02:00
    if (lat >= 35.0 && lat <= 44.0 && lng >= -10.0 && lng <= 4.0) {
        let baseOffset = lng < -6.0 ? 0 : 1; // Portugal: GMT, Spain: CET
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1;
        }
        console.log('Detected: Western Europe timezone');
        return baseOffset;
    }

    // Central Europe - UTC+01:00/+02:00
    if (lat >= 45.0 && lat <= 55.0 && lng >= 4.0 && lng <= 20.0) {
        let baseOffset = 1; // CET
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1; // CEST
        }
        console.log('Detected: Central Europe timezone');
        return baseOffset;
    }

    // Eastern Europe - UTC+02:00/+03:00
    if (lat >= 40.0 && lat <= 60.0 && lng >= 20.0 && lng <= 30.0) {
        let baseOffset = 2; // EET
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1; // EEST
        }
        console.log('Detected: Eastern Europe timezone');
        return baseOffset;
    }

    // Russia - Multiple time zones
    if (lat >= 41.0 && lat <= 82.0 && lng >= 19.0 && lng <= 180.0) {
        if (lng < 40.0) return 3; // MSK (Moscow)
        if (lng < 53.0) return 4; // SAMT (Samara)
        if (lng < 68.0) return 5; // YEKT (Yekaterinburg)
        if (lng < 83.0) return 6; // OMST (Omsk)
        if (lng < 98.0) return 7; // KRAT (Krasnoyarsk)
        if (lng < 113.0) return 8; // IRKT (Irkutsk)
        if (lng < 128.0) return 9; // YAKT (Yakutsk)
        if (lng < 143.0) return 10; // VLAT (Vladivostok)
        if (lng < 158.0) return 11; // MAGT (Magadan)
        return 12; // PETT (Kamchatka)
    }

    // AFRICA
    
    // North Africa - UTC+01:00
    if (lat >= 15.0 && lat <= 37.0 && lng >= -17.0 && lng <= 25.0) {
        console.log('Detected: North Africa timezone');
        return 1.0; // WAT/CET
    }

    // West Africa - UTC+00:00
    if (lat >= -10.0 && lat <= 15.0 && lng >= -17.0 && lng <= 15.0) {
        console.log('Detected: West Africa timezone');
        return 0.0; // GMT
    }

    // Central Africa - UTC+01:00
    if (lat >= -15.0 && lat <= 15.0 && lng >= 15.0 && lng <= 30.0) {
        console.log('Detected: Central Africa timezone');
        return 1.0; // WAT
    }

    // East Africa - UTC+03:00
    if (lat >= -15.0 && lat <= 15.0 && lng >= 30.0 && lng <= 50.0) {
        console.log('Detected: East Africa timezone');
        return 3.0; // EAT
    }

    // South Africa - UTC+02:00
    if (lat >= -35.0 && lat <= -15.0 && lng >= 15.0 && lng <= 35.0) {
        console.log('Detected: South Africa timezone');
        return 2.0; // SAST
    }

    // AMERICAS
    
    // United States and Canada - Multiple zones with DST
    if (lat >= 25.0 && lat <= 72.0 && lng >= -180.0 && lng <= -66.0) {
        let baseOffset = 0;
        
        // Determine base timezone
        if (lng >= -180.0 && lng <= -130.0) {
            baseOffset = lat >= 51.0 ? -9 : -10; // Alaska: -9, Hawaii: -10
        } else if (lng >= -130.0 && lng <= -120.0) {
            baseOffset = -8; // PST
        } else if (lng >= -120.0 && lng <= -105.0) {
            baseOffset = -7; // MST
        } else if (lng >= -105.0 && lng <= -90.0) {
            baseOffset = -6; // CST
        } else if (lng >= -90.0 && lng <= -66.0) {
            baseOffset = -5; // EST
        }

        // Newfoundland special case - UTC-03:30
        if (lat >= 46.0 && lat <= 52.0 && lng >= -60.0 && lng <= -52.0) {
            baseOffset = -3.5; // NST
            if (isHistoricalDST(lat, lng, date)) {
                baseOffset += 1; // NDT
            }
            return baseOffset;
        }

        // Check if DST was in effect
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1;
        }

        console.log('Detected: North America timezone');
        return baseOffset;
    }

    // Mexico - Multiple zones
    if (lat >= 14.0 && lat <= 33.0 && lng >= -118.0 && lng <= -86.0) {
        if (lng < -115.0) return -8; // PST (Baja California)
        if (lng < -105.0) return -7; // MST (Northwest)
        if (lng < -90.0) return -6; // CST (Most of Mexico)
        return -5; // EST (Southeast)
    }

    // Central America - UTC-06:00
    if (lat >= 7.0 && lat <= 18.0 && lng >= -92.0 && lng <= -77.0) {
        console.log('Detected: Central America timezone');
        return -6.0; // CST
    }

    // Caribbean - UTC-04:00 to UTC-05:00
    if (lat >= 10.0 && lat <= 27.0 && lng >= -85.0 && lng <= -59.0) {
        if (lng > -75.0) return -4.0; // AST (Eastern Caribbean)
        return -5.0; // EST (Western Caribbean)
    }

    // South America
    if (lat >= -56.0 && lat <= 13.0 && lng >= -82.0 && lng <= -34.0) {
        // Brazil - Multiple zones
        if (lat >= -34.0 && lat <= 5.0 && lng >= -74.0 && lng <= -34.0) {
            if (lng > -68.0) return -3.0; // BRT (Brasília)
            if (lng > -74.0) return -4.0; // AMT (Amazon)
            return -5.0; // ACT (Acre)
        }
        
        // Argentina, Chile, Uruguay - UTC-03:00
        if (lat >= -56.0 && lat <= -21.0 && lng >= -74.0 && lng <= -53.0) {
            return -3.0; // ART/CLT/UYT
        }
        
        // Colombia, Ecuador, Peru - UTC-05:00
        if (lat >= -18.0 && lat <= 13.0 && lng >= -82.0 && lng <= -66.0) {
            return -5.0; // COT/ECT/PET
        }
        
        // Venezuela - UTC-04:00
        if (lat >= 0.0 && lat <= 13.0 && lng >= -73.0 && lng <= -59.0) {
            return -4.0; // VET
        }
        
        // Default South America
        return -3.0;
    }

    // OCEANIA
    
    // Australia - Multiple zones
    if (lat >= -44.0 && lat <= -10.0 && lng >= 113.0 && lng <= 154.0) {
        if (lng < 129.0) return 8.0; // AWST (Western Australia)
        if (lng < 137.0) return 9.5; // ACST (Central Australia - Adelaide)
        if (lng < 142.0) return 9.0; // ACST (Northern Territory)
        
        // Eastern Australia with DST consideration
        let baseOffset = 10.0; // AEST
        if (isHistoricalDST(lat, lng, date) && lat < -28.0) {
            baseOffset += 1; // AEDT (only southern parts observe DST)
        }
        return baseOffset;
    }

    // New Zealand - UTC+12:00/+13:00
    if (lat >= -47.0 && lat <= -34.0 && lng >= 166.0 && lng <= 179.0) {
        let baseOffset = 12.0; // NZST
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1; // NZDT
        }
        console.log('Detected: New Zealand timezone');
        return baseOffset;
    }

    // Pacific Islands
    if (lat >= -25.0 && lat <= 25.0 && lng >= 130.0 && lng <= -140.0) {
        if (lng > 0) {
            // Western Pacific
            if (lng < 145.0) return 9.0; // Palau
            if (lng < 155.0) return 10.0; // Guam
            if (lng < 165.0) return 11.0; // Solomon Islands
            return 12.0; // Fiji, Marshall Islands
        } else {
            // Eastern Pacific
            if (lng > -140.0) return -10.0; // Hawaii-Aleutian
            return -11.0; // Samoa
        }
    }

    // MIDDLE EAST
    
    // Israel - UTC+02:00/+03:00
    if (lat >= 29.0 && lat <= 34.0 && lng >= 34.0 && lng <= 36.0) {
        let baseOffset = 2.0; // IST
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1; // IDT
        }
        console.log('Detected: Israel timezone');
        return baseOffset;
    }

    // Turkey - UTC+03:00
    if (lat >= 35.0 && lat <= 43.0 && lng >= 26.0 && lng <= 45.0) {
        console.log('Detected: Turkey timezone');
        return 3.0; // TRT
    }

    // Saudi Arabia, UAE, Kuwait - UTC+03:00
    if (lat >= 12.0 && lat <= 32.0 && lng >= 34.0 && lng <= 60.0) {
        console.log('Detected: Arabian Peninsula timezone');
        return 3.0; // AST
    }

    // Jordan, Lebanon, Syria - UTC+02:00/+03:00
    if (lat >= 32.0 && lat <= 38.0 && lng >= 35.0 && lng <= 43.0) {
        let baseOffset = 2.0;
        if (isHistoricalDST(lat, lng, date)) {
            baseOffset += 1;
        }
        console.log('Detected: Levant timezone');
        return baseOffset;
    }

    // For all other regions, use enhanced mathematical calculation
    let baseOffset = calculateBaseOffset(lat, lng);

    // Then check for historical DST
    if (isHistoricalDST(lat, lng, date)) {
        baseOffset += 1;
    }

    return baseOffset;
}

// Enhanced calculateBaseOffset function
function calculateBaseOffset(lat, lng) {
    // Enhanced precision timezone mappings for edge cases
    const timezoneMap = [
        { bounds: [26.0, 31.0, 80.0, 88.5], offset: 5.75 },  // Nepal
        { bounds: [9.0, 29.0, 92.0, 102.0], offset: 6.5 },   // Myanmar
        { bounds: [25.0, 40.0, 44.0, 64.0], offset: 3.5 },   // Iran
        { bounds: [29.0, 39.0, 60.0, 75.0], offset: 4.5 },   // Afghanistan
        { bounds: [37.0, 43.0, 124.0, 131.0], offset: 8.5 }, // North Korea (2015-2018)
        { bounds: [46.0, 52.0, -60.0, -52.0], offset: -3.5 }, // Newfoundland
        { bounds: [-44.0, -28.0, 129.0, 137.0], offset: 9.5 } // Central Australia
    ];
    
    // Check if coordinates fall within any precise timezone
    for (const zone of timezoneMap) {
        const [minLat, maxLat, minLng, maxLng] = zone.bounds;
        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
            return zone.offset;
        }
    }
    
    // Fallback to mathematical calculation with higher precision
    let timezone = lng / 15;
    timezone = Math.round(timezone * 4) / 4; // Round to nearest 0.25
    return timezone;
}

// Calculate base timezone offset (your existing logic)
// Replace the entire fallback section with:
function calculateBaseOffset(lat, lng) {
    // Enhanced precision timezone mappings
    const timezoneMap = [
        { bounds: [8.0, 37.5, 68.0, 97.5], offset: 5.5 },    // India
        { bounds: [26.0, 31.0, 80.0, 88.5], offset: 5.75 },  // Nepal
        { bounds: [25.0, 40.0, 44.0, 64.0], offset: 3.5 },   // Iran
        { bounds: [29.0, 39.0, 60.0, 75.0], offset: 4.5 },   // Afghanistan
        { bounds: [9.0, 29.0, 92.0, 102.0], offset: 6.5 },   // Myanmar
        { bounds: [37.0, 43.0, 124.0, 131.0], offset: 8.5 }  // North Korea
    ];
    
    // Check if coordinates fall within any precise timezone
    for (const zone of timezoneMap) {
        const [minLat, maxLat, minLng, maxLng] = zone.bounds;
        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
            return zone.offset;
        }
    }
    
    // Fallback to mathematical calculation with higher precision
    let timezone = lng / 15;
    timezone = Math.round(timezone * 4) / 4; // Round to nearest 0.25
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