const { Country, State, City } = require('country-state-city');
const geoTz = require('geo-tz');
const moment = require('moment-timezone');
const tzlookup = require('tz-lookup');
const axios = require('axios');

class LocationHelper {
    constructor() {
        this.countries = Country.getAllCountries();
        this.cache = new Map();
    }

    /**
     * Extract comprehensive location components from Google Places address components
     */
    extractLocationComponents(addressComponents) {
        const components = {
            country: '',
            countryCode: '',
            state: '',
            stateCode: '',
            district: '',
            city: '',
            sublocality: '',
            neighborhood: '',
            postalCode: '',
            locality: '',
            administrativeAreaLevel1: '',
            administrativeAreaLevel2: '',
            administrativeAreaLevel3: '',
            route: '',
            streetNumber: '',
            premise: ''
        };
        
        if (!addressComponents || !Array.isArray(addressComponents)) {
            return components;
        }
        
        addressComponents.forEach(component => {
            const types = component.types || [];
            
            if (types.includes('country')) {
                components.country = component.long_name;
                components.countryCode = component.short_name;
            } else if (types.includes('administrative_area_level_1')) {
                components.state = component.long_name;
                components.stateCode = component.short_name;
                components.administrativeAreaLevel1 = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
                components.district = component.long_name;
                components.administrativeAreaLevel2 = component.long_name;
            } else if (types.includes('administrative_area_level_3')) {
                components.administrativeAreaLevel3 = component.long_name;
            } else if (types.includes('locality')) {
                components.city = component.long_name;
                components.locality = component.long_name;
            } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                components.sublocality = component.long_name;
            } else if (types.includes('neighborhood')) {
                components.neighborhood = component.long_name;
            } else if (types.includes('postal_code')) {
                components.postalCode = component.long_name;
            } else if (types.includes('route')) {
                components.route = component.long_name;
            } else if (types.includes('street_number')) {
                components.streetNumber = component.long_name;
            } else if (types.includes('premise')) {
                components.premise = component.long_name;
            }
        });
        
