/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import window from 'global/window';
import document from 'global/document';
import xhr from 'xhr';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import xtend from 'xtend';
import autoBind from 'auto-bind';
import Immutable from 'immutable';
const {EventEmitter} = require('events');

import API from './API.js';
import Utils from './Utils.js';
import Store from './Store.js';
import Actions from './Actions.js';
import Router from './Router.js';
import Controller from './Controller.js';
import Dispatcher from './Dispatcher.js';
import Location from './Location.js';
import Promise from './Promise.js';
import DependencyRegistry from './DependencyRegistry.js';


/**
 * Main class.
 */
export default class Rey extends EventEmitter {

  /**
   * Creates a new Rey instance.
   */
  constructor() {
    super();
    autoBind(this);

    this.deps = new DependencyRegistry();

    this.deps.add({
      name: 'window',
      type: 'core',
      factory: [() => window]
    });

    this.deps.add({
      name: 'document',
      type: 'core',
      factory: [() => document]
    });

    this.deps.add({
      name: 'xhr',
      type: 'core',
      factory: [() => xhr]
    });

    this.deps.add({
      name: 'Promise',
      type: 'core',
      factory: [() => Promise]
    });

    this.deps.add({
      name: 'Immutable',
      type: 'core',
      factory: [() => Immutable]
    });

    this.deps.add({
      name: 'React',
      type: 'core',
      factory: ['Immutable', (Immutable) => {
        const ImmutableTypes = [
          'Iterable', 'Seq', 'Collection', 'Map',
          'OrderedMap', 'List', 'Stack', 'Set',
          'OrderedSet', 'Record', 'Range', 'Repeat'
        ];
        ImmutableTypes.forEach((type) => {
          React.PropTypes[type] = React.PropTypes.instanceOf(Immutable[type]);
        });
        return React;
      }]
    });

    this.deps.add({
      name: 'ReactDOM',
      type: 'core',
      factory: [() => ReactDOM]
    });

    this.deps.add({
      name: 'ReactCSSTransitionGroup',
      type: 'core',
      factory: [() => ReactCSSTransitionGroup]
    });

    this.deps.add({
      name: 'Dispatcher',
      type: 'core',
      factory: [() => new Dispatcher()]
    });

    this.deps.add({
      name: 'Location',
      type: 'core',
      factory: ['window', (window) => new Location(window)]
    });
  }

