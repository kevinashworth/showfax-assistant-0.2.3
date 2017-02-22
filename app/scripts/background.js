// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';

// when the extension is first installed
chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
  chrome.storage.local.set({ change_showfax_titles: true });
  chrome.storage.local.set({ add_showfax_dropdowns: true });
});

// listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function (id, info, tab) {
  if (tab.url.toLowerCase().indexOf("showfax.com") > -1) {
    chrome.pageAction.show(tab.id);
  }
});