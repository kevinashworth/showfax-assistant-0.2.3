"use strict";

import { DEBUG, showfaxHistoryDefaultValue } from "./common";

window.titles = (() => {

  var _title = "Kevin is awesome";
  function getTitle() {
    return _title;
  };
  function setTitle(t) {
    _title = t;
  };

  function changeAndSave() {
    if (DEBUG) {
      console.log("changeShowfaxTitles():");
      console.debug(document.title);
      console.info(window.location.pathname);
    }
    var isSpecialSigninSituation = false;

    setTitle(document.title);
    if (getTitle().length === 0) { // some account pages have no title at all
      setTitle(generateTitle());
    }
    var region, category, project, searchedInput, role = null;
    switch (window.location.pathname) {
      case "/":
        setTitle(generateTitle());
        break;
      case "/type_selection.cfm":
        var searchParams = new URLSearchParams(window.location.search);
        var quickInput = searchParams.get("c"); // there will be at most
        var codeInput = searchParams.get("z"); //  one of these 2 inputs
        searchedInput = quickInput || codeInput || "";
        region = $("td.location").text();
        if (searchedInput.length) {
          searchedInput = "\"" + searchedInput + "\"";
          if (DEBUG) { console.info("searchedInput:" + searchedInput); }
          var pageNumber = searchParams.get("p");
          if (pageNumber) {
            searchedInput += " p. " + pageNumber
          }
          setTitle(generateTitle(searchedInput, region));
        } else {
          setTitle(generateTitle(region));
        }
        break;
      case "/project_selection.cfm":
        category = $("td:contains(Category:)").not(".bodyright").text().substring(10)
          .replace("director", "CD")
          .replace("asc", "ascending order")
          .replace("desc", "descending order")
          .replace("role", "project");
        region = $("td.location").text();
        setTitle(generateTitle(category, region));
        break;
      case "/role_selection.cfm":
        project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
        category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
        region = $("td.location").text();
        setTitle(generateTitle(project, category, region));
        captureSigninClicks();
        break;
      case "/member_download2.cfm":
        role = $("a.download").eq(0).text();
        project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
        category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
        region = $("td.location").text();
        setTitle(generateTitle(role, project, category, region));
        isSpecialSigninSituation = true;
        replaceSigninHistory(); // these functions needed for useful history when selecting role after role
        break;
      case "/free_download2.cfm": // rare. see http://www.showfax.com/free_download2.cfm?r=966938&l=1 for one
        role = $("a[href^=free]").text();
        project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
        category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
        region = $("td.location").text();
        setTitle(generateTitle(role, project, category, region));
        break;
      case "/myshowfax/index.cfm":
        setTitle(generateTitle("My personal information"));
        break;
      case "/signin.cfm":
        setTitle(generateTitle("Signin"));
        break;
      case "/signup.cfm":
        setTitle(generateTitle("Signup"));
        break;
      default:
        break; // keep existing title on other pages, if any
    }
    changeTitleTo(getTitle());
    if (isSpecialSigninSituation) { replaceSigninHistory() }
    addToHistoryArray(window.location.href, getTitle());

    if (DEBUG) { console.debug(getTitle()); }
  }

  function generateTitle() {
    var title = "Showfax";
    var args = [].slice.call(arguments);
    args.filter(Boolean);

    if (DEBUG) {
      console.log("arguments: ", arguments);
      console.log("compact arguments: ", args)
    }

    return args.reduce(function (accumulator, value) {
      return accumulator + " | " + value;
    }, title);
  }

  function changeTitleTo(newTitle) {
    document.title = newTitle;
    history.replaceState(null, newTitle, window.location); // this doesn't do much of anything in current browsers
  }

  function addToHistoryArray(href, text) {
    chrome.storage.local.get("showfax_history", function (result) {
      var showfax_history = result["showfax_history"] ? result["showfax_history"] : showfaxHistoryDefaultValue;
      showfax_history.unshift({ href: href, title_text: text.replace("Showfax | ", "") })
      if (showfax_history.length > 100) {
        showfax_history.length = 100;
      }
      chrome.storage.local.set({
        "showfax_history": showfax_history
      }, function () {
        if (DEBUG) { console.log("Saved showfax_history: " + JSON.stringify(showfax_history)); }
      });
    });
  }

  // without this, can't navigate successfully back and forth roles on same project
  function captureSigninClicks() {
    function clickHandler(event) {
      var theUrl = event.target.href;
      if (theUrl.indexOf("https://") == -1) { // when user hasn't logged in yet
        theUrl = theUrl.replace("http://", "https://");
      };
      chrome.storage.local.set({
        "role_selection_link": theUrl
      }, function () {
        if (DEBUG) { console.log("role_selection_link: " + theUrl); }
      });
    }
    $("a[href*=signin]").click(clickHandler); // add clickHandler only to "signin" links
  }

  // without this, can't navigate successfully back and forth roles on same project
  function replaceSigninHistory() {
    chrome.storage.local.get("role_selection_link", function (data) {
      if (data["role_selection_link"]) {
        history.replaceState(null, null, data["role_selection_link"]);
        chrome.storage.local.get("showfax_history", function (result) {
          var showfax_history = result["showfax_history"] ? result["showfax_history"] : showfaxHistoryDefaultValue;
          showfax_history[0] = { href: data["role_selection_link"], title_text: getTitle().replace("Showfax | ", "") };
          chrome.storage.local.set({
            "showfax_history": showfax_history
          }, function () {
            if (DEBUG) { console.log("Replaced showfax_history: " + JSON.stringify(showfax_history)); }
          });
        });
      }
    });
  }

  return { getTitle, setTitle, changeAndSave };

})();
