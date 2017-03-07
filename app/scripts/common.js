"use strict";

export const DEBUG = (process.env.NODE_ENV === "production") ? false : true;
export const showfaxHistoryDefaultValue = [{ href: "http://showfax.com", text: "Showfax" }];
export const regionsDropdownDefaultValue = "<ul class=\"dropdown-menu\"><li><a href=\"http://www.showfax.com/type_selection.cfm?l=1\">Los Angeles</a></li><li><a href=\"http://www.showfax.com/type_selection.cfm?l=2\">New York</a></li><li><a href=\"http://www.showfax.com/type_selection.cfm?l=3\">Chicago</a></li><li><a href=\"http://www.showfax.com/type_selection.cfm?l=4\">Southeast</a></li><li><a href=\"http://www.showfax.com/type_selection.cfm?l=7\">Texas</a></li><li><a href=\"http://www.showfax.com/type_selection.cfm?l=8\">Northwest</a></li><li><a href=\"http://www.showfax.com/type_selection.cfm?l=5\">Vancouver</a></li><li><a href=\"http://www.showfax.com/type_selection.cfm?l=6\">Toronto</a></li></ul>";

window.title = (() => {
  var _title = "Kevin is awesome";
  function get() {
    return _title;
  }
  function set(t) {
    _title = t;
  }
  return { get, set }
})();