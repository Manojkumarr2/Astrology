// Global variables
let currentChartData = null;
let isFormSubmitting = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    populateFormSelects();
    bindEventListeners();
    initializeNavigation();
    initializeScrollEffects();
    console.log('🌟 Vedic Astrology Portal initialized by vikramNplus');
}

// Populate form select options
function populateFormSelects() {
    // Populate days
    const daySelect = document.getElementById('day');
    if (daySelect) {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }

    // Populate months
    const monthSelect = document.getElementById('month');
    if (monthSelect) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
    }

    // Populate years (1900 to current year + 10)
    const yearSelect = document.getElementById('year');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear + 10; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }

    // Populate hours
    const hourSelect = document.getElementById('hour');
    if (hourSelect) {
        for (let i = 0; i < 24; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toString().padStart(2, '0');
            hourSelect.appendChild(option);
        }
    }

    // Populate minutes
    const minuteSelect = document.getElementById('minute');
    if (minuteSelect) {
        for (let i = 0; i < 60; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toString().padStart(2, '0');
            minuteSelect.appendChild(option);
        }
    }
}

// Bind Event Listeners
function bindEventListeners() {
    // Astrology form submission
    const astrologyForm = document.getElementById('astrologyForm');
    if (astrologyForm) {
        astrologyForm.addEventListener('submit', handleAstrologySubmit);
    }

    // Compatibility form submission
    const compatibilityForm = document.getElementById('compatibilityForm');
    if (compatibilityForm) {
        compatibilityForm.addEventListener('submit', handleCompatibilitySubmit);
    }

    // Navigation toggle for mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
        });
    });

    // Place search functionality
    const placeInput = document.getElementById('place');
    if (placeInput) {
        placeInput.addEventListener('input', debounce(handlePlaceSearch, 300));
        placeInput.addEventListener('blur', () => {
            setTimeout(hidePlaceSuggestions, 200);
        });
    }

    // Form reset functionality
    const resetButtons = document.querySelectorAll('button[type="reset"]');
    resetButtons.forEach(button => {
        button.addEventListener('click', handleFormReset);
    });

    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#errorNotification') && !e.target.closest('#successNotification')) {
            hideError();
            hideSuccess();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Initialize Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// Initialize Scroll Effects
function initializeScrollEffects() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Handle Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to submit forms
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeForm = document.activeElement.closest('form');
        if (activeForm) {
            e.preventDefault();
            activeForm.dispatchEvent(new Event('submit'));
        }
    }

    // Escape to close modals/notifications
    if (e.key === 'Escape') {
        hideError();
        hideSuccess();
        hidePlaceSuggestions();
    }
}

// Handle Astrology Form Submission
async function handleAstrologySubmit(e) {
    e.preventDefault();
    
    if (isFormSubmitting) return;
    isFormSubmitting = true;
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['day', 'month', 'year', 'hour', 'minute', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        isFormSubmitting = false;
        return;
    }

    // Validate coordinate ranges
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    
    if (lat < -90 || lat > 90) {
        showError('Latitude must be between -90 and 90 degrees');
        isFormSubmitting = false;
        return;
    }
    
    if (lng < -180 || lng > 180) {
        showError('Longitude must be between -180 and 180 degrees');
        isFormSubmitting = false;
        return;
    }

    // Convert to proper format
    const requestData = {
        day: parseInt(data.day),
        month: parseInt(data.month),
        year: parseInt(data.year),
        hour: parseInt(data.hour),
        minute: parseInt(data.minute),
        latitude: lat,
        longitude: lng,
        timezone: parseFloat(data.timezone) || 5.5
    };

    try {
        showLoading('Calculating your cosmic blueprint...');
        const response = await fetch('/api/astrology/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        hideLoading();

        if (result.success) {
            currentChartData = result.data;
            displayResults(result.data);
            scrollToSection('results');
            showSuccess('Birth chart generated successfully!');
            
            // Store chart data for potential behavior analysis
            sessionStorage.setItem('currentChartData', JSON.stringify(result.data));
        } else {
            showError(result.errors ? result.errors.join(', ') : 'Calculation failed');
        }
    } catch (error) {
        hideLoading();
        showError('Network error. Please check your connection and try again.');
        console.error('Error:', error);
    } finally {
        isFormSubmitting = false;
    }
}

// Handle Compatibility Form Submission
async function handleCompatibilitySubmit(e) {
    e.preventDefault();
    
    if (isFormSubmitting) return;
    isFormSubmitting = true;
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['person1Name', 'person1Gender', 'person1Date', 'person1Time', 
                           'person2Name', 'person2Gender', 'person2Date', 'person2Time'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        showError('Please fill in all required fields for both persons');
        isFormSubmitting = false;
        return;
    }

    // Validate dates
    const date1 = new Date(data.person1Date);
    const date2 = new Date(data.person2Date);
    
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        showError('Please enter valid birth dates');
        isFormSubmitting = false;
        return;
    }
    
    // Format data for compatibility API
    const requestData = {
        person1: {
            name: data.person1Name,
            gender: data.person1Gender,
            birthDate: data.person1Date,
            birthTime: data.person1Time,
            latitude: parseFloat(data.person1Lat) || 13.0827,
            longitude: parseFloat(data.person1Lng) || 80.2707
        },
        person2: {
            name: data.person2Name,
            gender: data.person2Gender,
            birthDate: data.person2Date,
            birthTime: data.person2Time,
            latitude: parseFloat(data.person2Lat) || 13.0827,
            longitude: parseFloat(data.person2Lng) || 80.2707
        },
        detailedAnalysis: data.detailedAnalysis === 'on',
        includeRemedies: data.includeRemedies === 'on'
    };

    try {
        showLoading('Analyzing compatibility using Vedic principles...');
        const response = await fetch('/api/compare-jadhagam-porutham', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        hideLoading();

        if (result.success) {
            displayCompatibilityResults(result.data);
            scrollToSection('compatibilityResults');
            showSuccess('Compatibility analysis completed!');
        } else {
            showError(result.message || 'Compatibility calculation failed');
        }
    } catch (error) {
        hideLoading();
        showError('Network error. Please check your connection and try again.');
        console.error('Error:', error);
    } finally {
        isFormSubmitting = false;
    }
}

// Display Results
function displayResults(data) {
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        resultsSection.style.display = 'block';

        // Display basic information
        displayBasicInfo(data);
        
        // Display charts
        displayBirthChart(data.birthChart);
        displayNavamsaChart(data.navamsaChart);
        
        // Display planetary positions
        displayPlanetaryPositions(data.planetaryPositions);
        
        // Display predictions
        displayPredictions(data);
    }
}

