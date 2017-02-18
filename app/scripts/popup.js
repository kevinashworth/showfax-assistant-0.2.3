document.addEventListener('DOMContentLoaded', function () {

  var input1 = document.getElementById('change_showfax_titles_option');

  // set the initial state of the checkbox
  chrome.storage.sync.get("change_showfax_titles", function (data) {
    if (data["change_showfax_titles"]) {
      input1.checked = true;
    } else {
      input1.checked = false;
    }
  });

  input1.addEventListener("change", function () {
    chrome.storage.sync.set({ change_showfax_titles: input1.checked });
  });

  var input2 = document.getElementById('add_showfax_dropdowns_option');

  // set the initial state of the checkbox
  chrome.storage.sync.get("add_showfax_dropdowns", function (data) {
    if (data["add_showfax_dropdowns"]) {
      input2.checked = true;
    } else {
      input2.checked = false;
    }
  });

  input2.addEventListener("change", function () {
    chrome.storage.sync.set({ add_showfax_dropdowns: input2.checked });
  });

});