// Constants
const TEST_RESULTS_BASE_URL = 'https://bundler-test-results.erc4337.io/';
const NUMBER_OF_LATEST_TESTS_RESULTS = 10;

// State management
let currentVersion = '08';
let currentData = null;
let isDarkMode = false;

// DOM elements - will be initialized after DOM loads
let loadingState, errorState, overallResults, perTestResults, versionTitle, errorMessage, themeToggle, sunIcon, moonIcon;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    loadingState = document.getElementById('loadingState');
    errorState = document.getElementById('errorState');
    overallResults = document.getElementById('overallResults');
    perTestResults = document.getElementById('perTestResults');
    versionTitle = document.getElementById('versionTitle');
    errorMessage = document.getElementById('errorMessage');
    themeToggle = document.getElementById('themeToggle');
    sunIcon = document.getElementById('sunIcon');
    moonIcon = document.getElementById('moonIcon');
    
    // Initialize theme first
    initializeTheme();
    initializeVersionSelector();
    loadTestResults();
});

// Theme management
function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        enableDarkMode();
    }
    
    // Add event listener after ensuring themeToggle exists
    if (themeToggle) {
        themeToggle.removeEventListener('click', toggleTheme); // Remove any existing listeners
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function enableDarkMode() {
    document.documentElement.classList.add('dark');
    isDarkMode = true;
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
    localStorage.setItem('theme', 'dark');
}

function enableLightMode() {
    document.documentElement.classList.remove('dark');
    isDarkMode = false;
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
    localStorage.setItem('theme', 'light');
}

function toggleTheme() {
    console.log('Toggle clicked!');
    console.log('isDarkMode:', isDarkMode);
    console.log('themeToggle:', themeToggle);
    console.log('sunIcon:', sunIcon);
    console.log('moonIcon:', moonIcon);
    
    try {
        if (isDarkMode) {
            console.log('Enabling light mode...');
            enableLightMode();
        } else {
            console.log('Enabling dark mode...');
            enableDarkMode();
        }
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

// Version selector management
function initializeVersionSelector() {
    // Get initial version from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const versionParam = urlParams.get('v');
    if (versionParam && ['06', '07', '08'].includes(versionParam)) {
        currentVersion = versionParam;
    }
    
    // Set up version buttons
    document.querySelectorAll('.version-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const version = this.getAttribute('data-version');
            if (version !== currentVersion) {
                currentVersion = version;
                updateVersionUI();
                updateURL();
                loadTestResults();
            }
        });
    });
    
    updateVersionUI();
}

function updateVersionUI() {
    // Update button states
    document.querySelectorAll('.version-btn').forEach(btn => {
        const version = btn.getAttribute('data-version');
        if (version === currentVersion) {
            btn.className = 'version-btn px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors';
        } else {
            btn.className = 'version-btn px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';
        }
    });
    
    // Update title
    if (currentVersion === '08') {
        versionTitle.textContent = 'Showing results for latest bundler version (0.8)';
    } else {
        versionTitle.textContent = `Showing results for legacy bundler version (0.${currentVersion})`;
    }
}

function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('v', currentVersion);
    window.history.pushState({}, '', url);
}

// Data fetching and processing
async function loadTestResults() {
    showLoading();
    hideError();
    
    try {
        const url = `${TEST_RESULTS_BASE_URL}v${currentVersion}/history/history.json`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentData = remapBundlerNames(data);
        
        renderTables();
        hideLoading();
    } catch (error) {
        console.error('Error loading test results:', error);
        showError('Failed to load test results. Please check your connection and try again.');
        hideLoading();
    }
}

function showLoading() {
    loadingState.classList.remove('hidden');
    overallResults.classList.add('hidden');
    perTestResults.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
    overallResults.classList.remove('hidden');
    perTestResults.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
    overallResults.classList.add('hidden');
    perTestResults.classList.add('hidden');
}

function hideError() {
    errorState.classList.add('hidden');
}

// Data processing functions (adapted from original React logic)
function mapBundlerName(name) {
    return name === 'aa-bundler-rust-launcher' ? 'silius' :
        name.replace('-bundler', '').replace('-launcher', '');
}

function remapBundlerNames(data) {
    const ret = {};
    
    function entriesToObject(e) {
        return e.reduce((set, val) => ({ ...set, [val[0]]: val[1] }), {});
    }
    
    for (const date of Object.keys(data)) {
        ret[date] = entriesToObject(
            Object.entries(data[date])
                .map(([k, v]) => [mapBundlerName(k), v])
        );
    }
    return ret;
}

