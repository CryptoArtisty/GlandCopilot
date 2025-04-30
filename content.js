// Listen for popup requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PRICES') {
    // Fetch market data from Wax blockchain
    fetch('https://wax.greymass.com/v1/chain/get_table_rows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        json: true,
        code: 'prospectorsn',
        scope: 'prospectorsn',
        table: 'market',
        limit: 100
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Market data:', data);
      const marketData = data.rows;
      const avgPrices = processMarketData(marketData);
      sendResponse({ success: true, avgPrices });
    })
    .catch(error => {
      console.error('Error fetching market data:', error);
      sendResponse({ success: false });
    });
    return true; // Indicates async response
  }
  return true;
});

// Process market data to calculate average prices
function processMarketData(marketData) {
  const data = {};
  marketData.forEach(item => {
    // Adjust 'resource' and 'price' based on actual table columns
    const resource = item.resource; // e.g., item.resource or item.resource_name
    const price = parseFloat(item.price); // e.g., item.price or item.price_per_unit
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
