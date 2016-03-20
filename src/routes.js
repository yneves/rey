/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');
var React = require('react-immutable');
var ReactDOM = require('react-dom');

// - -------------------------------------------------------------------- - //

function copyRoute (route) {
  var routeCopy = {};
  Object.keys(route).forEach(function (key) {
    if (key !== 'controller' && key !== 'container') {
      routeCopy[key] = route[key];
    }
  });
  return routeCopy;
}

function handleRoute (controller, container, activeRoute) {

  controller = factory.isString(controller)
    ? this.inject(controller) : controller;

  container = factory.isString(container) ?
    document.getElementById(container) :
    factory.isFunction(container) ?
      container() : container;

  var element = React.createElement(controller, activeRoute);
  ReactDOM.render(element, container);
}

module.exports = function createRoutes (routes) {
  if (factory.isObject(routes)) {
    Object.keys(routes).forEach(function (href) {
      var route = routes[href];
      if (factory.isFunction(route)) {
        routes[href] = { handler: route };
      } else if (factory.isObject(route)) {
        if (!factory.isDefined(route.handler)) {
          route.handler = handleRoute.bind(this, route.controller, route.container);
        }
        routes[href] = copyRoute(route);
      }
    }, this);
  }
  return routes;
};

// - -------------------------------------------------------------------- - //
