# Live Currency Converter

A modern, responsive, real-time currency converter built with HTML, CSS, and Vanilla JavaScript.

![Project Status](https://img.shields.io/badge/Status-Complete-success)
![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![API Integration](https://img.shields.io/badge/API-ExchangeRate--API-blue)

## Features
- **Real-Time Data**: Integrates with ExchangeRate-API (v6) to fetch live exchange rates for over 150+ global currencies.
- **Dynamic Flag Mapping**: Automatically maps currency ISO codes to their respective country flags using FlagCDN.
- **Data Persistence**: Uses browser `localStorage` to save and remember the user's last selected currency preferences.
- **Responsive Design**: A sleek, dark-mode glassmorphism interface that perfectly scales across mobile phones, tablets, and desktop screens.
- **Robust Error Handling**: Graceful fallbacks for missing flag images and invalid input amounts.

## Technologies Used
* **HTML5** & **CSS3** (Flexbox, Glassmorphism, CSS Animations, Media Queries)
* **Vanilla JavaScript** (ES6+, Async/Await, Fetch API, DOM Manipulation)
* **ExchangeRate-API** (Data source)
* **FlagCDN** (Image assets)

## Installation & Usage
This is a static web application. No server installation is required.
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/currency-converter.git
   ```
2. Open the directory and double-click `index.html` to open it in any modern web browser.

## API Key Setup
This project requires an API key from [ExchangeRate-API](https://www.exchangerate-api.com/). 
If you fork this project, you will need to replace the `API_KEY` variable inside `script.js` with your own key.
```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;
```

## Future Enhancements
- Add a 7-day historical trend chart using Chart.js
- Implement an offline-mode fallback using cached rates in LocalStorage.
