/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

"use strict";

var factory = require("bauer-factory");
var Rooter = require("rooter");
var Fluks = require("fluks");
var React = require("react-immutable");
var ReactDOM = require("react-dom");
var Immutable = require("immutable");
var classNames = require("classnames");
var promiseFactory = require("bluebird/js/release/promise");
var CSSTransitionGroup = require("react-addons-css-transition-group");
var BrowserRequest = require("browser-request");
var parseArgs = require("./args.js");

module.exports = factory.createObject({
  
  constructor: function() {
    
    this.factories = {};
    this.instances = {};
    
    this.factory("Flux", function() {
      return Fluks.createFlux();
    });
    
    this.factory("Immutable", function() {
      return Immutable;
    });
    
    this.factory("classNames", function() {
      return classNames;
    });
    
    this.factory("React", function() {
      return React;
    });
    
    this.factory("ReactDOM", function() {
      return ReactDOM;
    });
    
    this.factory("CSSTransitionGroup", function() {
      return CSSTransitionGroup;
    });
    
    this.factory("Promise", function() {
      return promiseFactory();
    });
    
    this.factory("request", function() {
      return BrowserRequest;
    });
    
    this.factory("Router", function() {
      return new Rooter();
    });
    
    this.factory("Dispatcher", ["Flux", function(Flux) {
      return Flux.dispatcher;
    }]);
    
  },
  
  isRouter: function(arg) { return arg instanceof Rooter; },
  isStore: Fluks.isStore,
  isAction: Fluks.isAction,
  isDispatcher: Fluks.isDispatcher,
  isString: factory.isString,
  isNumber: factory.isNumber,
  isBoolean: factory.isBoolean,
  isArray: factory.isArray,
  isObject: factory.isObject,
  isNull: factory.isNull,
  isDefined: factory.isDefined,
  isUndefined: factory.isUndefined,
  isError: factory.isError,
  isDate: factory.isDate,
  isRegExp: factory.isRegExp,
  isArguments: factory.isArguments,
  
  factory: {
    
    // .factory(name String, injectable Function) :void
    sf: function(name, injectable) {
      this.factories[name] = injectable;
      return this;
    },
    
    // .factory(name String, injectable Array) :void
    sa: function(name, injectable) {
      this.factories[name] = injectable;
      return this;
    }
  },
  
  inject: {
    
    // .inject(name String) :Object
    s: function(name) {
      if (!this.factories[name]) {
        throw new Error("unknown dependency requested: " + name);
      }
      if (!this.instances[name]) {
        this.instances[name] = this.inject(this.factories[name]);
      }
      return this.instances[name];
    },
    
    // .inject(code Function) :Object
    f: function(code) {
      return this.inject(parseArgs(code).concat(code));
    },
    
    // .inject(dependencies Array) :Object
    a: function(deps) {
      if (!factory.isFunction(deps[deps.length - 1])) {
        throw new Error("Last element must be a function.");
      }
      var code = deps[deps.length - 1];
      var len = deps.length - 1;
      var args = [];
      var i;
      for (i = 0; i < len; i++) {
        args[i] = this.inject(deps[i]);
      }
      return code.apply(this, args);
    }
  },
  
  store: {
    
    // .store(name String, factory Function) :void
    sf: function(name, code) {
      return this.store(name, parseArgs(code).concat(code));
    },
    
    // .store(name String, dependencies Array) :void
    sa: function(name, deps) {
      return this.factory(name, ["Flux", function(Flux) {
        var store = this.inject(deps);
        return Flux.createStore(store);
      }]);
    }
  },
  
  action: {
    
    // .action(name String, factory Function) :void
    sf: function(name, code) {
      return this.action(name, parseArgs(code).concat(code));
    },
    
    // .action(name String, dependencies Array) :void
    sa: function(name, deps) {
      return this.factory(name, ["Flux", function(Flux) {
        var action = this.inject(deps);
        return Flux.createAction(action);
      }]);
    }
  },
  
  controller: {
    
    // .controller(name String, factory Function) :void
    sf: function(name, code) {
      return this.controller(name, parseArgs(code).concat(code));
    },
    
    // .controller(name String, dependencies Array) :void
    sa: function(name, deps) {
      return this.factory(name, ["React", function(React) {
        
        var controller = this.inject(deps);
        
        var store = this.isStore(controller.store) ? 
          controller.store : this.inject(controller.store);
        
        return React.createClass({
          displayName: name,
          mixins: [store.createMixin()],
          storeDidChange: function() {
            this.setState(store.getState());
          },
          shouldComponentUpdate: function(nextProps, nextState) {
            if (factory.isFunction(controller.update)) {
              return controller.update.call(this, nextState);
            }
          },
          render: function() {
            return React.createElement(controller.component, this.state);
          }
        });
      }]);
    }
  },
  
  component: {
    
    // .component(name String, factory Function) :void
    sf: function(name, code) {
      return this.component(name, parseArgs(code).concat(code));
    },
    
    // .component(name String, dependencies Array) :void
    sa: function(name, deps) {
      this.factory(name, ["React", function(React) {
        var component = this.inject(deps);
        return React.createClass(component);
      }]);
    }
  },
  
  routes: {
    
    // .routes(name String, factory Function) :void
    sf: function(name, code) {
      return this.routes(name, parseArgs(code).concat(code));
    },
    
    // .routes(name String, dependencies Array) :void
    sa: function(name, deps) {
      this.factory(name, ["Router", function(Router) {
        var routes = this.inject(deps);
        return Router.setRoute(routes);
      }]);
    }
  },
  
  load: {
    
    // .run(dependencies Array) :void
    a: function(deps) {
      this.inject(deps.concat([function() {}]));
      return this;
    }
  },
  
  run: {
    
    // .run(code Function) :void
    f: function(code) {
      return this.run(parseArgs(code).concat(code));
    },
    
    // .run(dependencies Array) :void
    a: function(deps) {
      this.inject(deps);
      return this;
    }
  }
  
});

// - -------------------------------------------------------------------- - //
