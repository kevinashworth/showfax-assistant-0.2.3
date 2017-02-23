document.addEventListener("DOMContentLoaded", function () {

  var vendorapi;
  if (__VENDOR__ === "chrome") {
    vendorapi = chrome;
  }
  else if (__VENDOR__ === "firefox") {
    vendorapi = browser;
  }

  var input1 = document.getElementById("change_showfax_titles_option");

  // set the initial state of the checkbox
  vendorapi.storage.local.get("change_showfax_titles", function (data) {
    if (data["change_showfax_titles"]) {
      input1.checked = true;
    } else {
      input1.checked = false;
    }
  });

  input1.addEventListener("change", function () {
    vendorapi.storage.local.set({ change_showfax_titles: input1.checked });
  });

  var input2 = document.getElementById("add_showfax_dropdowns_option");

  // set the initial state of the checkbox
  vendorapi.storage.local.get("add_showfax_dropdowns", function (data) {
    if (data["add_showfax_dropdowns"]) {
      input2.checked = true;
    } else {
      input2.checked = false;
    }
  });

  input2.addEventListener("change", function () {
    vendorapi.storage.local.set({ add_showfax_dropdowns: input2.checked });
  });

});

var msg_appname = vendorapi.i18n.getMessage("appName");
document.getElementById("app").innerHTML = msg_appname;