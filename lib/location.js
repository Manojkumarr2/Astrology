const axios = require('axios');
const { getAstrologyData } = require('./utils/timeZoneUtils');
const geoTz = require('geo-tz');
const moment = require('moment-timezone');

module.exports = (api) => {
  const router = require('express').Router();
  
  // Location search endpoint
  router.post('/search', async (req, res) => {
    try {
      // Extract query and birthDate parameters
      const { query, date } = req.body;

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
      const cachedResult = api.cache.get(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      let results = [];

      // Try to parse coordinates from user input
      if (results.length === 0) {
        const coordsResult = await tryParseCoordinates(searchQuery, date);
        if (coordsResult) {
          results = [coordsResult];
        }
      }

      // If no results from coords, search fallback locations
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
      api.cache.set(cacheKey, response);

      res.json(response);

    } catch (error) {
      console.error('Location search error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during location search'
      });
    }
  });
  
  // Utility function to validate input
  function validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return false;
    }
    // Remove extra spaces and check length
    const trimmed = query.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
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
        // Get timezone for the specific date
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
    
    return null;
  }
  
  // Fallback search function
  function searchFallbackLocations(query, birthDate) {
    // Implement your fallback search here
    return [];
  }
  
  // Enhanced timezone function that considers historical dates
  async function getTimezoneFromCoords(lat, lng, date = new Date()) {
    try {
      // Use geo-tz library for accurate timezone detection
      const timeZone = geoTz.find(lat, lng)[0];

      if (timeZone) {
        // Get the offset for the SPECIFIC DATE in this timezone
        const offset = moment.tz(moment(date), timeZone).utcOffset() / 60;
        return offset;
      }
    } catch (error) {
      console.error('Error with geo-tz:', error);
    }

    // Fallback to manual mapping
    return getTimezoneFromCoordsManual(lat, lng, date);
  }
  
  // Enhanced manual timezone detection with historical awareness
  function getTimezoneFromCoordsManual(lat, lng, date = new Date()) {
    // Convert date to year for historical checks
    const year = moment(date).year();
    const month = moment(date).month() + 1; // 1-12
    const northern = lat > 0;

    // India (standardized timezone in 1955)
    if (lat >= 6.0 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5) {
      if (year < 1955) {
        if (lng < 77.0) return 4.85; // Bombay Time (GMT+4:51)
        if (lng > 82.0) return 5.88; // Calcutta Time (GMT+5:53)
      }
      return 5.5; // IST (UTC+05:30)
    }

    // Nepal - UTC+05:45
    if (lat >= 26.0 && lat <= 31.0 && lng >= 80.0 && lng <= 88.5) {
      return 5.75; // NPT (UTC+05:45)
    }

    // For all other regions, use enhanced mathematical calculation
    let baseOffset = calculateBaseOffset(lat, lng);

    // Then check for historical DST
    if (isHistoricalDST(lat, lng, date)) {
      baseOffset += 1;
    }

    return baseOffset;
  }
  
  // Calculate base timezone offset
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
    const northern = lat > 0;

    // No DST before it was invented (first widely used in early 1900s)
    if (year < 1908) return false;

    // General northern hemisphere fallback
    return month > 3 && month < 10;
  }
  
  return router;
};