const defaultSettings = { apiBase: 'http://localhost:8000', targetLanguage: 'en', sourceLanguage: 'auto' };

async function loadSettings() {
  return new Promise((resolve) => chrome.storage.sync.get(defaultSettings, resolve));
}

async function translate(text) {
  const settings = await loadSettings();
  const response = await fetch(`${settings.apiBase}/api/v1/translate/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source_language: settings.sourceLanguage, target_language: settings.targetLanguage })
  });
  return response.json();
}

function showOverlay(result) {
  const existing = document.querySelector('#afrilingua-overlay');
  if (existing) existing.remove();
  const node = document.createElement('aside');
  node.id = 'afrilingua-overlay';
  node.innerHTML = `<button aria-label="Close">×</button><strong>AfriLingua translation</strong><p>${result.translated_text}</p><small>${result.source_language} → ${result.target_language} · ${Math.round(result.confidence * 100)}%</small>`;
  node.querySelector('button').addEventListener('click', () => node.remove());
  document.body.appendChild(node);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'AFRILINGUA_TRANSLATE_SELECTION' && message.text) {
    translate(message.text).then(showOverlay).catch((error) => showOverlay({ translated_text: error.message, source_language: 'error', target_language: 'error', confidence: 0 }));
  }
});

document.addEventListener('dblclick', async () => {
  const text = window.getSelection()?.toString()?.trim();
  if (text && text.length > 2) showOverlay(await translate(text));
});