// Display Basic Information
function displayBasicInfo(data) {
    const basicInfoContainer = document.getElementById('basicInfo');
    if (!basicInfoContainer) return;
    
    const { rasi, nakshatra, lagna } = data;
    
    basicInfoContainer.innerHTML = `
        <div class="info-item">
            <span class="info-label"><i class="fas fa-moon"></i> Moon Sign (Rasi):</span>
            <span class="info-value">${rasi.name} (${rasi.english})</span>
        </div>
        <div class="info-item">
            <span class="info-label"><i class="fas fa-star"></i> Nakshatra:</span>
            <span class="info-value">${nakshatra.name} - Pada ${nakshatra.pada}</span>
        </div>
        <div class="info-item">
            <span class="info-label"><i class="fas fa-sunrise"></i> Ascendant (Lagna):</span>
            <span class="info-value">${lagna.name} (${lagna.english})</span>
        </div>
        <div class="info-item">
            <span class="info-label"><i class="fas fa-crown"></i> Nakshatra Lord:</span>
            <span class="info-value">${nakshatra.lord}</span>
        </div>
        <div class="info-item">
            <span class="info-label"><i class="fas fa-gem"></i> Rasi Lord:</span>
            <span class="info-value">${rasi.lord}</span>
        </div>
        <div class="info-item">
            <span class="info-label"><i class="fas fa-fire"></i> Element:</span>
            <span class="info-value">${rasi.element}</span>
        </div>
        <div class="info-item">
            <span class="info-label"><i class="fas fa-angle-right"></i> Moon Degree:</span>
            <span class="info-value">${rasi.degree}°</span>
        </div>
        <div class="info-item">
            <span class="info-label"><i class="fas fa-angle-up"></i> Ascendant Degree:</span>
            <span class="info-value">${lagna.degree}°</span>
        </div>
    `;
}

