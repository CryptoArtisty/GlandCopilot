// content.js

// Listen for popup requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PRICES') {
    // Scrape market table rows
    const rows = document.querySelectorAll('table tbody tr');
    const data = {};

    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      if (cols.length >= 3) {
        const resource = cols[0].innerText.trim();
        const priceText = cols[2].innerText.replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText);
        if (!isNaN(price)) {
          data[resource] = data[resource] || [];
          data[resource].push(price);
        }
      }
    });

    // Compute averages
    const avgPrices = {};
    for (const res in data) {
      const arr = data[res];
      const sum = arr.reduce((a, b) => a + b, 0);
      avgPrices[res] = (sum / arr.length).toFixed(2);
    }

    sendResponse({ success: true, avgPrices });
  }

  else if (msg.type === 'OVERLAY_MAP') {
    // Simple placeholder overlay
    const map = document.querySelector('#map') || document.body;
    if (!document.getElementById('pgl-overlay')) {
      const ov = document.createElement('div');
      ov.id = 'pgl-overlay';
      Object.assign(ov.style, {
        position: 'absolute',
        top: '0', left: '0', width: '100%', height: '100%',
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.1)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        zIndex: '9999'
      });
      ov.innerText = 'Map Overlay Placeholder';
      map.style.position = 'relative';
      map.appendChild(ov);
    }
    sendResponse({ applied: true });
  }

  return true; // async
});