function parseDateTime(dateTimeString) {
    if (dateTimeString.length !== 15) {
        throw Error("invalid date input string");
    }
    
    const year = Number(dateTimeString.slice(0, 4));
    const month = Number(dateTimeString.slice(4, 6)) - 1;
    const day = Number(dateTimeString.slice(6, 8));
    const hour = Number(dateTimeString.slice(9, 11));
    const minute = Number(dateTimeString.slice(11, 13));
    const second = Number(dateTimeString.slice(13));
    
    const dateTime = new Date(year, month, day, hour, minute, second);
    
    if (isNaN(dateTime.getTime())) {
        throw Error("invalid date input string");
    }
    
    return dateTime;
}

function findLatestDateTimes(json, x) {
    const dateTimes = [];
    const mostRecentByDate = new Map();
    
    for (const key in json) {
        const dateTime = parseDateTime(key);
        if (dateTime !== null) {
            const dateOnly = dateTime.toISOString().split('T')[0];
            const existingEntry = mostRecentByDate.get(dateOnly);
            
            if (!existingEntry || existingEntry.dateTime < dateTime) {
                mostRecentByDate.set(dateOnly, { dateTime, key });
            }
        }
    }
    
    if (mostRecentByDate.size === 0) {
        return null;
    }
    
    const sortedDateTimes = Array.from(mostRecentByDate.values());
    sortedDateTimes.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
    
    return sortedDateTimes.slice(0, x).map(dt => dt.key);
}

function getLatestTestResults(data) {
    const latestDates = findLatestDateTimes(data, NUMBER_OF_LATEST_TESTS_RESULTS);
    if (!latestDates) {
        throw Error("can't find latest test results");
    }
    
    const latestTestResults = {};
    latestDates.forEach((latestDate) => {
        const dateTimeOfLatestTest = parseDateTime(latestDate);
        if (!dateTimeOfLatestTest) throw Error("invalid date time");
        if (dateTimeOfLatestTest < parseDateTime('20230223/192624')) return; // first trial tests, lots of meaningless errors
        
        const latestTest = data[latestDate];
        Object.keys(latestTest).forEach(bundlerName => {
            const latestTestResult = {
                name: latestTest[bundlerName].name,
                totalTests: parseInt(latestTest[bundlerName].tests),
                totalErrors: parseInt(latestTest[bundlerName].errors) + parseInt(latestTest[bundlerName].failures),
            };
            
            if (!latestTestResults[latestDate]) latestTestResults[latestDate] = {};
            latestTestResults[latestDate][bundlerName] = latestTestResult;
        });
    });
    return latestTestResults;
}

function countBundlerNames(results) {
    const bundlerCounts = {};
    
    for (const dateTime in results) {
        const wrappers = results[dateTime];
        for (const bundlerName in wrappers) {
            bundlerCounts[bundlerName] = (bundlerCounts[bundlerName] || 0) + 1;
        }
    }
    
    return bundlerCounts;
}

function getTestResultsEnum(testcase) {
    if (testcase['failure'] || testcase['error']) return 'error';
    if (testcase['skipped']) return 'skipped';
    return 'success';
}

function sortBundlersByCount(results) {
    const bundlerCounts = countBundlerNames(results);
    const sortedBundlerNames = Object.keys(bundlerCounts).sort((a, b) => a.localeCompare(b));
    
    const sortedBundlerDisplayNames = [];
    for (const bundlerName of sortedBundlerNames) {
        const bundlerDisplayName = results[Object.keys(results)[0]][bundlerName]?.name?.replace(/^(.)/, ch => ch.toUpperCase());
        sortedBundlerDisplayNames.push({ bundlerName, bundlerDisplayName: bundlerDisplayName ?? bundlerName });
    }
    
    return sortedBundlerDisplayNames;
}

function getBundlersPerTestResults(data) {
    const bundlersPerTestResults = {};
    const latestDate = findLatestDateTimes(data, 1);
    if (!latestDate) {
        throw Error("can't find latest test results");
    }
    
    const latestPerTestResultForAllBundlers = data[latestDate[0]];
    
    Object.keys(latestPerTestResultForAllBundlers).forEach(bundlerName => {
        const bundlerTestResults = latestPerTestResultForAllBundlers[bundlerName];
        Object.keys(bundlerTestResults.testcase).forEach((testcaseKey) => {
            const testcase = bundlerTestResults.testcase[testcaseKey];
            const specificBundlerPerTestResult = {
                result: getTestResultsEnum(testcase),
            };
            
            if (!bundlersPerTestResults[testcase.name]) {
                bundlersPerTestResults[testcase.name] = {};
            }
            bundlersPerTestResults[testcase.name][bundlerName] = specificBundlerPerTestResult;
        });
    });
    
    return bundlersPerTestResults;
}

