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

// - -------------------------------------------------------------------- - //

function defaultStoreChange (store) {
  this.setState(store.getState());
}

function createMixin (controller) {
  var mixin = {};
  var reserved = [
    'storeDidChange',
    'store',
    'component',
    'pageTitle'
  ];
  Object.keys(controller).forEach(function (key) {
    if (reserved.indexOf(key) === -1) {
      mixin[key] = controller[key];
    }
  });
  return mixin;
}

function createStoreMixin (store) {
  if (!this.isStore(store)) {
    store = this.inject(store);
  }
  if (this.isStore(store)) {
    return store.createMixin();
  }
}

module.exports = function createController (controller) {

  var mixins = [createMixin(controller)];
  if (this.isArray(controller.store)) {
    mixins = mixins.concat(controller.store.map(createStoreMixin, this));
  } else {
    mixins.push(createStoreMixin.call(this, controller.store));
  }

  var storeDidChange = this.isFunction(controller.storeDidChange) ?
    controller.storeDidChange : defaultStoreChange;

  var component = this.isString(controller.component) ?
    this.inject(controller.component) : controller.component;

  return React.createClass({
    displayName: name,
    mixins: mixins,
    storeDidChange: storeDidChange,
    componentDidMount: function () {
      if (controller.pageTitle) {
        var pageTitle = factory.isFunction(controller.pageTitle) ?
          controller.pageTitle.call(this) : controller.pageTitle;
        this.previousTitle = document.title;
        document.title = pageTitle;
      }
    },
    componentWillUnmount: function () {
      if (this.previousTitle) {
        document.title = this.previousTitle;
      }
    },
    render: function () {
      return React.createElement(component, this.state);
    }
  });
};

// - -------------------------------------------------------------------- - //
