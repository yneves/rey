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
var bluebird = require("bluebird");
var CSSTransitionGroup = require("react-addons-css-transition-group");
var BrowserRequest = require("browser-request");
var parseArgs = require("./args.js");

module.exports = factory.createClass({
  
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
      return bluebird;
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
  
  isStore: Fluks.isStore,
  isAction: Fluks.isAction,
  isDispatcher: Fluks.isDispatcher,
  
  isRouter: function(arg) { return arg instanceof Rooter; },
  isPromise: function(arg) { return arg instanceof Promise; },
  isComponent: function(arg) {},
  isController: function() { 
    
  },
  
  createController: {
    
    // .createController(controller Object) :Component
    o: function(controller) {
      
      var store = this.isStore(controller.store) ? 
        controller.store : this.inject(controller.store);

      return React.createClass({
        
        displayName: name,
        mixins: [store.createMixin(), controller],
        
        storeDidChange: function(store) {
          this.setState(store.getState());
        },
        
        componentDidMount: function() {
          if (controller.pageTitle) {
            var pageTitle = factory.isFunction(controller.pageTitle) ?
              controller.pageTitle.call(this) : controller.pageTitle;
            this.previousTitle = document.title;
            document.title = pageTitle;
          }
        },
        
        componentWillUnmount: function() {
          if (this.previousTitle) {
            document.title = this.previousTitle;
          }
        },
        
        render: function() {
          return React.createElement(controller.component, this.state);
        }
      });
    }
  },
  
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
        var storeOptions = this.inject(deps);
        var store = Flux.createStore(storeOptions);
        if (storeOptions.registerHandler) {
          store.register(storeOptions.registerHandler);
        }
        return store;
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
      return this.factory(name, [function() {
        
        var controller = this.inject(deps);
        return this.createController(controller);
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
        if (!component.displayName) {
          component.displayName = name;
        }
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
      this.factory(name, ["Router", "ReactDOM", function(Router, ReactDOM) {
        
        var routes = this.inject(deps);
        
        if (factory.isObject(routes)) {
          
          Object.keys(routes).forEach(function(href) {
            
            var route = routes[href];
            if (factory.isObject(route)) {
              
              if (!factory.isDefined(route.handler)) {
                route.handler = function(activeRoute) {
                  
                  var controller = factory.isString(route.controller) ?
                    this.inject(route.controller) : route.controller;
                  
                  var container = factory.isString(route.container) ? 
                    document.getElementById(route.container) :
                    factory.isFunction(route.container) ?
                      route.container() : route.container;
                  
                  var element = React.createElement(controller, activeRoute);
                  ReactDOM.render(element, container);
                  
                }.bind(this);
              }
              
              var routeCopy = {};
              Object.keys(route).forEach(function(key) {
                if (key !== "controller" && key !== "container") {
                  routeCopy[key] = route[key];
                }
              });
              routes[href] = routeCopy;
              
            } else if (factory.isFunction(route)) {
              routes[href] = { handler: route };
            }
          }, this);
        }
        
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
