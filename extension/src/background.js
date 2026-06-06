chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'afrilingua-translate', title: 'Translate with AfriLingua', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'afrilingua-translate' || !tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'AFRILINGUA_TRANSLATE_SELECTION', text: info.selectionText });
});