  /**
   * Registers a new factory.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  factory(name, dependencies) {
    const trace = new Error('factory: ' + name);
    const factory = () => this.deps.resolve(dependencies);
    this.deps.add({
      name,
      type: 'factory',
      factory: [factory, trace]
    });
    return this;
  }

  /**
   * Registers a new store.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  store(name, dependencies) {
    const trace = new Error('store: ' + name);
    const factory = (dispatcher) => {

      const store = new Store(dispatcher);
      const storeOptions = this.deps.resolve(dependencies);

      // set action handler
      if (storeOptions.registerHandler) {
        store.setActionHandler(storeOptions.registerHandler);
      } else if (storeOptions.actionHandler) {
        store.setActionHandler(storeOptions.actionHandler);
      }

      // get stores to attach
      let attachStores = [];
      if (storeOptions.attachStore) {
        if (Utils.isArray(storeOptions.attachStore)) {
          attachStores = storeOptions.attachStore;
        } else if (Utils.isObject(storeOptions.attachStore)) {
          Object.keys(storeOptions.attachStore).forEach(function(key, value) {
            attachStores.push([key, storeOptions.attachStore[key]]);
          });
        } else {
          attachStores.push(storeOptions.attachStore);
        }
      }

      // resolve and attach stores
      attachStores.forEach((attachStore) => {
        if (Utils.instanceOf(attachStore, Store)) {
          store.attachStore(attachStore);
        } else if (Utils.isString(attachStore)) {
          store.attachStore(this.deps.get(attachStore));
        } else if (Utils.isArray(attachStore)) {
          if (Utils.instanceOf(attachStore[1], Store)) {
            store.attachStore(attachStore[0], attachStore[1]);
          } else if (Utils.isString(attachStore[1])) {
            store.attachStore(attachStore[0], this.deps.get(attachStore[1]));
          }
        }
      });

      store.extend(storeOptions);
      autoBind(store);
      return store;
    };
    this.deps.add({
      name,
      type: 'store',
      factory: ['Dispatcher', factory, trace]
    });
    return this;
  }

  /**
   * Registers a new actions.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  actions(name, dependencies) {
    const trace = new Error('actions: ' + name);
    const factory = (dispatcher) => {
      const actions = new Actions(dispatcher);
      actions.extend(this.deps.resolve(dependencies));
      autoBind(actions);
      return actions;
    };
    this.deps.add({
      name,
      type: 'actions',
      factory: ['Dispatcher', factory, trace]
    });
    return this;
  }

  /**
   * Registers a new router.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  router(name, dependencies) {
    const trace = new Error('router: ' + name);
    const factory = (dispatcher, location, React, ReactDOM, document) => {
      const router = new Router(dispatcher, location);
      router.setRoutes(this.deps.resolve(dependencies));
      router.register(() => {
        const route = router.getState();

        if (Utils.isFunction(route.handler)) {
          route.handler(route);
          return;
        }

        // resolve the controller
        const controller = Utils.isString(route.controller) ?
          this.deps.get(route.controller) : Utils.isArray(route.controller) ?
          this.deps.resolve(route.controller) : route.controller;

        // resolves the container
        const container = Utils.isString(route.container) ?
          document.getElementById(route.container) :
          Utils.isFunction(route.container) ?
          route.container() : route.container;

        const element = React.createElement(controller, { router });
        ReactDOM.render(element, container);
      });
      autoBind(router);
      return router;
    };
    this.deps.add({
      name,
      type: 'router',
      factory: ['Dispatcher', 'Location', 'React', 'ReactDOM', 'document', factory, trace]
    });
    return this;
  }

  /**
   * Registers a new component.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  component(name, dependencies) {
    const trace = new Error('component: ' + name);
    const factory = (React) => {
      const component = this.deps.resolve(dependencies);
      if (!component.displayName) {
        component.displayName = name;
      }
      if (Utils.isFunction(component.render)) {
        const render = component.render;
        const rey = this;
        component.render = function() {
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
    };
    this.deps.add({
      name,
      type: 'router',
      factory: ['React', factory, trace]
    });
    return this;
  }

  /**
   * Registers a new controller.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  controller(name, dependencies) {
    const trace = new Error('controller: ' + name);
    const factory = (React) => {

      const props = this.deps.resolve(dependencies);

      // resolve the component
      const component = Utils.isString(props.component) ?
        this.deps.get(props.component) : Utils.isArray(props.component) ?
        this.deps.resolve(props.component) : props.component;

      // resolve the stores
      const store = Utils.isString(props.store) ?
        this.deps.get(props.store) : Utils.isArray(props.store) ?
        props.store.map(store => {
          return Utils.isString(store) ?
            this.deps.get(store) : Utils.isArray(store) ?
            this.deps.resolve(store) : store;
        }) : props.store;

      // resolve the actions
      const actions = Utils.isString(props.actions) ?
        this.deps.get(props.actions) : Utils.isArray(props.actions) ?
        props.actions.map(actions => {
          return Utils.isString(actions) ?
            this.deps.get(actions) : Utils.isArray(actions) ?
            this.deps.resolve(actions) : actions;
        }) : props.actions;

      // resolve the router
      const router = Utils.isString(props.router) ?
        this.deps.get(props.router) : Utils.isArray(props.router) ?
        this.deps.resolve(props.router) : props.router;

      const defaultProps = {
        component,
        store,
        actions,
        router
      };

      const componentMethods = {
        displayName: name,
        getDefaultProps() {
          if (Utils.isFunction(props.getDefaultProps)) {
            return xtend(defaultProps, props.getDefaultProps.call(this));
          }
          return defaultProps;
        }
      };

      if (props.propTypes) {
        componentMethods.propTypes = xtend(Controller.propTypes, props.propTypes);
      }

      Object.keys(props).forEach(prop => {
        if (!defaultProps[prop] && prop !== 'getDefaultProps' && prop !== 'propTypes') {
          componentMethods[prop] = props[prop];
        }
      });

      return React.createClass(xtend(Controller, componentMethods));
    };
    this.deps.add({
      name,
      type: 'controller',
      factory: ['React', factory, trace]
    });
    return this;
  }

  /**
   * Registers a new static.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  static(name, dependencies) {
    const trace = new Error('static: ' + name);
    const factory = () => Immutable.fromJS(this.deps.resolve(dependencies));
    this.deps.add({
      name,
      type: 'static',
      factory: [factory, trace]
    });
    return this;
  }

  /**
   * Registers a new API.
   * @param {String} name
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  api(name, dependencies) {
    const trace = new Error('api: ' + name);
    const factory = (xhr, Promise, Location) => {
      const api = new API(xhr, Promise, Location);
      const methods = this.deps.resolve(dependencies);
      api.extend(methods);
      return api;
    };
    this.deps.add({
      name,
      type: 'api',
      factory: ['xhr', 'Promise', 'Location', factory, trace]
    });
    return this;
  }

  /**
   * Resolves specified dependencies.
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  load(dependencies) {
    this.deps.resolve(dependencies.concat(Utils.noop));
    return this;
  }

  /**
   * Resolves specified dependencies.
   * @param {Array} dependencies
   * @return {Rey} rey
   */
  run(dependencies) {
    this.deps.resolve(dependencies);
    return this;
  }

};

// - -------------------------------------------------------------------- - //
