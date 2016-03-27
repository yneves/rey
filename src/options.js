/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');
var Immutable = require('immutable');

module.exports = function (defaults, givenArgs) {

  var args = [defaults];

  var argNames = [];

  Array.prototype.forEach.call(givenArgs, function (arg) {

    if (Immutable.Map.isMap(arg) || Immutable.List.isList(arg)) {
      arg = arg.toJS();
    }
    if (factory.isString(arg)) {
      argNames.push(arg);
    } else if (factory.isArray(arg)) {
      arg.forEach(function (subArg) {
        if (Immutable.Map.isMap(subArg) || Immutable.List.isList(subArg)) {
          subArg = subArg.toJS();
        }
        if (factory.isString(subArg)) {
          argNames.push(subArg);
        } else {
          if (argNames.length) {
            var optArg = {};
            optArg[argNames.shift()] = subArg;
            args.push(optArg);
          } else {
            args.push(subArg);
          }
        }
      });
    } else {
      if (argNames.length) {
        var optArg = {};
        optArg[argNames.shift()] = arg;
        args.push(optArg);
      } else {
        args.push(arg);
      }
    }
  });

  return factory.extend.apply(factory, args);
};

// - -------------------------------------------------------------------- - //
