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
var prepareOptions = require('./options.js');

var API = factory.createClass({

  constructor: function (http, Promise, defaults) {
    this.http = http.create();
    this.Promise = Promise;
    this.defaults = defaults;
    this.init();
  },

  init: function () {

  },

  request: function () {
    var defaults = factory.isFunction(this.defaults) ? this.defaults() : this.defaults;
    var options = prepareOptions(defaults, arguments);
    return this.Promise.resolve(this.http.request(options))
      .bind(this)
      .then(function (response) {
        if (response.status === 200 && response.data) {
          return Immutable.fromJS(response.data);
        }
      });
  }

});

function createMethod (method) {
  return function () {
    var args = [method];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    return this.request.apply(this, args);
  };
}

module.exports = function (http, Promise, name, methods) {

  name = name.replace(/\W/g, '_');
  var defaults = methods.defaults || {};
  var options = {
    inherits: API
  };

  Object.keys(methods).forEach(function (name) {
    if (name !== 'defaults') {
      var method = methods[name];
      if (factory.isFunction(method)) {
        options[name] = method;
      } else {
        options[name] = createMethod(method);
      }
    }
  });

  var CustomAPI = factory.createClass(name, options);
  return new CustomAPI(http, Promise, defaults);
};

// - -------------------------------------------------------------------- - //
