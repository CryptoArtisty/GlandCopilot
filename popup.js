document.getElementById('refresh').addEventListener('click', () => {
  const container = document.getElementById('prices');
  container.innerHTML = '<em>Loading...</em>';
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const id = tabs[0]?.id;
    if (!id) return;
    chrome.tabs.sendMessage(id, { type: 'GET_PRICES' }, res => {
      if (chrome.runtime.lastError || !res?.success) {
        container.innerHTML = '<em>Failed to load prices.</em>';
      } else {
        const avg = res.avgPrices;
        if (Object.keys(avg).length === 0) {
          container.innerHTML = '<em>No data available.</em>';
        } else {
          const lines = Object.entries(avg)
            .map(([r, p]) => `<div><strong>${r}</strong>: ${p}</div>`);
          container.innerHTML = lines.join('');
        }
      }
    });
  });
});
