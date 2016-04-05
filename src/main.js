/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

var events = require('events');
var bluebird = require('bluebird');
var axios = require('axios');
var factory = require('bauer-factory');
var Rooter = require('rooter');
var Fluks = require('fluks');
var React = require('react-immutable');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var classNames = require('classnames');
var CSSTransitionGroup = require('react-addons-css-transition-group');
var parseArgs = require('./args.js');
var createAPI = require('./api.js');
var createController = require('./controller.js');
var createRoutes = require('./routes.js');
var extendPromise = require('./promise.js');

window.React = React;
window.ReactDOM = ReactDOM;
window.Promise = extendPromise(bluebird);

module.exports = factory.createClass({

  inherits: events.EventEmitter,

  constructor: function () {

    this.factories = {};
    this.instances = {};

    this.factory('Flux', function () {
      return Fluks.createFlux();
    });

    this.factory('Immutable', function () {
      return Immutable;
    });

    this.factory('classNames', function () {
      return classNames;
    });

    this.factory('React', function () {
      return React;
    });

    this.factory('ReactDOM', function () {
      return ReactDOM;
    });

    this.factory('CSSTransitionGroup', function () {
      return CSSTransitionGroup;
    });

    this.factory('http', function () {
      return axios;
    });

    this.factory('Promise', function () {
      return bluebird;
    });

    this.factory('Dispatcher', ['Flux', function (Flux) {
      return Flux.dispatcher;
    }]);

  },

  isString: factory.isString,
  isNumber: factory.isNumber,
  isBoolean: factory.isBoolean,
  isArray: factory.isArray,
  isObject: factory.isObject,
  isNull: factory.isNull,
  isDefined: factory.isDefined,
  isUndefined: factory.isUndefined,
  isFunction: factory.isFunction,
  isError: factory.isError,
  isDate: factory.isDate,
  isRegExp: factory.isRegExp,
  isArguments: factory.isArguments,

  isStore: Fluks.isStore,
  isAction: Fluks.isAction,
  isDispatcher: Fluks.isDispatcher,

  isRouter: function (arg) { return arg instanceof Rooter; },
  isPromise: function (arg) { return arg instanceof Promise; },
  isComponent: factory.isObject,
  isController: function () {

  },

  merge: factory.merge,
  extend: factory.extend,

  createClass: factory.createClass,
  createObject: factory.createObject,

  factory: {

    // .factory(name String, injectable Function) :Rey
    sf: function (name, injectable) {
      this.factories[name] = injectable;
      return this;
    },

    // .factory(name String, injectable Array) :Rey
    sa: function (name, injectable) {
      this.factories[name] = injectable;
      return this;
    }
  },

  inject: {

    // .inject(name String) :Object
    s: function (name) {
      if (!this.factories[name]) {
        throw new Error('unknown dependency requested: ' + name);
      }
      if (!this.instances[name]) {
        this.instances[name] = this.inject(this.factories[name]);
      }
      return this.instances[name];
    },

    // .inject(code Function) :Object
    f: function (code) {
      return this.inject(parseArgs(code).concat(code));
    },

    // .inject(dependencies Array) :Object
    a: function (deps) {
      var hasTrace = factory.isError(deps[deps.length - 1]);
      var codeIndex = hasTrace ? deps.length - 2 : deps.length - 1;
      if (!factory.isFunction(deps[codeIndex])) {
        throw new Error('missing factory function');
      }
      var trace = hasTrace ? deps[codeIndex + 1] : null;
      var code = deps[codeIndex];
      var args = [];
      var i;
      for (i = 0; i < codeIndex; i++) {
        args[i] = this.inject(deps[i]);
      }
      try {
        return code.apply(this, args);
      } catch (error) {
        if (this.listenerCount('error')) {
          this.emit('error', error, trace);
        } else {
          console.error(error, trace);
        }
      }
    }
  },

  immutable: {

    // .immutable(name String, factory Function) :Rey
    sf: function (name, code) {
      return this.immutable(name, parseArgs(code).concat(code));
    },

    // .immutable(name String, dependencies Array) :Rey
    sa: function (name, deps) {
      var trace = new Error('immutable: ' + name);
      return this.factory(name, [function () {
        return Immutable.fromJS(this.inject(deps));
      }, trace]);
    }
  },

  store: {

    // .store(name String, factory Function) :Rey
    sf: function (name, code) {
      return this.store(name, parseArgs(code).concat(code));
    },

    // .store(name String, dependencies Array) :Rey
    sa: function (name, deps) {
      var trace = new Error('store: ' + name);
      return this.factory(name, ['Flux', function (Flux) {

        var storeOptions = this.inject(deps);

        storeOptions.displayName = name.replace(/\W/g, '_');

        var attachStores = [];
        if (storeOptions.attachStore) {
          if (factory.isArray(storeOptions.attachStore)) {
            attachStores = storeOptions.attachStore;
          } else if (factory.isObject(storeOptions.attachStore)) {
            Object.keys(storeOptions.attachStore).forEach(function (key, value) {
              attachStores.push([key, storeOptions.attachStore[key]]);
            });
          } else {
            attachStores.push(storeOptions.attachStore);
          }
          delete storeOptions.attachStore;
        }

        var store = Flux.createStore(storeOptions);

        if (storeOptions.registerHandler) {
          store.register(storeOptions.registerHandler);
        }

        attachStores.forEach(function (attachStore) {
          if (this.isStore(attachStore)) {
            store.attachStore(attachStore);
          } else if (this.isString(attachStore)) {
            store.attachStore(this.inject(attachStore));
          } else if (this.isArray(attachStore)) {
            if (this.isStore(attachStore[1])) {
              store.attachStore(attachStore[0], attachStore[1]);
            } else if (this.isString(attachStore[1])) {
              store.attachStore(attachStore[0], this.inject(attachStore[1]));
            }
          }
        }, this);

        return store;

      }, trace]);
    }
  },

  action: {

    // .action(name String, factory Function) :Rey
    sf: function (name, code) {
      return this.action(name, parseArgs(code).concat(code));
    },

    // .action(name String, dependencies Array) :Rey
    sa: function (name, deps) {
      var trace = new Error('action: ' + name);
      return this.factory(name, ['Flux', function (Flux) {
        return Flux.createAction(this.inject(deps));
      }, trace]);
    }
  },

  controller: {

    // .controller(name String, factory Function) :Rey
    sf: function (name, code) {
      return this.controller(name, parseArgs(code).concat(code));
    },

    // .controller(name String, dependencies Array) :Rey
    sa: function (name, deps) {
      var trace = new Error('controller: ' + name);
      return this.factory(name, [function () {
        return createController.call(this, this.inject(deps));
      }, trace]);
    }
  },

  component: {

    // .component(name String, factory Function) :Rey
    sf: function (name, code) {
      return this.component(name, parseArgs(code).concat(code));
    },

    // .component(name String, dependencies Array) :Rey
    sa: function (name, deps) {
      var trace = new Error('component: ' + name);
      this.factory(name, [function () {
        var component = this.inject(deps);
        if (!component.displayName) {
          component.displayName = name;
        }
        if (factory.isFunction(component.render)) {
          var render = component.render;
          var rey = this;
          component.render = function () {
            try {
              return render.call(this);
            } catch (error) {
              if (rey.listenerCount('error')) {
                rey.emit('error', error, trace);
              } else {
                console.error(error, trace);
              }
              return React.createElement('noscript');
            }
          };
        }
        return React.createClass(component);
      }, trace]);
    }
  },

  router: {

    // .router(name String, factory Function) :Rey
    sf: function (name, code) {
      return this.router(name, parseArgs(code).concat(code));
    },

    // .router(name String, dependencies Array) :Rey
    sa: function (name, deps) {
      var trace = new Error('router: ' + name);
      this.factory(name, [function () {
        var routes = this.inject(deps);
        var router = new Rooter();
        router.setRoute(createRoutes.call(this, routes));
        return router;
      }, trace]);
    }
  },

  api: {

    // .api(name String, factory Function) :Rey
    sf: function (name, code) {
      return this.api(name, parseArgs(code).concat(code));
    },

    // .api(name String, dependencies Array) :Rey
    sa: function (name, deps) {
      var trace = new Error('api: ' + name);
      this.factory(name, ['http', 'Promise', function (http, Promise) {
        var methods = this.inject(deps);
        return createAPI(http, Promise, name, methods);
      }, trace]);
    }
  },

  load: {

    // .run(dependencies Array) :Rey
    a: function (deps) {
      this.inject(deps.concat([function () {}]));
      return this;
    }
  },

  run: {

    // .run(code Function) :Rey
    f: function (code) {
      return this.run(parseArgs(code).concat(code));
    },

    // .run(dependencies Array) :Rey
    a: function (deps) {
      this.inject(deps);
      return this;
    }
  }

});

// - -------------------------------------------------------------------- - //
