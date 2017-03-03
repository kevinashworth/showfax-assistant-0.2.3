const DEBUG = (process.env.NODE_ENV === "production") ? false : true;
// const showfax_history_default_value = [{ href: "http://showfax.com", text: "Showfax", tabid: null }];

var title = ""; // declared here for prepareDropdown(PROJECTS) and addToHistoryArray

function prepareDropdown(whichDrop) {
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
      links.push({ href: window.location, text: "(see all " + title + ")" });
    }
  }

  var temp = links.reduce(function (accumulator, value) {
    return accumulator + "<li><a href='" + value.href + "'>" + value.text + "</a></li>";
  }, "<ul class='dropdown-menu'>");
  temp += "</ul>";
  if (DEBUG) { console.info("temp:" + temp); }

  // read existing values if any, modify or add new key|value pair, and store back
  chrome.storage.local.get("showfax_dropdowns", function (result) {
    var dropdowns = result["showfax_dropdowns"] ? result["showfax_dropdowns"] : {};
    dropdowns[whichDrop] = temp;
    chrome.storage.local.set({
      "showfax_dropdowns": dropdowns
    }, function () {
      if (DEBUG) { console.log("Saved showfax_dropdowns: " + JSON.stringify(dropdowns)); }
    });
  });
}

function displayDropdown() {
  var args = [].slice.call(arguments);
  args.forEach(function (whichDrop) {
    chrome.storage.local.get("showfax_dropdowns", function (result) {
      var dropdowns = result["showfax_dropdowns"] ? result["showfax_dropdowns"] : {};
      if (dropdowns[whichDrop]) {
        var jquerystring = "td:contains(" + whichDrop + ")";
        var target = $(jquerystring).not(".bodyright");
        target.addClass("dropdown");
        target.closest("table").addClass("bootstrap-iso");
        target.find("a").addClass("dropdown-toggle");
        target.find("a").attr("data-toggle", "dropdown");

        var content = dropdowns[whichDrop];
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

function runOnceOnPageLoad() {
  chrome.storage.local.get("change_showfax_titles", function (data) {
    if (data["change_showfax_titles"]) {
      changeShowfaxTitles();
    }
  });
  chrome.storage.local.get("add_showfax_dropdowns", function (data) {
    if (data["add_showfax_dropdowns"]) {
      addShowfaxDropdowns();
    }
  });
  addToHistoryArray(title, window.location.href);
}

function changeShowfaxTitles() {
  if (DEBUG) {
    console.log("changeShowfaxTitles():");
    console.debug(document.title);
    console.info(window.location.pathname);
  }

  title = document.title;
  if (title.length === 0) { // some account pages have no title at all
    title = generateTitle();
  }
  var region, category, project, searchedInput, role = null;
  switch (window.location.pathname) {
    case "/":
      title = generateTitle();
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
        title = generateTitle(searchedInput, region);
      } else {
        title = generateTitle(region);
      }
      break;
    case "/project_selection.cfm":
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10)
        .replace("director", "CD")
        .replace("asc", "ascending order")
        .replace("desc", "descending order")
        .replace("role", "project");
      region = $("td.location").text();
      title = generateTitle(category, region);
      break;
    case "/role_selection.cfm":
      project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
      region = $("td.location").text();
      title = generateTitle(project, category, region);
      captureSigninClicks();
      break;
    case "/member_download2.cfm":
      role = $("a.download").eq(0).text();
      project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
      region = $("td.location").text();
      title = generateTitle(role, project, category, region);
      replaceSigninHistory(); // these functions needed for useful history when selecting role after role
      break;
    case "/free_download2.cfm": // rare. see http://www.showfax.com/free_download2.cfm?r=966938&l=1 for one
      role = $("a[href^=free]").text();
      project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
      region = $("td.location").text();
      title = generateTitle(role, project, category, region);
      break;
    case "/myshowfax/index.cfm":
      title = generateTitle("My personal information");
      break;
    case "/signin.cfm":
      title = generateTitle("Signin");
      break;
    case "/signup.cfm":
      title = generateTitle("Signup");
      break;
    default:
      break; // keep existing title on other pages, if any
  }
  changeTitleTo(title);

  if (DEBUG) { console.debug(title); }
}

function changeTitleTo(newTitle) {
  document.title = newTitle;
  history.replaceState(null, newTitle, window.location); // this doesn't do anything in current browsers

}

function addShowfaxDropdowns() {
  switch (window.location.pathname) {
    case "/":
      prepareDropdown("REGIONS");
      break;
    case "/type_selection.cfm":
      displayDropdown("REGIONS");
      prepareDropdown("CATEGORIES");
      break;
    case "/project_selection.cfm":
      displayDropdown("REGIONS", "CATEGORIES");
      prepareDropdown("PROJECTS");
      break;
    case "/role_selection.cfm":
    case "/member_download2.cfm":
    case "/free_download2.cfm":
    case "/signin.cfm":
      displayDropdown("REGIONS", "CATEGORIES", "PROJECTS");
      break;
    default:
      break;
  }
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
    }
  });
}

function addToHistoryArray(title, link) {
  function doInCurrentTab(tabCallback) {
    chrome.tabs.query(
      { currentWindow: true, active: true },
      function (tabArray) { tabCallback(tabArray[0]); }
    );
  }
  var activeTabId;
  doInCurrentTab( function(tab) { activeTabId = tab.id } );
  chrome.storage.local.get("showfax_history", function (result) {
    var showfax_history = result["showfax_history"] ? result["showfax_history"] : [];
    showfax_history.unshift({ href: link, text: title, tabid: activeTabId })
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

runOnceOnPageLoad();