// Rendering functions
function renderTables() {
    if (!currentData) return;
    
    const bundlersNames = sortBundlersByCount(currentData);
    const latestTestResults = getLatestTestResults(currentData);
    const bundlersPerTestResults = getBundlersPerTestResults(currentData);
    
    renderOverallTable(bundlersNames, latestTestResults);
    renderPerTestTable(bundlersNames, bundlersPerTestResults);
}

function renderOverallTable(bundlersNames, latestResults) {
    const tableHead = document.getElementById('overallTableHead');
    const tableBody = document.getElementById('overallTableBody');
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-100 dark:bg-gray-700';
    
    // Empty first cell for date column
    const emptyHeader = document.createElement('th');
    emptyHeader.className = 'px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white';
    emptyHeader.textContent = 'Test Date';
    headerRow.appendChild(emptyHeader);
    
    // Bundler name headers
    bundlersNames.forEach(bundlerName => {
        const th = document.createElement('th');
        th.className = 'px-4 py-3 text-center text-sm font-medium text-white bg-black dark:bg-gray-800';
        th.innerHTML = `
            <div class="min-w-max px-4 py-2 rounded-t-lg">
                ${bundlerName.bundlerDisplayName}
            </div>
        `;
        headerRow.appendChild(th);
    });
    
    tableHead.innerHTML = '';
    tableHead.appendChild(headerRow);
    
    // Create data rows
    tableBody.innerHTML = '';
    Object.entries(latestResults).forEach(([datetime, results]) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
        
        // Date cell
        const dateCell = document.createElement('td');
        dateCell.className = 'px-4 py-3 text-sm text-gray-900 dark:text-white font-medium';
        const dateTime = parseDateTime(datetime);
        dateCell.textContent = `${dateTime.toLocaleDateString()}, ${dateTime.toLocaleTimeString()}`;
        row.appendChild(dateCell);
        
        // Bundler result cells
        bundlersNames.forEach(bundlerName => {
            const cell = document.createElement('td');
            cell.className = 'px-4 py-3 text-center';
            
            const bundlerResult = results[bundlerName.bundlerName];
            if (bundlerResult) {
                const errorClass = bundlerResult.totalErrors > 0 
                    ? bundlerResult.totalErrors < 5 ? 'text-yellow-500' : 'text-red-500'
                    : 'text-lime-500';
                
                cell.innerHTML = `
                    <div class="text-sm font-medium ${errorClass}">
                        ${bundlerResult.totalErrors} / ${bundlerResult.totalTests}
                    </div>
                `;
            } else {
                cell.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">N/A</div>';
            }
            row.appendChild(cell);
        });
        
        tableBody.appendChild(row);
    });
}

function renderPerTestTable(bundlersNames, bundlersPerTestResults) {
    const tableHead = document.getElementById('perTestTableHead');
    const tableBody = document.getElementById('perTestTableBody');
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-100 dark:bg-gray-700';
    
    // Test name header - narrower column
    const testNameHeader = document.createElement('th');
    testNameHeader.className = 'px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white test-name-column';
    testNameHeader.textContent = 'Test Name';
    headerRow.appendChild(testNameHeader);
    
    // Bundler name headers
    bundlersNames.forEach(bundlerName => {
        const th = document.createElement('th');
        th.className = 'px-4 py-3 text-center text-sm font-medium text-white bg-black dark:bg-gray-800';
        th.innerHTML = `
            <div class="min-w-max px-4 py-2 rounded-t-lg">
                ${bundlerName.bundlerDisplayName}
            </div>
        `;
        headerRow.appendChild(th);
    });
    
    tableHead.innerHTML = '';
    tableHead.appendChild(headerRow);
    
    // Create data rows
    tableBody.innerHTML = '';
    Object.entries(bundlersPerTestResults).forEach(([testName, bundlerPerTestResult]) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
        
        // Test name cell - narrower column
        const testNameCell = document.createElement('td');
        testNameCell.className = 'px-4 py-3 text-sm text-gray-900 dark:text-white font-medium test-name-column';
        testNameCell.innerHTML = `<div class="test-name-text">${testName}</div>`;
        row.appendChild(testNameCell);
        
        // Bundler result cells
        bundlersNames.forEach(bundlerName => {
            const cell = document.createElement('td');
            cell.className = 'px-4 py-3 text-center';
            
            const result = bundlerPerTestResult[bundlerName.bundlerName]?.result;
            const emoji = getTestResultDisplayEmoji(result);
            
            cell.innerHTML = `<div class="text-lg">${emoji}</div>`;
            row.appendChild(cell);
        });
        
        tableBody.appendChild(row);
    });
}

function getTestResultDisplayEmoji(result) {
    switch(result) {
        case 'error': return '❌';
        case 'skipped': return '➖';
        case 'success': return '✅';
        default: return 'N/A';
    }
} 