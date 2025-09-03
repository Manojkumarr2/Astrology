# Vedic Astrology API

A comprehensive Node.js API for Vedic astrology calculations including Rasi, Nakshatra, Lagna, Birth Chart, Porutham compatibility, and Behavior predictions based on ancient Indian astrological principles.

---

## ✨ Features

- 🌙 Rasi (Moon Sign) Calculation
- ⭐ Nakshatra (Lunar Mansion) Analysis
- 🧭 Lagna (Ascendant) Determination
- 📊 Complete Birth Chart Generation
- 🔭 Navamsa Chart (D9) Calculations
- 💑 Porutham Compatibility Analysis
- 🧠 Behavior & Personality Predictions
- 🌍 Automatic Timezone Detection
- ⚡ High Performance with Caching
- 🛡️ Secure with Rate Limiting

---

## 🚀 Installation

**Step 1:** Install the package

```bash
npm install vedic-astrology-api
```

**Step 2:** Import it in your project

```javascript
const { BirthChartGenerator } = require('vedic-astrology-api/lib/utils/birthchart');
```

---

## 📖 Usage Guide

### 1. Generate Birth Chart

```javascript
const { BirthChartGenerator, calculatePlanetaryPositions, calculateAscendant, createDate } = require('vedic-astrology-api/lib/utils');

// Create instance
const birthChartGenerator = new BirthChartGenerator();

// Create date
const date = createDate(1990, 5, 15, 10, 30, 5.5);

// Get planetary positions
const { positions, ayanamsa } = calculatePlanetaryPositions(date, 13.0827, 80.2707);
const ascendant = calculateAscendant(date, 13.0827, 80.2707);

// Generate chart
const birthChart = birthChartGenerator.generateBirthChart(positions, ascendant);

console.log('Houses:', birthChart.houses);
console.log('Planets:', birthChart.planets);
```

---

### 2. Generate Navamsa Chart

```javascript
const { ImprovedNavamsaChart } = require('vedic-astrology-api/lib/utils/navamsachart');

const navamsaCalculator = new ImprovedNavamsaChart();

const navamsaChart = navamsaCalculator.generateNavamsaChart(
  Object.fromEntries(Object.entries(positions).map(([planet, data]) => [planet, data.longitude])),
  ayanamsa,
  ascendant,
  {
    date: '1990-05-15',
    time: '10:30',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 5.5
  }
);

console.log('Navamsa Chart:', navamsaChart);
```

---

### 3. Porutham (Compatibility)

```javascript
const { AccuratePoruthamCalculator } = require('vedic-astrology-api/lib/utils/porutham');

const poruthamCalculator = new AccuratePoruthamCalculator();

const person1Data = {
  name: 'John',
  gender: 'male',
  date: new Date('1990-05-15T10:30:00'),
  latitude: 13.0827,
  longitude: 80.2707
};

const person2Data = {
  name: 'Jane',
  gender: 'female',
  date: new Date('1992-08-22T14:45:00'),
  latitude: 12.9716,
  longitude: 77.5946
};

// Simplified
const simple = await poruthamCalculator.getSimplifiedCompatibility(person1Data, person2Data);
console.log('Compatibility %:', simple.compatibility.percentage);

// Detailed
const detailed = await poruthamCalculator.calculatePortuthamWithValidation(person1Data, person2Data);
console.log('Porutham Details:', detailed.poruthams);
```

---

### 4. Behavior Predictions

```javascript
const { BehaviorPredictor } = require('vedic-astrology-api/lib/utils/behaviorPredictor');

const behaviorPredictor = new BehaviorPredictor();

const behavior = behaviorPredictor.generateBehaviorPredictions(
  birthChart,
  {
    ayanamsa,
    ascendant,
    rawPositions: Object.fromEntries(Object.entries(positions).map(([planet, data]) => [planet, data.longitude]))
  },
  ascendant,
  {
    birthDateTime: date.toISOString(),
    coordinates: { latitude: 13.0827, longitude: 80.2707 },
    timezone: 5.5
  }
);

console.log('Behavior Predictions:', behavior);
```

---

### 5. Utility Functions

```javascript
const { getRashiFromLongitude, getNakshatraFromLongitude, validateInput } = require('vedic-astrology-api/lib/utils/common');

const moonLongitude = positions.Moon.longitude;
console.log('Moon Rashi:', getRashiFromLongitude(moonLongitude));
console.log('Moon Nakshatra:', getNakshatraFromLongitude(moonLongitude));
console.log('Lagna:', getRashiFromLongitude(ascendant));

// Validate
const errors = validateInput({
  year: 1990,
  month: 5,
  day: 15,
  hour: 10,
  minute: 30,
  latitude: 13.0827,
  longitude: 80.2707,
  timezone: 5.5
});

if (errors.length > 0) console.error(errors);
```

---

### 6. Complete Service Example

```javascript
const {
  BirthChartGenerator,
  ImprovedNavamsaChart,
  AccuratePoruthamCalculator,
  BehaviorPredictor,
  calculatePlanetaryPositions,
  calculateAscendant,
  createDate,
  validateInput
} = require('vedic-astrology-api/lib/utils');

class CustomAstrologyService {
  constructor() {
    this.birthChartGenerator = new BirthChartGenerator();
    this.navamsaCalculator = new ImprovedNavamsaChart();
    this.poruthamCalculator = new AccuratePoruthamCalculator();
    this.behaviorPredictor = new BehaviorPredictor();
  }

  async generateCompleteReport(birthData) {
    const errors = validateInput(birthData);
    if (errors.length > 0) throw new Error(errors.join(', '));

    const date = createDate(
      birthData.year,
      birthData.month,
      birthData.day,
      birthData.hour,
      birthData.minute,
      birthData.timezone
    );
    const { positions, ayanamsa } = calculatePlanetaryPositions(date, birthData.latitude, birthData.longitude);
    const ascendant = calculateAscendant(date, birthData.latitude, birthData.longitude);

    return {
      birthChart: this.birthChartGenerator.generateBirthChart(positions, ascendant),
      navamsaChart: this.navamsaCalculator.generateNavamsaChart(
        Object.fromEntries(Object.entries(positions).map(([planet, data]) => [planet, data.longitude])),
        ayanamsa,
        ascendant,
        {
          date: `${birthData.year}-${birthData.month}-${birthData.day}`,
          time: `${birthData.hour}:${birthData.minute}`,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone
        }
      ),
      behaviorPredictions: this.behaviorPredictor.generateBehaviorPredictions(
        this.birthChartGenerator.generateBirthChart(positions, ascendant),
        {
          ayanamsa,
          ascendant,
          rawPositions: Object.fromEntries(Object.entries(positions).map(([planet, data]) => [planet, data.longitude]))
        },
        ascendant,
        {
          birthDateTime: date.toISOString(),
          coordinates: { latitude: birthData.latitude, longitude: birthData.longitude },
          timezone: birthData.timezone
        }
      ),
      planetaryPositions: positions,
      ayanamsa,
      ascendant
    };
  }
}

const astrologyService = new CustomAstrologyService();
const report = await astrologyService.generateCompleteReport({
  year: 1990,
  month: 5,
  day: 15,
  hour: 10,
  minute: 30,
  latitude: 13.0827,
  longitude: 80.2707,
  timezone: 5.5
});
```