        return components;
    }

    /**
     * Get timezone offset for specific coordinates and date
     */
    async getTimezoneFromCoords(lat, lng, date = null) {
        try {
            const cacheKey = `tz_${lat}_${lng}_${date ? date.toISOString().split('T')[0] : 'current'}`;
            
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            let offsetHours = 0;

            // First try using geo-tz library for accurate timezone
            const timeZones = geoTz.find(lat, lng);
            if (timeZones && timeZones.length > 0) {
                const timeZone = timeZones[0];
                
                if (date) {
                    const momentDate = moment.tz(date, timeZone);
                    offsetHours = momentDate.utcOffset() / 60;
                } else {
                    offsetHours = moment.tz(timeZone).utcOffset() / 60;
                }
            } else {
                // Fallback to tzlookup
                const timeZone = tzlookup(lat, lng);
                if (timeZone) {
                    const momentDate = moment.tz(date || new Date(), timeZone);
                    offsetHours = momentDate.utcOffset() / 60;
                } else {
                    // Final fallback - estimate based on longitude
                    offsetHours = Math.round(lng / 15);
                }
            }
            
            // Cache the result
            this.cache.set(cacheKey, offsetHours);
            return offsetHours;
            
        } catch (error) {
            console.error('Timezone calculation error:', error);
            // Fallback calculation based on longitude
            return Math.round(lng / 15);
        }
    }

    /**
     * Enhance Google Places result with country-state-city data
     */
    enhanceLocationWithCSC(googleResult, lat, lng) {
        try {
            let targetCountry = null;
            let targetState = null;
            let targetCity = null;
            let enhancedDistrict = googleResult.district || '';

            // Find country by code first, then by name
            if (googleResult.countryCode) {
                targetCountry = Country.getCountryByCode(googleResult.countryCode);
            }

            if (!targetCountry && googleResult.country) {
                targetCountry = this.countries.find(country => 
                    country.name.toLowerCase() === googleResult.country.toLowerCase() ||
                    country.name.toLowerCase().includes(googleResult.country.toLowerCase()) ||
                    googleResult.country.toLowerCase().includes(country.name.toLowerCase())
                );
            }

            if (targetCountry) {
                // Get states for the country
                const states = State.getStatesOfCountry(targetCountry.isoCode);
                
                // Find matching state
                if (googleResult.state || googleResult.stateCode) {
                    targetState = states.find(state => 
                        state.name.toLowerCase() === (googleResult.state || '').toLowerCase() ||
                        state.isoCode.toLowerCase() === (googleResult.stateCode || '').toLowerCase()
                    );
                }

                // Fuzzy state matching
                if (!targetState && googleResult.state) {
                    targetState = states.find(state => 
                        state.name.toLowerCase().includes(googleResult.state.toLowerCase()) ||
                        googleResult.state.toLowerCase().includes(state.name.toLowerCase())
                    );
                }

                // Get cities for the state/country
                if (targetState) {
                    const cities = City.getCitiesOfState(targetCountry.isoCode, targetState.isoCode);
                    
                    // Find matching city
                    if (googleResult.city) {
                        targetCity = cities.find(city => 
                            city.name.toLowerCase() === googleResult.city.toLowerCase()
                        );
                        
                        // Fuzzy city matching
                        if (!targetCity) {
                            targetCity = cities.find(city => 
                                city.name.toLowerCase().includes(googleResult.city.toLowerCase()) ||
                                googleResult.city.toLowerCase().includes(city.name.toLowerCase())
                            );
                        }
                    }

                    // If we found a city but no district, try to use administrative areas
                    if (targetCity && !enhancedDistrict) {
                        enhancedDistrict = googleResult.administrativeAreaLevel2 || 
                                         googleResult.administrativeAreaLevel3 || 
                                         targetState.name;
                    }
                } else {
                    // If no state found, try to get cities directly from country
                    const cities = City.getCitiesOfCountry(targetCountry.isoCode);
                    if (googleResult.city) {
                        targetCity = cities.find(city => 
                            city.name.toLowerCase() === googleResult.city.toLowerCase()
                        );
                    }
                }
            }

            return {
                ...googleResult,
                enhancedCountry: targetCountry ? {
                    name: targetCountry.name,
                    code: targetCountry.isoCode,
                    code3: targetCountry.iso3,
                    numericCode: targetCountry.numeric,
                    phonecode: targetCountry.phonecode,
                    capital: targetCountry.capital,
                    currency: targetCountry.currency,
                    currencyName: targetCountry.currency_name,
                    currencySymbol: targetCountry.currency_symbol,
                    region: targetCountry.region,
                    subregion: targetCountry.subregion
                } : null,
                enhancedState: targetState ? {
                    name: targetState.name,
                    code: targetState.isoCode,
                    countryCode: targetState.countryCode,
                    latitude: targetState.latitude,
                    longitude: targetState.longitude
                } : null,
                enhancedCity: targetCity ? {
                    name: targetCity.name,
                    countryCode: targetCity.countryCode,
                    stateCode: targetCity.stateCode,
                    latitude: targetCity.latitude,
                    longitude: targetCity.longitude
                } : null,
                enhancedDistrict: enhancedDistrict || googleResult.administrativeAreaLevel2 || 'Unknown'
            };

        } catch (error) {
            console.error('Error enhancing location with CSC:', error);
            return googleResult;
        }
    }

    /**
     * Search locations using country-state-city database
     */
    searchInCSCDatabase(query) {
        const searchQuery = query.toLowerCase().trim();
        const results = [];

        try {
            // Search in countries
            const countryMatches = this.countries.filter(country =>
                country.name.toLowerCase().includes(searchQuery) ||
                country.capital.toLowerCase().includes(searchQuery)
            );

            countryMatches.forEach(country => {
                results.push({
                    name: `${country.name} (Country)`,
                    type: 'country',
                    country: country.name,
                    countryCode: country.isoCode,
                    capital: country.capital,
                    region: country.region,
                    subregion: country.subregion,
                    // Use capital coordinates if available
                    latitude: country.latitude || 0,
                    longitude: country.longitude || 0
                });
            });

            // Search in states
            countryMatches.slice(0, 3).forEach(country => {
                const states = State.getStatesOfCountry(country.isoCode);
                const stateMatches = states.filter(state =>
                    state.name.toLowerCase().includes(searchQuery)
                ).slice(0, 5);

                stateMatches.forEach(state => {
                    results.push({
                        name: `${state.name}, ${country.name}`,
                        type: 'state',
                        country: country.name,
                        countryCode: country.isoCode,
                        state: state.name,
                        stateCode: state.isoCode,
                        latitude: parseFloat(state.latitude) || 0,
                        longitude: parseFloat(state.longitude) || 0
                    });
                });
            });

            // Search in cities
            countryMatches.slice(0, 2).forEach(country => {
                const cities = City.getCitiesOfCountry(country.isoCode);
                const cityMatches = cities.filter(city =>
                    city.name.toLowerCase().includes(searchQuery)
                ).slice(0, 10);

                cityMatches.forEach(city => {
                    const state = State.getStateByCodeAndCountry(city.stateCode, city.countryCode);
                    results.push({
                        name: `${city.name}, ${state ? state.name + ', ' : ''}${country.name}`,
                        type: 'city',
                        country: country.name,
                        countryCode: country.isoCode,
                        state: state ? state.name : '',
                        stateCode: city.stateCode,
                        city: city.name,
                        latitude: parseFloat(city.latitude) || 0,
                        longitude: parseFloat(city.longitude) || 0
                    });
                });
            });

        } catch (error) {
            console.error('Error searching CSC database:', error);
        }

        return results.slice(0, 15); // Return top 15 results
    }

    /**
     * Try to parse coordinates from user input
     */
    async tryParseCoordinates(query, birthDate) {
        const coordsRegex = /^\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*$/;
        const match = query.match(coordsRegex);
        
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            
            // Validate coordinate ranges
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                try {
                    // Get timezone for the coordinates
                    const dateForTimezone = birthDate ? new Date(birthDate) : new Date();
                    const timezone = await this.getTimezoneFromCoords(lat, lng, dateForTimezone);
                    
                    // Try reverse geocoding to get location name
                    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyD55md0K5igC3zEp0_FMhvQ2ZSL8QM2AjE';
                    
                    let locationName = `Coordinates (${lat}, ${lng})`;
                    let locationComponents = {
                        country: 'Unknown',
                        countryCode: '',
                        state: 'Unknown',
                        district: 'Unknown',
                        city: 'Unknown'
                    };

                    if (googleApiKey) {
                        try {
                            const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                                params: {
                                    latlng: `${lat},${lng}`,
                                    key: googleApiKey
                                },
                                timeout: 5000
                            });
                            
                            if (geocodeResponse.data && 
                                geocodeResponse.data.results && 
                                geocodeResponse.data.results.length > 0) {
                                
                                const result = geocodeResponse.data.results[0];
                                locationName = result.formatted_address || locationName;
                                
                                if (result.address_components) {
                                    locationComponents = this.extractLocationComponents(result.address_components);
                                    
                                    // Enhance with CSC data
                                    const enhanced = this.enhanceLocationWithCSC(locationComponents, lat, lng);
                                    locationComponents = enhanced;
                                }
                            }
                        } catch (geocodeError) {
                            console.error('Reverse geocoding error:', geocodeError.message);
                        }
                    }
                    
                    return {
                        name: locationName,
                        latitude: lat,
                        longitude: lng,
                        timezone: timezone,
                        historicalOffset: birthDate ? true : false,
                        formattedAddress: locationName,
                        specificLocation: `Coordinates (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
                        country: locationComponents.enhancedCountry?.name || locationComponents.country || 'Unknown',
                        countryCode: locationComponents.enhancedCountry?.code || locationComponents.countryCode || '',
                        state: locationComponents.enhancedState?.name || locationComponents.state || 'Unknown',
                        district: locationComponents.enhancedDistrict || locationComponents.district || 'Unknown',
                        city: locationComponents.enhancedCity?.name || locationComponents.city || 'Unknown',
                        region: locationComponents.state || 'Unknown',
                        locationType: 'coordinates',
                        referenceDate: birthDate ? new Date(birthDate).toISOString() : new Date().toISOString()
                    };
                } catch (error) {
                    console.error('Error processing coordinates:', error);
                    return null;
                }
            }
        }
        
        return null;
    }

    /**
     * Comprehensive fallback search with CSC integration
     */
    async searchFallbackLocations(query, birthDate) {
        const results = [];
        const searchLower = query.toLowerCase().trim();
        
        try {
            // First, search in CSC database
            const cscResults = this.searchInCSCDatabase(query);
            
            for (const result of cscResults) {
                const dateForTimezone = birthDate ? new Date(birthDate) : new Date();
                const timezone = await this.getTimezoneFromCoords(result.latitude, result.longitude, dateForTimezone);
                
                results.push({
                    name: result.name,
                    latitude: result.latitude,
                    longitude: result.longitude,
                    timezone: timezone,
                    historicalOffset: birthDate ? true : false,
                    formattedAddress: result.name,
                    specificLocation: result.city || result.state || result.country,
                    country: result.country || 'Unknown',
                    countryCode: result.countryCode || '',
                    state: result.state || '',
                    stateCode: result.stateCode || '',
                    district: result.district || result.state || 'Unknown',
                    city: result.city || '',
                    region: result.state || result.region || '',
                    locationType: result.type || 'location',
                    referenceDate: birthDate ? new Date(birthDate).toISOString() : new Date().toISOString()
                });
            }
            
            // Add some common Indian cities if no results found
            if (results.length === 0) {
                const indianCities = await this.getCommonIndianCities(searchLower, birthDate);
                results.push(...indianCities);
            }
            
        } catch (error) {
            console.error('Error in fallback search:', error);
        }
        
        return results.slice(0, 8);
    }

    /**
     * Get common Indian cities with CSC data
     */
    async getCommonIndianCities(searchQuery, birthDate) {
        const india = Country.getCountryByCode('IN');
        if (!india) return [];

        const indianStates = State.getStatesOfCountry('IN');
        const results = [];

        // Common major cities with their state codes
        const majorCities = [
            { name: 'Mumbai', stateCode: 'MH', lat: 19.0760, lng: 72.8777 },
            { name: 'Delhi', stateCode: 'DL', lat: 28.6139, lng: 77.2090 },
            { name: 'Bangalore', stateCode: 'KA', lat: 12.9716, lng: 77.5946 },
            { name: 'Chennai', stateCode: 'TN', lat: 13.0827, lng: 80.2707 },
            { name: 'Hyderabad', stateCode: 'TG', lat: 17.3850, lng: 78.4867 },
            { name: 'Kolkata', stateCode: 'WB', lat: 22.5726, lng: 88.3639 },
            { name: 'Pune', stateCode: 'MH', lat: 18.5204, lng: 73.8567 },
            { name: 'Ahmedabad', stateCode: 'GJ', lat: 23.0225, lng: 72.5714 },
            { name: 'Jaipur', stateCode: 'RJ', lat: 26.9124, lng: 75.7873 },
            { name: 'Surat', stateCode: 'GJ', lat: 21.1702, lng: 72.8311 }
        ];

        for (const cityData of majorCities) {
            if (cityData.name.toLowerCase().includes(searchQuery) || 
                searchQuery.includes(cityData.name.toLowerCase())) {
                
                const state = indianStates.find(s => s.isoCode === cityData.stateCode);
                const dateForTimezone = birthDate ? new Date(birthDate) : new Date();
                const timezone = await this.getTimezoneFromCoords(cityData.lat, cityData.lng, dateForTimezone);
                
                results.push({
                    name: `${cityData.name}, ${state ? state.name : 'India'}, India`,
                    latitude: cityData.lat,
                    longitude: cityData.lng,
                    timezone: timezone,
                    historicalOffset: birthDate ? true : false,
                    formattedAddress: `${cityData.name}, ${state ? state.name : 'India'}, India`,
                    specificLocation: cityData.name,
                    country: 'India',
                    countryCode: 'IN',
                    state: state ? state.name : 'Unknown',
                    stateCode: cityData.stateCode,
                    district: cityData.name, // In major cities, city = district often
                    city: cityData.name,
                    region: state ? state.name : 'India',
                    locationType: 'city',
                    referenceDate: birthDate ? new Date(birthDate).toISOString() : new Date().toISOString()
                });
            }
        }

        return results;
    }

    /**
     * Validate search query
     */
    validateSearchQuery(query) {
        if (!query || typeof query !== 'string') {
            return false;
        }
        const trimmed = query.trim();
        return trimmed.length >= 2 && trimmed.length <= 100;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

module.exports = LocationHelper;