// Display Birth Chart
function displayBirthChart(chartData) {
    const chartContainer = document.getElementById('birthChart');
    if (!chartContainer) return;
    
    if (!chartData || !chartData.chart) {
        chartContainer.innerHTML = '<div class="chart-error"><i class="fas fa-exclamation-triangle"></i><p>Chart data not available</p></div>';
        return;
    }

    const chart = chartData.chart;
    let chartHTML = '<div class="chart-grid">';
    
    // South Indian style house order (4x4 grid)
    const houseOrder = [12, 1, 2, 3, 11, 16, 5, 4, 10, 9, 8, 7, 15, 14, 13, 6];
    
    for (let i = 0; i < 16; i++) {
        const houseNumber = houseOrder[i];
        const houseData = chart[houseNumber] || [];
        const planetsInHouse = Array.isArray(houseData) ? houseData : [];
        
        const isMainHouse = houseNumber <= 12;
        const houseClass = isMainHouse ? 'main-house' : 'sub-house';
        
        chartHTML += `
            <div class="chart-house ${houseClass}" data-house="${houseNumber}" title="House ${houseNumber}">
                <div class="house-number">${houseNumber}</div>
                <div class="planets-container">
                    ${planetsInHouse.map(planet => 
                        `<span class="planet-symbol" title="${planet}" data-planet="${planet}">${getPlanetSymbol(planet)}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    chartHTML += '</div>';
    chartHTML += '<div class="chart-legend"><p><i class="fas fa-info-circle"></i> Hover over planets for details</p></div>';
    
    chartContainer.innerHTML = chartHTML;
    
    // Add hover effects for planets
    addPlanetHoverEffects(chartContainer);
}

// Display Navamsa Chart
function displayNavamsaChart(chartData) {
    const chartContainer = document.getElementById('navamsaChart');
    if (!chartContainer) return;
    
    if (!chartData || !chartData.chart) {
        chartContainer.innerHTML = '<div class="chart-error"><i class="fas fa-exclamation-triangle"></i><p>Navamsa chart data not available</p></div>';
        return;
    }

    const chart = chartData.chart;
    let chartHTML = '<div class="chart-grid navamsa-grid">';
    
    // South Indian style house order (4x4 grid)
    const houseOrder = [12, 1, 2, 3, 11, 16, 5, 4, 10, 9, 8, 7, 15, 14, 13, 6];
    
    for (let i = 0; i < 16; i++) {
        const houseNumber = houseOrder[i];
        const houseData = chart[houseNumber] || [];
        const planetsInHouse = Array.isArray(houseData) ? houseData : [];
        
        const isMainHouse = houseNumber <= 12;
        const houseClass = isMainHouse ? 'main-house' : 'sub-house';
        
        chartHTML += `
            <div class="chart-house ${houseClass}" data-house="${houseNumber}" title="D9 House ${houseNumber}">
                <div class="house-number">D${houseNumber}</div>
                <div class="planets-container">
                    ${planetsInHouse.map(planet => 
                        `<span class="planet-symbol navamsa-planet" title="${planet} in D9" data-planet="${planet}">${getPlanetSymbol(planet)}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    chartHTML += '</div>';
    chartHTML += '<div class="chart-legend"><p><i class="fas fa-info-circle"></i> D9 - Navamsa Chart for marriage & spirituality</p></div>';
    
    chartContainer.innerHTML = chartHTML;
    
    // Add hover effects for planets
    addPlanetHoverEffects(chartContainer);
}

// Add Planet Hover Effects
function addPlanetHoverEffects(container) {
    const planetSymbols = container.querySelectorAll('.planet-symbol');
    planetSymbols.forEach(symbol => {
        symbol.addEventListener('mouseenter', (e) => {
            const planet = e.target.getAttribute('data-planet');
            showPlanetTooltip(e, planet);
        });
        
        symbol.addEventListener('mouseleave', hidePlanetTooltip);
    });
}

// Show Planet Tooltip
function showPlanetTooltip(e, planet) {
    const tooltip = document.createElement('div');
    tooltip.className = 'planet-tooltip';
    tooltip.innerHTML = `
        <strong>${planet}</strong><br>
        <span>${getPlanetDescription(planet)}</span>
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    // Store reference for cleanup
    e.target._tooltip = tooltip;
}

// Hide Planet Tooltip
function hidePlanetTooltip(e) {
    if (e.target._tooltip) {
        document.body.removeChild(e.target._tooltip);
        delete e.target._tooltip;
    }
}

// Get Planet Description
function getPlanetDescription(planet) {
    const descriptions = {
        'Sun': 'Soul, ego, father, authority, leadership',
        'Moon': 'Mind, emotions, mother, nurturing',
        'Mars': 'Energy, courage, brothers, property',
        'Mercury': 'Intelligence, communication, trade',
        'Jupiter': 'Wisdom, guru, knowledge, children',
        'Venus': 'Love, beauty, spouse, luxury',
        'Saturn': 'Discipline, karma, delays, hard work',
        'Rahu': 'Obsession, foreign elements, materialism',
        'Ketu': 'Spirituality, detachment, past karma',
        'Maandhi': 'Malefic influence, obstacles'
    };
    return descriptions[planet] || 'Celestial influence';
}

// Display Planetary Positions
function displayPlanetaryPositions(positions) {
    const container = document.getElementById('planetaryPositions');
    if (!container) return;
    
    const planets = positions.rawPositions;
    
    let html = '<div class="planets-list">';
    
    // Sort planets by traditional order
    const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const sortedPlanets = Object.entries(planets).sort(([a], [b]) => {
        const aIndex = planetOrder.indexOf(a);
        const bIndex = planetOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });
    
    for (const [planet, longitude] of sortedPlanets) {
        const rashi = getRashiFromDegree(longitude);
        const degree = longitude % 30;
        const nakshatra = getNakshatraFromDegree(longitude);
        
        html += `
            <div class="planet-position" data-planet="${planet}">
                <div class="planet-info">
                    <span class="planet-name">
                        <span class="planet-symbol-small">${getPlanetSymbol(planet)}</span>
                        ${planet}
                    </span>
                    <span class="planet-details">
                        <span class="planet-degree">${degree.toFixed(2)}°</span>
                        <span class="planet-rashi">${rashi}</span>
                        <span class="planet-nakshatra">${nakshatra}</span>
                    </span>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Add additional astronomical data
    html += `
        <div class="astronomical-data">
            <div class="data-item">
                <span class="data-label"><i class="fas fa-compass"></i> Ayanamsa:</span>
                <span class="data-value">${positions.ayanamsa}°</span>
            </div>
            <div class="data-item">
                <span class="data-label"><i class="fas fa-arrow-up"></i> Ascendant:</span>
                <span class="data-value">${positions.ascendant}° (${getRashiFromDegree(positions.ascendant)})</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Get Nakshatra from Degree
function getNakshatraFromDegree(longitude) {
    const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    
    const nakshatraIndex = Math.floor(longitude / (360 / 27));
    return nakshatras[nakshatraIndex] || 'Unknown';
}

// Display Predictions
function displayPredictions(data) {
    const container = document.getElementById('predictions');
    if (!container) return;
    
    const { rasi, nakshatra, lagna, additionalInfo } = data;
    
    container.innerHTML = `
        <div class="predictions-grid">
            <div class="prediction-section moon-insights">
                <h4><i class="fas fa-moon"></i> Moon Sign Insights</h4>
                <div class="prediction-content">
                    <p>Your Moon is placed in <strong>${rasi.name}</strong>, which is ruled by <strong>${rasi.lord}</strong>. 
                    This placement reveals your emotional nature, instincts, and subconscious mind patterns.</p>
                    <div class="prediction-details">
                        <div class="detail-item">
                            <span class="detail-label">Element:</span>
                            <span class="detail-value">${rasi.element}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Degree:</span>
                            <span class="detail-value">${rasi.degree}°</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Nature:</span>
                            <span class="detail-value">${getRashiNature(rasi.name)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="prediction-section nakshatra-insights">
                <h4><i class="fas fa-star"></i> Nakshatra Characteristics</h4>
                <div class="prediction-content">
                    <p>You are born under <strong>${nakshatra.name}</strong> nakshatra, pada ${nakshatra.pada}, 
                    ruled by <strong>${nakshatra.lord}</strong>. This influences your personality traits and life path.</p>
                    <div class="prediction-details">
                        <div class="detail-item">
                            <span class="detail-label">Deity:</span>
                            <span class="detail-value">${nakshatra.deity}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Rashi:</span>
                            <span class="detail-value">${nakshatra.rashi}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Symbol:</span>
                            <span class="detail-value">${getNakshatraSymbol(nakshatra.name)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="prediction-section ascendant-insights">
                <h4><i class="fas fa-sunrise"></i> Ascendant Analysis</h4>
                <div class="prediction-content">
                    <p>Your rising sign is <strong>${lagna.name}</strong>, ruled by <strong>${lagna.lord}</strong>. 
                    This shapes your physical appearance, personality, and how others perceive you.</p>
                    <div class="prediction-details">
                        <div class="detail-item">
                            <span class="detail-label">Element:</span>
                            <span class="detail-value">${lagna.element}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Degree:</span>
                            <span class="detail-value">${lagna.degree}°</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Quality:</span>
                            <span class="detail-value">${getRashiQuality(lagna.name)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="prediction-section birth-details">
                <h4><i class="fas fa-info-circle"></i> Birth Details</h4>
                <div class="prediction-content">
                    <div class="birth-info">
                        <div class="detail-item">
                            <span class="detail-label"><i class="fas fa-calendar"></i> Birth Time:</span>
                            <span class="detail-value">${formatDateTime(additionalInfo.birthDateTime)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><i class="fas fa-map-marker-alt"></i> Coordinates:</span>
                            <span class="detail-value">${additionalInfo.coordinates.latitude}°N, ${additionalInfo.coordinates.longitude}°E</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><i class="fas fa-clock"></i> Timezone:</span>
                            <span class="detail-value">GMT${additionalInfo.timezone >= 0 ? '+' : ''}${additionalInfo.timezone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><i class="fas fa-user"></i> Generated by:</span>
                            <span class="detail-value">vikramNplus</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get Rashi Nature
function getRashiNature(rashiName) {
    const natures = {
        'Aries': 'Cardinal Fire', 'Taurus': 'Fixed Earth', 'Gemini': 'Mutable Air',
        'Cancer': 'Cardinal Water', 'Leo': 'Fixed Fire', 'Virgo': 'Mutable Earth',
        'Libra': 'Cardinal Air', 'Scorpio': 'Fixed Water', 'Sagittarius': 'Mutable Fire',
        'Capricorn': 'Cardinal Earth', 'Aquarius': 'Fixed Air', 'Pisces': 'Mutable Water'
    };
    return natures[rashiName] || 'Unknown';
}

// Get Rashi Quality
function getRashiQuality(rashiName) {
    const qualities = {
        'Aries': 'Movable', 'Taurus': 'Fixed', 'Gemini': 'Dual',
        'Cancer': 'Movable', 'Leo': 'Fixed', 'Virgo': 'Dual',
        'Libra': 'Movable', 'Scorpio': 'Fixed', 'Sagittarius': 'Dual',
        'Capricorn': 'Movable', 'Aquarius': 'Fixed', 'Pisces': 'Dual'
    };
    return qualities[rashiName] || 'Unknown';
}

// Get Nakshatra Symbol
function getNakshatraSymbol(nakshatraName) {
    const symbols = {
        'Ashwini': 'Horse\'s head', 'Bharani': 'Yoni', 'Krittika': 'Razor',
        'Rohini': 'Cart', 'Mrigashira': 'Deer\'s head', 'Ardra': 'Teardrop',
        'Punarvasu': 'Bow and quiver', 'Pushya': 'Flower', 'Ashlesha': 'Serpent',
        'Magha': 'Royal throne', 'Purva Phalguni': 'Front legs of bed', 'Uttara Phalguni': 'Back legs of bed',
        'Hasta': 'Hand', 'Chitra': 'Bright jewel', 'Swati': 'Young plant',
        'Vishakha': 'Triumphal arch', 'Anuradha': 'Lotus', 'Jyeshtha': 'Circular amulet',
        'Mula': 'Bunch of roots', 'Purva Ashadha': 'Elephant tusk', 'Uttara Ashadha': 'Elephant tusk',
        'Shravana': 'Ear', 'Dhanishta': 'Drum', 'Shatabhisha': 'Empty circle',
        'Purva Bhadrapada': 'Front legs of funeral cot', 'Uttara Bhadrapada': 'Back legs of funeral cot', 'Revati': 'Fish'
    };
    return symbols[nakshatraName] || 'Unknown';
}

// Display Compatibility Results
function displayCompatibilityResults(data) {
    const resultsSection = document.getElementById('compatibilityResults');
    if (!resultsSection) return;
    
    resultsSection.style.display = 'block';

    // Update compatibility score
    updateCompatibilityScore(data.compatibility.overallPercentage, data.compatibility.overallGrade);
    
    // Update recommendation
    const gradeElement = document.getElementById('compatibilityGrade');
    const recommendationElement = document.getElementById('compatibilityRecommendation');
    
    if (gradeElement) gradeElement.textContent = data.compatibility.overallGrade;
    if (recommendationElement) recommendationElement.textContent = data.compatibility.recommendationStatus;
    
    // Display porutham details
    displayPoruthamDetails(data.poruthams);
}

// Update Compatibility Score Circle
function updateCompatibilityScore(percentage, grade) {
    const progressRing = document.querySelector('.progress-ring-progress');
    const scoreNumber = document.querySelector('.score-number');
    
    if (!progressRing || !scoreNumber) return;
    
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    
    const offset = circumference - (percentage / 100) * circumference;
    
    // Animate the progress ring
    progressRing.style.strokeDashoffset = circumference;
    setTimeout(() => {
        progressRing.style.strokeDashoffset = offset;
    }, 100);
    
    // Animate the score number
    animateNumber(scoreNumber, 0, percentage, 1500);
    
    // Add gradient definition if not exists
    const svg = document.querySelector('.progress-ring');
    if (svg && !svg.querySelector('#gradient')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'gradient');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#8B5CF6');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#06B6D4');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
    }
}

// Animate Number
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * easeOutQuart);
        
        element.textContent = `${current}%`;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Display Porutham Details
function displayPoruthamDetails(poruthams) {
    const container = document.getElementById('poruthamDetails');
    if (!container || !poruthams) return;
    
    let html = '<div class="porutham-grid">';
    
    for (const [name, details] of Object.entries(poruthams)) {
        const compatible = details.compatible !== false;
        const statusClass = compatible ? 'compatible' : 'incompatible';
        const statusText = compatible ? 'Compatible' : 'Not Compatible';
        const statusIcon = compatible ? 'fa-check-circle' : 'fa-times-circle';
        
        html += `
            <div class="porutham-item ${statusClass}">
                <div class="porutham-header">
                    <span class="porutham-name">
                        <i class="fas ${statusIcon}"></i>
                        ${formatPoruthamName(name)}
                    </span>
                    <span class="porutham-status ${statusClass}">${statusText}</span>
                </div>
                <div class="porutham-description">
                    ${details.description || getPoruthamDescription(name)}
                    ${details.score !== undefined ? `<br><strong>Score:</strong> ${details.score}` : ''}
                    ${details.points !== undefined ? `<br><strong>Points:</strong> ${details.points}` : ''}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Format Porutham Name
function formatPoruthamName(name) {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
}

// Get Porutham Description
function getPoruthamDescription(name) {
    const descriptions = {
        'dinaPorutham': 'Compatibility of birth stars for health and prosperity',
        'ganaPorutham': 'Temperament compatibility between divine, human, and demonic natures',
        'mahendraPorutham': 'Ensures progeny and continuation of family lineage',
        'streeDeerghaPorutham': 'Longevity and well-being of the female partner',
        'yoniPorutham': 'Sexual compatibility and intimate harmony',
        'rasiPorutham': 'Mental compatibility and understanding between partners',
        'rasiLordPorutham': 'Harmony between ruling planets of moon signs',
        'vasiyaPorutham': 'Mutual attraction and control in relationship',
        'rajjuPorutham': 'Longevity and avoiding widowhood',
        'vedhaPorutham': 'Avoiding conflict and ensuring peaceful coexistence'
    };
    return descriptions[name] || 'This aspect affects marital harmony and compatibility.';
}

// Generate Behavior Analysis
async function generateBehaviorAnalysis() {
    // Get chart data from current session or storage
    let chartData = currentChartData;
    if (!chartData) {
        const storedData = sessionStorage.getItem('currentChartData');
        if (storedData) {
            chartData = JSON.parse(storedData);
        }
    }
    
    if (!chartData) {
        showError('Please generate a birth chart first before behavior analysis');
        return;
    }

    // Extract the input data needed for behavior API
    const inputData = {
        day: chartData.additionalInfo?.birthDateTime ? new Date(chartData.additionalInfo.birthDateTime).getDate() : null,
        month: chartData.additionalInfo?.birthDateTime ? new Date(chartData.additionalInfo.birthDateTime).getMonth() + 1 : null,
        year: chartData.additionalInfo?.birthDateTime ? new Date(chartData.additionalInfo.birthDateTime).getFullYear() : null,
        hour: chartData.additionalInfo?.birthDateTime ? new Date(chartData.additionalInfo.birthDateTime).getHours() : null,
        minute: chartData.additionalInfo?.birthDateTime ? new Date(chartData.additionalInfo.birthDateTime).getMinutes() : null,
        latitude: chartData.additionalInfo?.coordinates?.latitude || 13.0827,
        longitude: chartData.additionalInfo?.coordinates?.longitude || 80.2707,
        timezone: chartData.additionalInfo?.timezone || 5.5
    };

    // Validate that we have the required data
    if (!inputData.day || !inputData.month || !inputData.year || inputData.hour === null || inputData.minute === null) {
        showError('Insufficient birth data for behavior analysis');
        return;
    }

    try {
        showLoading('Analyzing personality traits and behavior patterns...');
        const response = await fetch('/api/behavior', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData)
        });

        const result = await response.json();
        hideLoading();

        if (result.success) {
            displayBehaviorResults(result.data || result);
            showSuccess('Behavior analysis completed successfully!');
        } else {
            showError(result.message || 'Behavior analysis failed');
        }
    } catch (error) {
        hideLoading();
        showError('Network error during behavior analysis. Please try again.');
        console.error('Error:', error);
    }
}

// Display Behavior Results
function displayBehaviorResults(data) {
    const container = document.getElementById('behaviorResults');
    if (!container) return;
    
    container.style.display = 'block';
    
    let html = '<div class="behavior-header"><h3><i class="fas fa-brain"></i> Personality & Behavior Analysis</h3></div>';
    html += '<div class="behavior-grid">';
    
    // Handle different data structures
    if (data.predictions && typeof data.predictions === 'object') {
        data = data.predictions;
    }
    
    // Display each category
    for (const [category, analysis] of Object.entries(data)) {
        if (typeof analysis === 'object' && (analysis.description || analysis.traits || analysis.characteristics)) {
            const iconClass = getBehaviorCategoryIcon(category);
            const categoryTitle = formatCategoryTitle(category);
            
            html += `
                <div class="behavior-item" data-category="${category}">
                    <div class="behavior-header-item">
                        <i class="fas ${iconClass}"></i>
                        <h4>${categoryTitle}</h4>
                    </div>
                    <div class="behavior-content">
                        ${analysis.description ? `<p class="behavior-description">${analysis.description}</p>` : ''}
                        ${analysis.characteristics ? `<p class="behavior-description">${analysis.characteristics}</p>` : ''}
                        
                        ${analysis.traits ? `
                            <div class="behavior-traits">
                                <strong><i class="fas fa-tags"></i> Key Traits:</strong>
                                <div class="traits-list">
                                    ${Array.isArray(analysis.traits) ? 
                                        analysis.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('') :
                                        `<span class="trait-tag">${analysis.traits}</span>`
                                    }
                                </div>
                            </div>
                        ` : ''}
                        
                        ${analysis.recommendations ? `
                            <div class="behavior-recommendations">
                                <strong><i class="fas fa-lightbulb"></i> Recommendations:</strong>
                                <p>${analysis.recommendations}</p>
                            </div>
                        ` : ''}
                        
                        ${analysis.strengths ? `
                            <div class="behavior-strengths">
                                <strong><i class="fas fa-star"></i> Strengths:</strong>
                                <p>${Array.isArray(analysis.strengths) ? analysis.strengths.join(', ') : analysis.strengths}</p>
                            </div>
                        ` : ''}
                        
                        ${analysis.challenges ? `
                            <div class="behavior-challenges">
                                <strong><i class="fas fa-exclamation-triangle"></i> Challenges:</strong>
                                <p>${Array.isArray(analysis.challenges) ? analysis.challenges.join(', ') : analysis.challenges}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else if (typeof analysis === 'string') {
            // Handle simple string descriptions
            const iconClass = getBehaviorCategoryIcon(category);
            const categoryTitle = formatCategoryTitle(category);
            
            html += `
                <div class="behavior-item" data-category="${category}">
                    <div class="behavior-header-item">
                        <i class="fas ${iconClass}"></i>
                        <h4>${categoryTitle}</h4>
                    </div>
                    <div class="behavior-content">
                        <p class="behavior-description">${analysis}</p>
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    
    // Add download option
    html += `
        <div class="behavior-actions">
            <button class="btn btn-outline" onclick="downloadBehaviorReport()">
                <i class="fas fa-download"></i> Download Report
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

// Get Behavior Category Icon
function getBehaviorCategoryIcon(category) {
    const icons = {
        'personality': 'fa-user-circle',
        'career': 'fa-briefcase',
        'relationships': 'fa-heart',
        'health': 'fa-heartbeat',
        'finance': 'fa-coins',
        'education': 'fa-graduation-cap',
        'family': 'fa-home',
        'spirituality': 'fa-om',
        'communication': 'fa-comments',
        'leadership': 'fa-crown',
        'creativity': 'fa-palette',
        'emotions': 'fa-smile',
        'mentalHealth': 'fa-brain',
        'socialLife': 'fa-users',
        'lifestyle': 'fa-life-ring'
    };
    return icons[category] || 'fa-info-circle';
}

// Format Category Title
function formatCategoryTitle(category) {
    return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Download Behavior Report
function downloadBehaviorReport() {
    const behaviorContent = document.getElementById('behaviorResults');
    if (!behaviorContent) {
        showError('No behavior report available to download');
        return;
    }

    const reportData = {
        title: 'Vedic Astrology Behavior Analysis Report',
        generatedBy: 'vikramNplus',
        timestamp: new Date().toISOString(),
        content: behaviorContent.innerText
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `behavior-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Behavior report downloaded successfully!');
}

// Utility Functions

// Get Planet Symbol
function getPlanetSymbol(planet) {
    const symbols = {
        'Sun': '☉',
        'Moon': '☽',
        'Mars': '♂',
        'Mercury': '☿',
        'Jupiter': '♃',
        'Venus': '♀',
        'Saturn': '♄',
        'Rahu': '☊',
        'Ketu': '☋',
        'Uranus': '♅',
        'Neptune': '♆',
        'Pluto': '♇',
        'Maandhi': '⚴'
    };
    return symbols[planet] || planet.charAt(0);
}

// Get Rashi from Degree
function getRashiFromDegree(degree) {
    const rashis = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const rashiIndex = Math.floor(degree / 30);
    return rashis[rashiIndex] || 'Unknown';
}

// Format Date Time
function formatDateTime(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
    } catch (error) {
        return dateTimeString;
    }
}

// Handle Place Search
async function handlePlaceSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 3) {
        hidePlaceSuggestions();
        return;
    }

    try {
        // Use OpenStreetMap Nominatim API for geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
        const results = await response.json();
        
        if (results && results.length > 0) {
            showPlaceSuggestions(results);
        } else {
            hidePlaceSuggestions();
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        hidePlaceSuggestions();
    }
}

// Show Place Suggestions
function showPlaceSuggestions(places) {
    const container = document.getElementById('locationSuggestions');
    if (!container) return;
    
    if (places.length === 0) {
        hidePlaceSuggestions();
        return;
    }

    let html = '';
    places.forEach((place, index) => {
        const displayName = place.display_name.length > 60 ? 
            place.display_name.substring(0, 60) + '...' : 
            place.display_name;
            
        html += `
            <div class="location-suggestion" 
                 data-lat="${place.lat}" 
                 data-lng="${place.lon}"
                 data-name="${place.display_name}"
                 onclick="selectPlace('${place.display_name.replace(/'/g, "\\'")}', ${place.lat}, ${place.lon})"
                 onkeydown="handleSuggestionKeydown(event, '${place.display_name.replace(/'/g, "\\'")}', ${place.lat}, ${place.lon})">
                <i class="fas fa-map-marker-alt"></i>
                <span>${displayName}</span>
            </div>
        `;
    });

    container.innerHTML = html;
    container.style.display = 'block';
}

// Handle Suggestion Keydown
function handleSuggestionKeydown(event, name, lat, lng) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectPlace(name, lat, lng);
    }
}

// Hide Place Suggestions
function hidePlaceSuggestions() {
    const container = document.getElementById('locationSuggestions');
    if (container) {
        container.style.display = 'none';
    }
}

// Select Place
function selectPlace(name, lat, lng) {
    const placeInput = document.getElementById('place');
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    
    if (placeInput) placeInput.value = name;
    if (latInput) latInput.value = parseFloat(lat).toFixed(4);
    if (lngInput) lngInput.value = parseFloat(lng).toFixed(4);
    
    hidePlaceSuggestions();
    showSuccess('Location selected successfully!');
}

// Handle Form Reset
function handleFormReset(e) {
    // Hide results sections
    const resultsSection = document.getElementById('results');
    const compatibilitySection = document.getElementById('compatibilityResults');
    const behaviorSection = document.getElementById('behaviorResults');
    
    if (resultsSection) resultsSection.style.display = 'none';
    if (compatibilitySection) compatibilitySection.style.display = 'none';
    if (behaviorSection) behaviorSection.style.display = 'none';
    
    // Clear current chart data
    currentChartData = null;
    sessionStorage.removeItem('currentChartData');
    
    // Clear location suggestions
    hidePlaceSuggestions();
    
    // Show success message
    showSuccess('Form reset successfully!');
}

// Show Loading
function showLoading(message = 'Calculating your cosmic blueprint...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const loadingText = overlay.querySelector('p');
        if (loadingText) loadingText.textContent = message;
        overlay.style.display = 'flex';
    }
}

// Hide Loading
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Show Error
function showError(message) {
    hideSuccess(); // Hide any existing success message
    
    let errorDiv = document.getElementById('errorNotification');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorNotification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #FEE2E2;
            color: #991B1B;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            border-left: 4px solid #EF4444;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(errorDiv);
    }

    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button onclick="hideError()" style="margin-left: auto; background: none; border: none; color: #991B1B; cursor: pointer; font-size: 1.2rem; padding: 0 5px;">&times;</button>
    `;
    
    errorDiv.style.display = 'flex';
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto hide after 5 seconds
    setTimeout(hideError, 5000);
}

// Hide Error
function hideError() {
    const errorDiv = document.getElementById('errorNotification');
    if (errorDiv) {
        errorDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 300);
    }
}

// Show Success
function showSuccess(message) {
    hideError(); // Hide any existing error message
    
    let successDiv = document.getElementById('successNotification');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'successNotification';
        successDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #D1FAE5;
            color: #065F46;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            border-left: 4px solid #10B981;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(successDiv);
    }

    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="hideSuccess()" style="margin-left: auto; background: none; border: none; color: #065F46; cursor: pointer; font-size: 1.2rem; padding: 0 5px;">&times;</button>
    `;
    
    successDiv.style.display = 'flex';
    setTimeout(() => {
        successDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto hide after 3 seconds
    setTimeout(hideSuccess, 3000);
}

// Hide Success
function hideSuccess() {
    const successDiv = document.getElementById('successNotification');
    if (successDiv) {
        successDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 300);
    }
}

// Scroll to Section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 80; // Account for fixed navbar
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Download Chart
function downloadChart() {
    if (!currentChartData) {
        showError('No chart data available to download');
        return;
    }

    const chartData = {
        title: 'Vedic Astrology Birth Chart',
        timestamp: new Date().toISOString(),
        generatedBy: 'vikramNplus',
        version: '1.0.0',
        data: currentChartData
    };

    const dataStr = JSON.stringify(chartData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `vedic-chart-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Chart downloaded successfully!');
}

// Share Chart
function shareChart() {
    if (!currentChartData) {
        showError('No chart data available to share');
        return;
    }

    const chartSummary = `🌟 My Vedic Astrology Chart by vikramNplus:

🌙 Moon Sign: ${currentChartData.rasi.name} (${currentChartData.rasi.english})
⭐ Nakshatra: ${currentChartData.nakshatra.name} - Pada ${currentChartData.nakshatra.pada}
🌅 Ascendant: ${currentChartData.lagna.name} (${currentChartData.lagna.english})
👑 Nakshatra Lord: ${currentChartData.nakshatra.lord}
💎 Rasi Lord: ${currentChartData.rasi.lord}

Generated at: ${window.location.href}

#VedicAstrology #BirthChart #vikramNplus`;

    if (navigator.share) {
        navigator.share({
            title: 'My Vedic Astrology Chart by vikramNplus',
            text: chartSummary,
            url: window.location.href
        }).then(() => {
            showSuccess('Chart shared successfully!');
        }).catch((error) => {
            console.error('Error sharing:', error);
            fallbackShare(chartSummary);
        });
    } else {
        fallbackShare(chartSummary);
    }
}

// Fallback Share (Copy to Clipboard) - continued
function fallbackShare(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Chart summary copied to clipboard!');
        }).catch(() => {
            showError('Unable to copy chart summary');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccess('Chart summary copied to clipboard!');
        } catch (err) {
            showError('Unable to copy chart summary');
        }
        document.body.removeChild(textArea);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Advanced Chart Analysis Functions

// Analyze Planetary Strengths
function analyzePlanetaryStrengths(chartData) {
    if (!chartData || !chartData.planetaryPositions) return null;
    
    const planets = chartData.planetaryPositions.rawPositions;
    const analysis = {};
    
    for (const [planet, longitude] of Object.entries(planets)) {
        const rashi = getRashiFromDegree(longitude);
        const degree = longitude % 30;
        
        analysis[planet] = {
            rashi: rashi,
            degree: degree,
            strength: calculatePlanetaryStrength(planet, rashi, degree),
            position: getPlanetaryPosition(planet, rashi)
        };
    }
    
    return analysis;
}

// Calculate Planetary Strength
function calculatePlanetaryStrength(planet, rashi, degree) {
    const exaltationSigns = {
        'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn',
        'Mercury': 'Virgo', 'Jupiter': 'Cancer', 'Venus': 'Pisces',
        'Saturn': 'Libra'
    };
    
    const ownSigns = {
        'Sun': ['Leo'], 'Moon': ['Cancer'], 'Mars': ['Aries', 'Scorpio'],
        'Mercury': ['Gemini', 'Virgo'], 'Jupiter': ['Sagittarius', 'Pisces'],
        'Venus': ['Taurus', 'Libra'], 'Saturn': ['Capricorn', 'Aquarius']
    };
    
    const debilitationSigns = {
        'Sun': 'Libra', 'Moon': 'Scorpio', 'Mars': 'Cancer',
        'Mercury': 'Pisces', 'Jupiter': 'Capricorn', 'Venus': 'Virgo',
        'Saturn': 'Aries'
    };
    
    if (exaltationSigns[planet] === rashi) {
        return 'Exalted';
    } else if (ownSigns[planet] && ownSigns[planet].includes(rashi)) {
        return 'Own Sign';
    } else if (debilitationSigns[planet] === rashi) {
        return 'Debilitated';
    } else {
        return 'Neutral';
    }
}

// Get Planetary Position Description
function getPlanetaryPosition(planet, rashi) {
    const friendlySignsMap = {
        'Sun': ['Aries', 'Leo', 'Sagittarius'],
        'Moon': ['Cancer', 'Scorpio', 'Pisces'],
        'Mars': ['Aries', 'Leo', 'Sagittarius'],
        'Mercury': ['Gemini', 'Virgo', 'Aquarius'],
        'Jupiter': ['Sagittarius', 'Pisces', 'Cancer'],
        'Venus': ['Taurus', 'Libra', 'Pisces'],
        'Saturn': ['Capricorn', 'Aquarius', 'Libra']
    };
    
    if (friendlySignsMap[planet] && friendlySignsMap[planet].includes(rashi)) {
        return 'Favorable';
    }
    return 'Challenging';
}

// Dasha Calculation Functions
function calculateMahadashaSequence(nakshatraLord) {
    const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
    
    const startIndex = dashaLords.indexOf(nakshatraLord);
    const sequence = [];
    
    for (let i = 0; i < 9; i++) {
        const index = (startIndex + i) % 9;
        sequence.push({
            lord: dashaLords[index],
            years: dashaYears[index]
        });
    }
    
    return sequence;
}

// Yoga Detection Functions
function detectYogas(chartData) {
    if (!chartData || !chartData.birthChart) return [];
    
    const yogas = [];
    const chart = chartData.birthChart.chart;
    
    // Detect Raj Yogas
    yogas.push(...detectRajYogas(chart));
    
    // Detect Dhana Yogas
    yogas.push(...detectDhanaYogas(chart));
    
    // Detect Panch Mahapurusha Yogas
    yogas.push(...detectPanchMahapurushaYogas(chart));
    
    return yogas;
}

// Detect Raj Yogas
function detectRajYogas(chart) {
    const yogas = [];
    
    // Check for planets in kendra and trikona houses
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];
    
    // This is a simplified detection - real implementation would be more complex
    yogas.push({
        name: 'Raj Yoga Formation',
        description: 'Combination of kendra and trikona lords creates powerful results',
        strength: 'Medium',
        effects: 'Leadership, authority, success in endeavors'
    });
    
    return yogas;
}

// Detect Dhana Yogas
function detectDhanaYogas(chart) {
    const yogas = [];
    
    // Simplified wealth yoga detection
    yogas.push({
        name: 'Dhana Yoga',
        description: 'Planetary combinations for wealth and prosperity',
        strength: 'Medium',
        effects: 'Financial stability, wealth accumulation'
    });
    
    return yogas;
}

// Detect Panch Mahapurusha Yogas
function detectPanchMahapurushaYogas(chart) {
    const yogas = [];
    
    // These are simplified detections
    const mahapurushaYogas = [
        {name: 'Hamsa Yoga', planet: 'Jupiter', effects: 'Wisdom, spirituality, teaching abilities'},
        {name: 'Malavya Yoga', planet: 'Venus', effects: 'Beauty, luxury, artistic talents'},
        {name: 'Ruchaka Yoga', planet: 'Mars', effects: 'Courage, leadership, military success'},
        {name: 'Bhadra Yoga', planet: 'Mercury', effects: 'Intelligence, communication, business success'},
        {name: 'Shasha Yoga', planet: 'Saturn', effects: 'Hard work, discipline, administrative abilities'}
    ];
    
    return mahapurushaYogas.slice(0, 2); // Return simplified results
}

// Advanced Remedial Measures
function generateRemedialMeasures(chartData) {
    if (!chartData) return null;
    
    const remedies = {
        gems: getGemstoneRecommendations(chartData),
        mantras: getMantraRecommendations(chartData),
        colors: getColorRecommendations(chartData),
        donations: getDonationRecommendations(chartData),
        fasting: getFastingRecommendations(chartData),
        yantra: getYantraRecommendations(chartData)
    };
    
    return remedies;
}

// Gemstone Recommendations
function getGemstoneRecommendations(chartData) {
    const ascendantLord = chartData.lagna.lord;
    const moonSignLord = chartData.rasi.lord;
    
    const gemstones = {
        'Sun': 'Ruby (Manik)',
        'Moon': 'Pearl (Moti)',
        'Mars': 'Red Coral (Moonga)',
        'Mercury': 'Emerald (Panna)',
        'Jupiter': 'Yellow Sapphire (Pukhraj)',
        'Venus': 'Diamond (Heera)',
        'Saturn': 'Blue Sapphire (Neelam)',
        'Rahu': 'Hessonite (Gomed)',
        'Ketu': 'Cat\'s Eye (Lehsunia)'
    };
    
    return [
        {
            stone: gemstones[ascendantLord] || 'Consult an astrologer',
            planet: ascendantLord,
            purpose: 'Strengthen ascendant lord for overall well-being',
            weight: '3-5 carats',
            metal: 'Gold or Silver',
            finger: 'Ring finger',
            day: 'Favorable day based on planet'
        }
    ];
}

// Mantra Recommendations
function getMantraRecommendations(chartData) {
    const mantras = [
        {
            mantra: 'Om Namah Shivaya',
            purpose: 'Overall spiritual growth and protection',
            repetitions: '108 times daily',
            duration: '40 days minimum'
        },
        {
            mantra: 'Gayatri Mantra',
            purpose: 'Wisdom, knowledge, and divine blessings',
            repetitions: '108 times daily',
            duration: 'Continuous practice'
        }
    ];
    
    return mantras;
}

// Color Recommendations
function getColorRecommendations(chartData) {
    const colors = [
        {
            color: 'White',
            purpose: 'Peace, purity, and mental clarity',
            usage: 'Wear on Mondays and during Moon transit'
        },
        {
            color: 'Yellow',
            purpose: 'Wisdom, prosperity, and Jupiter\'s blessings',
            usage: 'Wear on Thursdays and during important events'
        }
    ];
    
    return colors;
}

// Donation Recommendations
function getDonationRecommendations(chartData) {
    const donations = [
        {
            item: 'Food to the needy',
            purpose: 'Overall karma improvement',
            frequency: 'Weekly or monthly',
            day: 'Any day, preferably Sunday'
        },
        {
            item: 'Educational materials',
            purpose: 'Mercury strengthening for intelligence',
            frequency: 'During Mercury transit',
            day: 'Wednesday'
        }
    ];
    
    return donations;
}

// Fasting Recommendations
function getFastingRecommendations(chartData) {
    const fasting = [
        {
            type: 'Ekadashi Vrat',
            purpose: 'Spiritual purification and Lord Vishnu\'s blessings',
            frequency: 'Twice a month (11th day of lunar cycle)',
            method: 'Avoid grains and beans'
        }
    ];
    
    return fasting;
}

// Yantra Recommendations
function getYantraRecommendations(chartData) {
    const yantras = [
        {
            yantra: 'Sri Yantra',
            purpose: 'Prosperity, abundance, and spiritual growth',
            placement: 'Prayer room or northeast direction',
            worship: 'Daily with flowers and incense'
        }
    ];
    
    return yantras;
}

// Print Functionality
function printChart() {
    if (!currentChartData) {
        showError('No chart data available to print');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintableChart(currentChartData);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
    
    showSuccess('Chart sent to printer!');
}

// Generate Printable Chart
function generatePrintableChart(data) {
    const currentDate = new Date().toLocaleString();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vedic Astrology Chart - vikramNplus</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); width: 300px; margin: 20px auto; border: 2px solid #333; }
            .chart-house { border: 1px solid #666; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .info-table th { background-color: #f2f2f2; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Vedic Astrology Birth Chart</h1>
            <p>Generated by vikramNplus on ${currentDate}</p>
        </div>
        
        <div class="section">
            <h2>Basic Information</h2>
            <table class="info-table">
                <tr><th>Moon Sign (Rasi)</th><td>${data.rasi.name} (${data.rasi.english})</td></tr>
                <tr><th>Nakshatra</th><td>${data.nakshatra.name} - Pada ${data.nakshatra.pada}</td></tr>
                <tr><th>Ascendant (Lagna)</th><td>${data.lagna.name} (${data.lagna.english})</td></tr>
                <tr><th>Nakshatra Lord</th><td>${data.nakshatra.lord}</td></tr>
                <tr><th>Rasi Lord</th><td>${data.rasi.lord}</td></tr>
            </table>
        </div>
        
        <div class="section">
            <h2>Birth Chart (Rasi)</h2>
            <div class="chart-grid">
                ${generatePrintableChartGrid(data.birthChart)}
            </div>
        </div>
        
        <div class="section">
            <h2>Planetary Positions</h2>
            <table class="info-table">
                <tr><th>Planet</th><th>Degree</th><th>Rashi</th></tr>
                ${Object.entries(data.planetaryPositions.rawPositions).map(([planet, longitude]) => {
                    const degree = (longitude % 30).toFixed(2);
                    const rashi = getRashiFromDegree(longitude);
                    return `<tr><td>${planet}</td><td>${degree}°</td><td>${rashi}</td></tr>`;
                }).join('')}
            </table>
        </div>
        
        <div class="section">
            <h2>Generated by</h2>
            <p><strong>vikramNplus</strong> - Vedic Astrology Portal</p>
            <p>Visit: ${window.location.origin}</p>
        </div>
    </body>
    </html>
    `;
}

// Generate Printable Chart Grid
function generatePrintableChartGrid(chartData) {
    if (!chartData || !chartData.chart) return '';
    
    const chart = chartData.chart;
    const houseOrder = [12, 1, 2, 3, 11, 16, 5, 4, 10, 9, 8, 7, 15, 14, 13, 6];
    
    let html = '';
    for (let i = 0; i < 16; i++) {
        const houseNumber = houseOrder[i];
        const houseData = chart[houseNumber] || [];
        const planetsInHouse = Array.isArray(houseData) ? houseData : [];
        
        html += `
            <div class="chart-house">
                <div>${houseNumber}</div>
                <div>${planetsInHouse.map(planet => getPlanetSymbol(planet)).join(' ')}</div>
            </div>
        `;
    }
    
    return html;
}

// Export Chart as PDF (requires additional library)
function exportChartAsPDF() {
    showError('PDF export feature requires additional setup. Please use the print option instead.');
}

// Advanced Search Functionality
function initializeAdvancedSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search planets, houses, or yogas...';
    searchInput.className = 'advanced-search';
    searchInput.addEventListener('input', handleAdvancedSearch);
    
    // Add to navigation if needed
    // const nav = document.querySelector('.nav-container');
    // if (nav) nav.appendChild(searchInput);
}

// Handle Advanced Search
function handleAdvancedSearch(e) {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return;
    
    // Search through chart elements
    const searchableElements = document.querySelectorAll('[data-planet], [data-house], .prediction-section, .info-item');
    
    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            element.style.backgroundColor = '#FEF3C7';
            element.style.transition = 'background-color 0.3s ease';
        } else {
            element.style.backgroundColor = '';
        }
    });
}

// Accessibility Improvements
function initializeAccessibility() {
    // Add ARIA labels
    const chartHouses = document.querySelectorAll('.chart-house');
    chartHouses.forEach((house, index) => {
        house.setAttribute('role', 'button');
        house.setAttribute('tabindex', '0');
        house.setAttribute('aria-label', `House ${house.dataset.house || index + 1}`);
    });
    
    // Add keyboard navigation
    chartHouses.forEach(house => {
        house.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                house.click();
            }
        });
    });
}

// Performance Optimization
function optimizeChartRendering() {
    // Use requestAnimationFrame for smooth animations
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            // Defer non-critical chart rendering
            initializeAdvancedFeatures();
        });
    } else {
        setTimeout(initializeAdvancedFeatures, 100);
    }
}

// Initialize Advanced Features
function initializeAdvancedFeatures() {
    initializeAccessibility();
    
    // Add chart interaction features
    addChartInteractivity();
    
    // Initialize tooltips
    initializeTooltips();
}

// Add Chart Interactivity
function addChartInteractivity() {
    const chartHouses = document.querySelectorAll('.chart-house');
    chartHouses.forEach(house => {
        house.addEventListener('click', (e) => {
            const houseNumber = house.dataset.house;
            showHouseDetails(houseNumber);
        });
    });
}

// Show House Details
function showHouseDetails(houseNumber) {
    const houseInfo = getHouseInformation(houseNumber);
    
    const modal = document.createElement('div');
    modal.className = 'house-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>House ${houseNumber} Details</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Significance:</strong> ${houseInfo.significance}</p>
                <p><strong>Represents:</strong> ${houseInfo.represents}</p>
                <p><strong>Element:</strong> ${houseInfo.element}</p>
            </div>
        </div>
        <div class="modal-overlay" onclick="closeModal()"></div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// Get House Information
function getHouseInformation(houseNumber) {
    const houseData = {
        1: { significance: 'Self, personality, physical appearance', represents: 'Ascendant, first impressions, vitality', element: 'Cardinal' },
        2: { significance: 'Wealth, family, speech', represents: 'Financial status, material possessions, values', element: 'Fixed' },
        3: { significance: 'Siblings, courage, communication', represents: 'Short journeys, skills, younger siblings', element: 'Mutable' },
        4: { significance: 'Home, mother, happiness', represents: 'Property, emotional foundation, education', element: 'Cardinal' },
        5: { significance: 'Children, creativity, intelligence', represents: 'Romance, speculation, past life karma', element: 'Fixed' },
        6: { significance: 'Enemies, diseases, service', represents: 'Daily work, health, obstacles', element: 'Mutable' },
        7: { significance: 'Marriage, partnerships, business', represents: 'Spouse, public relations, contracts', element: 'Cardinal' },
        8: { significance: 'Longevity, transformation, hidden things', represents: 'Occult, sudden events, inheritance', element: 'Fixed' },
        9: { significance: 'Fortune, religion, higher learning', represents: 'Guru, philosophy, long journeys', element: 'Mutable' },
        10: { significance: 'Career, reputation, government', represents: 'Professional status, fame, authority', element: 'Cardinal' },
        11: { significance: 'Gains, friends, elder siblings', represents: 'Income, social circle, aspirations', element: 'Fixed' },
        12: { significance: 'Losses, spirituality, foreign lands', represents: 'Expenses, salvation, hidden enemies', element: 'Mutable' }
    };
    
    return houseData[houseNumber] || { significance: 'Unknown', represents: 'Unknown', element: 'Unknown' };
}

// Close Modal
function closeModal() {
    const modal = document.querySelector('.house-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Initialize Tooltips
function initializeTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[title]');
    elementsWithTooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

// Show Tooltip
function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = e.target.title;
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    e.target._customTooltip = tooltip;
    e.target.title = ''; // Temporarily remove title to prevent default tooltip
}

// Hide Tooltip
function hideTooltip(e) {
    if (e.target._customTooltip) {
        e.target._customTooltip.remove();
        delete e.target._customTooltip;
    }
}

// Window resize handler for responsive charts
window.addEventListener('resize', debounce(() => {
    if (currentChartData) {
        // Redraw charts on window resize
        displayBirthChart(currentChartData.birthChart);
        displayNavamsaChart(currentChartData.navamsaChart);
    }
}, 250));

// Initialize charts and advanced features on window load
window.addEventListener('load', () => {
    console.log('🌟 Vedic Astrology Portal fully loaded by vikramNplus');
    optimizeChartRendering();
    
    // Check if there's saved chart data
    const savedData = sessionStorage.getItem('currentChartData');
    if (savedData) {
        try {
            currentChartData = JSON.parse(savedData);
            console.log('📊 Previous chart data restored');
        } catch (error) {
            console.error('Error restoring chart data:', error);
            sessionStorage.removeItem('currentChartData');
        }
    }
});

// Service Worker Registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Error boundary for unhandled errors
window.addEventListener('error', (e) => {
    console.error('Unhandled error:', e.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showError('An unexpected error occurred. Please try again.');
    e.preventDefault();
});

// Dark mode toggle (optional feature)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    showSuccess(`${isDark ? 'Dark' : 'Light'} mode activated!`);
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', initializeDarkMode);

// Export functions for global access
window.vikramNplusAstrology = {
    scrollToSection,
    downloadChart,
    shareChart,
    generateBehaviorAnalysis,
    toggleDarkMode,
    printChart,
    selectPlace,
    hideError,
    hideSuccess,
    closeModal
};

// Final initialization message
console.log('🌟 Vedic Astrology Portal by vikramNplus - Ready for cosmic calculations!');
console.log('📱 Current User:', 'vikramNplus');
console.log('📅 Initialized on:', new Date().toLocaleString());