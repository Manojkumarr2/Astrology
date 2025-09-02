const timezones = require('timezones.json');
const moment = require('moment-timezone');

/**
 * Format timezone offset from minutes to ±HH:mm
 * @param {number} minutes
 * @returns {string}
 */
function formatOffset(minutes) {
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Utility function to lookup timezone information from lat/lon using timezones.json
 * @param {number} lat
 * @param {number} lon
 * @param {string|Date} [datetime] - Optional: a datetime in ISO format or Date object
 * @returns {Object|null} Matching timezone object plus datetime info, or null.
 */
function lookupTimezoneByCoordinates(lat, lon, datetime) {
    let tzObj = null;

    for (const tz of timezones) {
        if (
            tz.lat_min !== undefined && tz.lat_max !== undefined &&
            tz.lon_min !== undefined && tz.lon_max !== undefined
        ) {
            if (
                lat >= tz.lat_min && lat <= tz.lat_max &&
                lon >= tz.lon_min && lon <= tz.lon_max
            ) {
                tzObj = { ...tz };
                break;
            }
        }
    }

    
    if (!tzObj) return null;

    // If datetime is provided, add DST and offset info
    if (datetime) {
        const m = moment.tz(datetime, tzObj.tz_name);
        tzObj.datetime = m.format('YYYY-MM-DD HH:mm:ss z');
        tzObj.dstActive = m.isDST();
        tzObj.offsetMinutes = m.utcOffset();
        tzObj.offsetString = formatOffset(m.utcOffset());
        tzObj.dstAbbreviation = m.zoneAbbr();
        tzObj.inputTime = datetime;
        tzObj.sentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    }
    return tzObj;
}



module.exports = {
    lookupTimezoneByCoordinates,
    formatOffset
};