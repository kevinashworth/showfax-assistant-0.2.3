"use strict";

import * as Common from "./common";
import * as Dropdowns from "./dropdowns";
import * as Titles from "./titles";

// Enable chromereload by uncommenting this line:
import "chromereload/devonly";

// when the extension is first installed
chrome.runtime.onInstalled.addListener(function (details) { // requires Firefox 52 and up
  if (details.reason === "install") {
    chrome.storage.local.set({ change_showfax_titles: true });
    chrome.storage.local.set({ add_showfax_dropdowns: true });
    chrome.storage.local.set({ "showfax_dropdowns['REGIONS']": regionsDropdownDefaultValue });
    console.log("Thank you for installing" + chrome.i18n.getMessage("appName") + "!");
  } else if (details.reason === "update") {
    const thisVersion = chrome.runtime.getManifest().version;
    console.log("Updating " + chrome.i18n.getMessage("appName") + " from " + details.previousVersion + " to " + thisVersion + "!");
  }
});

// listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function (id, info, tab) {
  if (tab.url.toLowerCase().indexOf("showfax.com") > -1) {
    chrome.pageAction.show(tab.id);
  }
});
