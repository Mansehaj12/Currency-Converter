// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const fromSymbol = document.getElementById('from-symbol');
const swapBtn = document.getElementById('swap-btn');
const rateInfo = document.getElementById('rate-info');
const convertedAmount = document.getElementById('converted-amount');

const API_KEY = '2a94c1488b93db4ffdce4b85';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

// We need a map of currency codes to countries to infer flags.
// Since the API doesn't provide flags, we'll map top currencies statically and use a fallback.
const currencyToCountryCode = {
    USD: "us", EUR: "eu", GBP: "gb", INR: "in", AUD: "au", CAD: "ca",
    SGD: "sg", CHF: "ch", MYR: "my", JPY: "jp", CNY: "cn", NZD: "nz",
    ZAR: "za", BRL: "br", RUB: "ru", KRW: "kr", MXN: "mx", IDR: "id",
    TRY: "tr", SAR: "sa", AED: "ae", HKD: "hk", THB: "th", NOK: "no",
    SEK: "se", DKK: "dk", PLN: "pl", HUF: "hu", CZK: "cz", ILS: "il",
    PHP: "ph", TWD: "tw", CLP: "cl", COP: "co", ARS: "ar", EGP: "eg",
    VND: "vn", KWD: "kw", QAR: "qa", OMR: "om", BHD: "bh"
};

// Common currency symbols
const currencySymbols = {
    USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", CNY: "¥",
    AUD: "A$", CAD: "C$", CHF: "CHF", HKD: "HK$"
};

let exchangeRates = {};
let lastFetchBase = "";

// Initialize Application
async function init() {
    // Set loading state
    convertedAmount.classList.add('loading');
    rateInfo.textContent = 'Loading rates...';

    try {
        // Fetch initial list relative to USD
        const response = await fetch(`${API_URL}USD`);
        const data = await response.json();

        if (data.result === "success") {
            exchangeRates = data.conversion_rates;
            lastFetchBase = "USD";
            populateCurrencyDropdowns(Object.keys(exchangeRates));

            // Load preferences from localStorage or use defaults
            const savedFrom = localStorage.getItem('fromCurrency') || "USD";
            const savedTo = localStorage.getItem('toCurrency') || "INR";

            // Set selections (with fallback in case saved currency isn't in API anymore)
            fromCurrencySelect.value = Object.keys(exchangeRates).includes(savedFrom) ? savedFrom : "USD";
            toCurrencySelect.value = Object.keys(exchangeRates).includes(savedTo) ? savedTo : "INR";

            // If the user had a saved amount, load that too
            const savedAmount = localStorage.getItem('amountVal');
            if (savedAmount) amountInput.value = savedAmount;

            // Initial UI update
            updateFlagsAndSymbols();
            calculateConversion();
        } else {
            throw new Error("Failed to load rates");
        }
    } catch (error) {
        console.error("Initialization error:", error);
        rateInfo.textContent = "Error loading live rates. Please try again later.";
        convertedAmount.textContent = "Error";
        convertedAmount.classList.remove('loading');
    }
}

// Populate the <select> element with currency options
function populateCurrencyDropdowns(currencies) {
    let options = "";
    // Sort alphabetically for easier finding
    currencies.sort().forEach(currency => {
        options += `<option value="${currency}">${currency}</option>`;
    });

    fromCurrencySelect.innerHTML = options;
    toCurrencySelect.innerHTML = options;
}

// Fetch rates for a specific base currency if not already cached/loaded
async function fetchRatesForBase(base) {
    if (base === lastFetchBase) return;

    try {
        const response = await fetch(`${API_URL}${base}`);
        const data = await response.json();

        if (data.result === "success") {
            exchangeRates = data.conversion_rates;
            lastFetchBase = base;
        }
    } catch (error) {
        console.error("Error fetching rates for base:", error);
    }
}

// Update UI Flags and Input Symbols
function updateFlagsAndSymbols() {
    const fromCode = fromCurrencySelect.value;
    const toCode = toCurrencySelect.value;

    // Determine flag strategy (first 2 chars of country code usually works, but custom mapping is better)
    const fromCountry = currencyToCountryCode[fromCode] || fromCode.substring(0, 2).toLowerCase();
    const toCountry = currencyToCountryCode[toCode] || toCode.substring(0, 2).toLowerCase();

    // Euro zone has special flag 'eu' flagcdn supports it natively!
    if (fromCode === "EUR") fromFlag.src = `https://flagcdn.com/w40/eu.png`;
    else fromFlag.src = `https://flagcdn.com/w40/${fromCountry}.png`;

    if (toCode === "EUR") toFlag.src = `https://flagcdn.com/w40/eu.png`;
    else toFlag.src = `https://flagcdn.com/w40/${toCountry}.png`;

    // Handle flag image load errors gracefully (fallback to a default globe or transparent image)
    fromFlag.onerror = () => { fromFlag.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30" fill="%23334155"><rect width="40" height="30" rx="2"/></svg>'; };
    toFlag.onerror = () => { toFlag.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30" fill="%23334155"><rect width="40" height="30" rx="2"/></svg>'; };

    // Update symbol in input
    fromSymbol.textContent = currencySymbols[fromCode] || fromCode;
}

// Main Calculate Function
async function calculateConversion() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value);

    // Defensive check
    if (isNaN(amount) || amount < 0) {
        convertedAmount.textContent = "0.00";
        rateInfo.textContent = "Please enter a valid amount.";
        return;
    }

    convertedAmount.classList.add('loading');

    // Make sure we have the rates based on 'From' currency
    await fetchRatesForBase(fromCurrency);

    // Calculate using the rates from the API (base is always 1)
    const rate = exchangeRates[toCurrency];
    const result = amount * rate;

    // Formatting based on locale might be over-engineering, but a standard comma separator looks premium
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 // Some currencies need more decimals
    });

    convertedAmount.classList.remove('loading');

    // Animate the number change (simple version)
    convertedAmount.textContent = formatter.format(result) + ' ' + toCurrency;

    // Update rate info
    rateInfo.textContent = `1 ${fromCurrency} = ${formatter.format(rate)} ${toCurrency}`;
}

// Event Listeners for Live Updates
// We use a small debounce for typing amount to avoid UI stutter
let debounceTimer;
amountInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    localStorage.setItem('amountVal', amountInput.value); // Save amount typed
    debounceTimer = setTimeout(calculateConversion, 150); // 150ms debounce
});

['change'].forEach(evt => {
    fromCurrencySelect.addEventListener(evt, () => {
        localStorage.setItem('fromCurrency', fromCurrencySelect.value); // Save preference
        updateFlagsAndSymbols();
        calculateConversion();
    });

    toCurrencySelect.addEventListener(evt, () => {
        localStorage.setItem('toCurrency', toCurrencySelect.value); // Save preference
        updateFlagsAndSymbols();
        calculateConversion();
    });
});

// Swap Functionality
swapBtn.addEventListener('click', () => {
    const tempValue = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempValue;

    // Add a spin animation class to the button
    swapBtn.style.transform = "rotate(180deg) scale(1.1)";
    setTimeout(() => {
        swapBtn.style.transform = "";
    }, 300);

    // Save newly swapped preferences
    localStorage.setItem('fromCurrency', fromCurrencySelect.value);
    localStorage.setItem('toCurrency', toCurrencySelect.value);

    updateFlagsAndSymbols();
    calculateConversion();
});

// Start the app
init();
