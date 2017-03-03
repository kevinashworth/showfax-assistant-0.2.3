// document.addEventListener("DOMContentLoaded", function () {

//   var input1 = document.getElementById("change_showfax_titles_option");

//   // set the initial state of the checkbox
//   chrome.storage.local.get("change_showfax_titles", function (data) {
//     if (data["change_showfax_titles"]) {
//       input1.checked = true;
//     } else {
//       input1.checked = false;
//     }
//   });

//   input1.addEventListener("change", function () {
//     chrome.storage.local.set({ change_showfax_titles: input1.checked });
//   });

//   var input2 = document.getElementById("add_showfax_dropdowns_option");

//   // set the initial state of the checkbox
//   chrome.storage.local.get("add_showfax_dropdowns", function (data) {
//     if (data["add_showfax_dropdowns"]) {
//       input2.checked = true;
//     } else {
//       input2.checked = false;
//     }
//   });

//   input2.addEventListener("change", function () {
//     chrome.storage.local.set({ add_showfax_dropdowns: input2.checked });
//   });

// });

const showfax_history_default_value = [{ href: "http://showfax.com", text: "Showfax" }];

document.addEventListener("DOMContentLoaded", function () {
  display_showfax_history();
  // var links = Array.prototype.slice.call(document.getElementsByTagName("a"));
  // links.forEach(function () {
  //   this.onclick = function () {
  //     chrome.tabs.create({ active: true, url: this.href });
  //   };
  // })
  var hrefs = document.getElementsByTagName("a");

  function openLink() {
    var href = this.href;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      chrome.tabs.update(tab.id, { url: href });
    });
  }

  for (var i = 0, a; a = hrefs[i]; ++i) {
    hrefs[i].addEventListener("click", openLink);
  } 
});

var msg_appname = chrome.i18n.getMessage("appName");
document.getElementById("app").innerHTML = msg_appname;

function display_showfax_history() {
  chrome.storage.local.get("showfax_history", function (result) {
    var showfax_history = result["showfax_history"] ? result["showfax_history"] : showfax_history_default_value;
    var temp = showfax_history.reduce(function (accumulator, value) {
      var $listitem = $("<li>");
      var $anchor = $("<a>");
      $anchor.attr("href", value.href);
      $anchor.text(value.text);
      /*
       * When clicking on a bookmark in the extension, a new tab is fired with
       * the bookmark url.
       */
      $anchor.click(function () {
        chrome.tabs.create({
          url: value.text
        });
      });
      $anchor = $listitem.append($anchor);
      return accumulator.append($anchor);
    }, $("<ul>", {"class": "showfax_history"}));
    // temp += "</ul>";
    console.info("popup temp:" + JSON.stringify(temp));
    $("#showfax_history").append(temp);
    
  });
}

function reset_showfax_history() {
  chrome.storage.local.set({
    "showfax_history": showfax_history_default_value
  }, function () {
    if (DEBUG) { console.debug("Reset showfax_history to showfax_history_default_value"); }
  });
  $("#showfax_history ul").remove()
  display_showfax_history();
  // window.close();
}

document.getElementById("reset_showfax_history").addEventListener("click", function() {
  console.log("Hello from button");
  reset_showfax_history();
});

