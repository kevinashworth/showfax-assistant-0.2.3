// Enable chromereload by uncommenting this line:
import "chromereload/devonly";

var vendorapi;
if (__VENDOR__ === "chrome") {
  vendorapi = chrome;
}
else if (__VENDOR__ === "firefox") {
  vendorapi = browser;
}

// when the extension is first installed
vendorapi.runtime.onInstalled.addListener(function (details) { // requires Firefox 52 and up
  console.log("previousVersion", details.previousVersion);
  vendorapi.storage.local.set({ change_showfax_titles: true });
  vendorapi.storage.local.set({ add_showfax_dropdowns: true });
});

// listen for any changes to the URL of any tab.
vendorapi.tabs.onUpdated.addListener(function (id, info, tab) {
  if (tab.url.toLowerCase().indexOf("showfax.com") > -1) {
    vendorapi.pageAction.show(tab.id);
  }
});