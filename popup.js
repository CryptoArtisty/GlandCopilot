// popup.js

document.getElementById('refresh').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const id = tabs[0]?.id;
    if (!id) return;

    chrome.tabs.sendMessage(id, { type: 'GET_PRICES' }, res => {
      const container = document.getElementById('prices');
      if (chrome.runtime.lastError || !res?.success) {
        container.innerHTML = '<em>Failed to load prices.</em>';
        return;
      }
      const avg = res.avgPrices;
      const lines = Object.entries(avg)
        .map(([r, p]) => `<div><strong>${r}</strong>: ${p}</div>`);
      container.innerHTML = lines.join('');
    });
  });
});

// Overlay map
document.getElementById('overlay').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const id = tabs[0]?.id;
    if (!id) return;
    chrome.tabs.sendMessage(id, { type: 'OVERLAY_MAP' }, res => {
      console.log('Overlay applied:', res);
    });
  });
});
