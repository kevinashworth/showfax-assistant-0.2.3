const DEBUG = (process.env.NODE_ENV === 'production' ) ? false : true;

var title = ""; // declared here only for prepareDropdown(PROJECTS)

function prepareDropdown(whichDrop) {
  var links = [];

  if (whichDrop === "REGIONS" || whichDrop === "CATEGORIES") {
    // same selector works for REGIONS and CATEGORIES
    $('table#showcase li a').each(function () {
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
      links.push({ href: "javascript:;", text: "..." })
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
  chrome.storage.sync.get("showfax_dropdowns", function (result) {
    var dropdowns = result["showfax_dropdowns"] ? result["showfax_dropdowns"] : {};
    dropdowns[whichDrop] = temp;
    chrome.storage.sync.set({
      "showfax_dropdowns": dropdowns
    }, function () {
      if (DEBUG) { console.log("Saved showfax_dropdowns: " + JSON.stringify(dropdowns)); }
    });
  });
}

function displayDropdown() {
  var args = [].slice.call(arguments);
  args.forEach(function (whichDrop) {
    chrome.storage.sync.get("showfax_dropdowns", function (result) {
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
        target.find("a:contains(...)").closest("li").replaceWith('<li role="separator" class="divider"></li>');
      }
    });
  });
}

function runOnceOnPageLoad() {
  chrome.storage.sync.get("change_showfax_titles", function (data) {
    if (data["change_showfax_titles"]) {
      changeShowfaxTitles();
    }
  });
  chrome.storage.sync.get("add_showfax_dropdowns", function (data) {
    if (data["add_showfax_dropdowns"]) {
      addShowfaxDropdowns();
    }
  });
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
    case '/':
      title = generateTitle();
      break;
    case '/type_selection.cfm':
      var searchParams = new URLSearchParams(window.location.search);
      var quickInput = searchParams.get('c'); // there will be at most
      var codeInput = searchParams.get('z'); //  one of these 2 inputs
      searchedInput = quickInput || codeInput || '';
      region = $("td.location").text();
      if (searchedInput.length) {
        searchedInput = '"' + searchedInput + '"';
        if (DEBUG) { console.info("searchedInput:" + searchedInput); }
        var pageNumber = searchParams.get('p');
        if (pageNumber) {
          searchedInput += ' p. ' + pageNumber
        }
        title = generateTitle(searchedInput, region);
      } else {
        title = generateTitle(region);
      }
      break;
    case '/project_selection.cfm':
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10)
        .replace('director', 'CD')
        .replace('asc', 'ascending order')
        .replace('desc', 'descending order')
        .replace('role', 'project');
      region = $("td.location").text();
      title = generateTitle(category, region);
      break;
    case '/role_selection.cfm':
      project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
      region = $("td.location").text();
      title = generateTitle(project, category, region);
      break;
    case '/member_download2.cfm': // NB: this part of site behaves flaky when selecting role after role
      role = $("a.download").eq(0).text();
      project = $($("td:contains(Project:)").not(".bodyright").html().replace(/ &nbsp;/g, '')).text(); // worth it to strip nbsp?
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
      region = $("td.location").text();
      title = generateTitle(role, project, category, region);
      break;
    case '/free_download2.cfm': // rare. see http://www.showfax.com/free_download2.cfm?r=966938&l=1 for one
      role = $("a[href^=free]").text();
      project = $("td:contains(Project:)").not(".bodyright").text().substring(9);
      category = $("td:contains(Category:)").not(".bodyright").text().substring(10);
      region = $("td.location").text();
      title = generateTitle(role, project, category, region);
      break;
    case '/myshowfax/index.cfm':
      title = generateTitle('My personal information');
      break;
    case '/signin.cfm':
      title = generateTitle('Signin');
      break;
    case '/signup.cfm':
      title = generateTitle('Signup');
      break;
    default:
      break; // keep existing title on other pages, if any
  }
  document.title = title;

  if (DEBUG) { console.debug(title); }
}

function addShowfaxDropdowns() {
  switch (window.location.pathname) {
    case '/':
      prepareDropdown("REGIONS");
      break;
    case '/type_selection.cfm':
      displayDropdown("REGIONS");
      prepareDropdown("CATEGORIES");
      break;
    case '/project_selection.cfm':
      displayDropdown("REGIONS", "CATEGORIES");
      prepareDropdown("PROJECTS");
      break;
    case '/role_selection.cfm':
    case '/member_download2.cfm':
    case '/free_download2.cfm':
    case '/signin.cfm':
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
    console.log('arguments: ', arguments);
    console.log('compact arguments: ', args)
  }

  return args.reduce(function (accumulator, value) {
    return accumulator + " | " + value;
  }, title);
}

runOnceOnPageLoad();