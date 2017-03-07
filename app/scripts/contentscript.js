"use strict";

import { DEBUG, showfaxHistoryDefaultValue, regionsDropdownDefaultValue } from "./common";
import * as Dropdowns from "./dropdowns";
import * as Titles from "./titles";

function runOnceOnPageLoad() {
  chrome.storage.local.get("change_showfax_titles", function (data) {
    if (data["change_showfax_titles"]) {
      titles.changeAndSave();
    }
  });
  chrome.storage.local.get("add_showfax_dropdowns", function (data) {
    if (data["add_showfax_dropdowns"]) {
      dropdowns.add();
    }
  });
}

runOnceOnPageLoad();