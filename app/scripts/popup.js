"use strict";

import * as Common from "./common";
import * as Dropdowns from "./dropdowns";
import * as Titles from "./titles";

document.addEventListener("DOMContentLoaded", function () {

  var input1 = document.getElementById("change_showfax_titles_option");

  // set the initial state of the checkbox
  chrome.storage.local.get("change_showfax_titles", function (data) {
    if (data["change_showfax_titles"]) {
      input1.checked = true;
    } else {
      input1.checked = false;
    }
  });

  input1.addEventListener("change", function () {
    chrome.storage.local.set({ change_showfax_titles: input1.checked });
  });

  var input2 = document.getElementById("add_showfax_dropdowns_option");

  // set the initial state of the checkbox
  chrome.storage.local.get("add_showfax_dropdowns", function (data) {
    if (data["add_showfax_dropdowns"]) {
      input2.checked = true;
    } else {
      input2.checked = false;
    }
  });

  input2.addEventListener("change", function () {
    chrome.storage.local.set({ add_showfax_dropdowns: input2.checked });
  });

});

document.addEventListener("DOMContentLoaded", function () {
  display_showfax_history();
  $("#search").on("input", function () {
});

$(function () {

  var callback = function (event) {
    event.preventDefault();
    // Do exciting things here.
    $("#showfax_history").empty();
    display_showfax_history();
  };

  $("#search").on({
    submit: callback,
    keyup: _.debounce(callback, 200)
  });

  // $("#search").on("change keypress keyup", function () {
  //   $("#showfax_history").empty();
  //   display_showfax_history($("#search").val());
  // });
});

var msg_appname = chrome.i18n.getMessage("appName");
document.getElementById("app").innerHTML = msg_appname;

function display_showfax_history() {
  var query = $("#search").val();
  chrome.storage.local.get("showfax_history", function (result) {
    var showfax_history = result["showfax_history"] ? result["showfax_history"] : [];
    var temp = showfax_history.filter(function (value) {
      if (typeof query === "undefined" || query.length === 0) {
        return true;
      }
      else {
        return (value.text).toLowerCase().indexOf(query.toLowerCase()) !== -1;
      }
    })
    .reduce(function (accumulator, value) {
      var $listitem = $("<li>", {"class": "list-group-item small"});
      var $anchor = $("<a>");
      $anchor.attr("href", value.href);
      $anchor.text(value.text);
      $anchor.click(function () {
        chrome.tabs.update( {
          url: value.href
        });
      });
      return accumulator.append($listitem.append($anchor));
    }, $("<ul>", {"class": "list-group"}));
    // temp += "</ul>";
    $("#showfax_history").append(temp);

  });
}

function reset_showfax_history() {
  chrome.storage.local.set({
    "showfax_history": []
  }, function () {
    if (DEBUG) { console.debug("Reset showfax_history to []"); }
  });
  $("#showfax_history ul").remove()
  display_showfax_history();
  // window.close();
}

document.getElementById("reset_showfax_history").addEventListener("click", function() {
  console.log("Hello from button");
  reset_showfax_history();
});
