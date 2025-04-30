// content.js

// Variable to store average prices
let avgPrices = {};

// Store the original fetch function
const originalFetch = window.fetch;

// Override fetch to intercept API calls
window.fetch = function(...args) {
  return originalFetch.apply(this, args).then(response => {
    // Target the get_updates API endpoint
    if (args[0] === 'https://grandland.prospectors.io/api/user/get_updates') {
      response.clone().json().then(data => {
        console.log('API response data:', data); // Log for inspection
        // Check for market data - adjust this based on actual response structure
        if (data.market) {
          const marketData = data.market;
          avgPrices = processMarketData(marketData);
          console.log('Average prices updated:', avgPrices);
        } else {
          console.log('Market data not found in response');
        }
      }).catch(err => console.error('Error parsing JSON:', err));
    }
    return response;
  });
};

// Process market data to calculate average prices
function processMarketData(marketData) {
  const data = {};
  marketData.forEach(item => {
    // Adjust 'resource' and 'price' keys based on actual API response
    const resource = item.resource;
    const price = parseFloat(item.price);
    if (!isNaN(price)) {
      data[resource] = data[resource] || [];
      data[resource].push(price);
    }
  });

  const avgPrices = {};
  for (const resource in data) {
    const prices = data[resource];
    const sum = prices.reduce((a, b) => a + b, 0);
    avgPrices[resource] = (sum / prices.length).toFixed(2);
  }
  return avgPrices;
}

// Handle messages from the popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PRICES') {
    sendResponse({ success: true, avgPrices });
  } else if (msg.type === 'OVERLAY_MAP') {
    // Target the map element - update selector as needed
    const map = document.querySelector('#map');
    if (map) {
      const existingOverlay = document.getElementById('pgl-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
        sendResponse({ applied: false });
      } else {
        const ov = document.createElement('div');
        ov.id = 'pgl-overlay';
        ov.style.position = 'absolute';
        ov.style.top = '0';
        ov.style.left = '0';
        ov.style.width = '100%';
        ov.style.height = '100%';
        ov.style.pointerEvents = 'none';
        ov.style.zIndex = '9999';

        const gridSize = 10;
        const mapRect = map.getBoundingClientRect();
        const cellWidth = mapRect.width / gridSize;
        const cellHeight = mapRect.height / gridSize;

        for (let i = 1; i < gridSize; i++) {
          const vLine = document.createElement('div');
          vLine.style.position = 'absolute';
          vLine.style.left = `${i * cellWidth}px`;
          vLine.style.top = '0';
          vLine.style.width = '1px';
          vLine.style.height = '100%';
          vLine.style.background = 'rgba(255, 255, 255, 0.5)';
          ov.appendChild(vLine);

          const hLine = document.createElement('div');
          hLine.style.position = 'absolute';
          hLine.style.top = `${i * cellHeight}px`;
          hLine.style.left = '0';
          hLine.style.height = '1px';
          hLine.style.width = '100%';
          hLine.style.background = 'rgba(255, 255, 255, 0.5)';
          ov.appendChild(hLine);
        }

        map.style.position = 'relative';
        map.appendChild(ov);
        sendResponse({ applied: true });
      }
    } else {
      sendResponse({ applied: false });
    }
  }
  return true; // Indicates async response
});
