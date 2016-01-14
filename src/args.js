// - -------------------------------------------------------------------- - //

"use strict";

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

module.exports = function parseArgs(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, "");
  var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
  return result || [];
};

// - -------------------------------------------------------------------- - //
