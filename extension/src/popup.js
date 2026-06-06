const defaults = { apiBase: 'http://localhost:8000', targetLanguage: 'en', sourceLanguage: 'auto' };
chrome.storage.sync.get(defaults, (settings) => {
  apiBase.value = settings.apiBase;
  targetLanguage.value = settings.targetLanguage;
  sourceLanguage.value = settings.sourceLanguage;
});
save.addEventListener('click', () => chrome.storage.sync.set({ apiBase: apiBase.value, targetLanguage: targetLanguage.value, sourceLanguage: sourceLanguage.value }));
