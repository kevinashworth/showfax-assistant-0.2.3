"use strict";

import { DEBUG, regionsDropdownDefaultValue } from "./common";

window.dropdowns = (() => {

  function prepare(whichDrop) {
    var links = [];

    if (whichDrop === "REGIONS" || whichDrop === "CATEGORIES") {
      // same selector works for REGIONS and CATEGORIES
      $("table#showcase li a").each(function () {
        links.push({ href: this.href, text: this.text });
      });
    }
    else { // PROJECTS
      // TODO: is 15 a good limit? limitless and add storage error case?
      var limit = 15;
      var projectList = $("td a b");
      projectList.slice(0, limit).parent().each(function () {
        links.push({ href: this.href, text: this.text.replace(/,\s*$/, "") }); // remove trailing comma and space
      });
      if (projectList.length > limit) {
        // link to nowhere that doesn't add to browser history
        links.push({ href: "javascript:;", text: "————" })
        // link to this page
        links.push({ href: window.location, text: "(see all " + title.get() + ")" });
      }
    }

    var temp = links.reduce(function (accumulator, value) {
      return accumulator + "<li><a href='" + value.href + "'>" + value.text + "</a></li>";
    }, "<ul class='dropdown-menu'>");
    temp += "</ul>";
    if (DEBUG) { console.info("temp:" + temp); }

    // read existing values if any, modify or add new key|value pair, and store back
    chrome.storage.local.get("showfax_dropdowns", function (result) {
      var showfax_dropdowns = result["showfax_dropdowns"] ? result["showfax_dropdowns"] : {};
      showfax_dropdowns[whichDrop] = temp;
      chrome.storage.local.set({
        "showfax_dropdowns": showfax_dropdowns
      }, function () {
        if (DEBUG) { console.log("Saved showfax_dropdowns: " + JSON.stringify(showfax_dropdowns)); }
      });
    });
  }

  function display() {
    var args = [].slice.call(arguments);
    args.forEach(function (whichDrop) {
      chrome.storage.local.get("showfax_dropdowns", function (result) {
        var showfax_dropdowns = result["showfax_dropdowns"] ? result["showfax_dropdowns"] : {};
        if (showfax_dropdowns[whichDrop]) {
          var jquerystring = "td:contains(" + whichDrop + ")";
          var target = $(jquerystring).not(".bodyright");
          target.addClass("dropdown");
          target.closest("table").addClass("bootstrap-iso");
          target.find("a").addClass("dropdown-toggle");
          target.find("a").attr("data-toggle", "dropdown");

          var content = showfax_dropdowns[whichDrop];
          if (DEBUG) {
            console.log("target: " + target.html());
            console.info("content: " + content);
          }
          target.append(content);
          target.find("a:contains(————)").closest("li").replaceWith("<li role=\"separator\" class=\"divider\"></li>");
        }
      });
    });
  }

  function add() {
    switch (window.location.pathname) {
      case "/":
        prepare("REGIONS");
        break;
      case "/type_selection.cfm":
        display("REGIONS");
        prepare("CATEGORIES");
        break;
      case "/project_selection.cfm":
        display("REGIONS", "CATEGORIES");
        prepare("PROJECTS");
        break;
      case "/role_selection.cfm":
      case "/member_download2.cfm":
      case "/free_download2.cfm":
      case "/signin.cfm":
        display("REGIONS", "CATEGORIES", "PROJECTS");
        break;
      default:
        break;
    }
  }

  return { add };

})();