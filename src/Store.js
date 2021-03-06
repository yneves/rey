/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import Utils from './Utils.js';
import Dispatcher from './Dispatcher.js';
import StateHolder from './StateHolder.js';

const reservedKeys = [
  'constructor',
  'registerHandler',
  'actionHandler',
  'attachStore',
  'attachedStores',
  'detachStore'
];

/**
 * Class to represent a Store.
 */
export default class Store extends StateHolder {

  /**
   * Creates a new store instance.
   * @param {Dispatcher} dispatcher
   */
  constructor(dispatcher) {
    if (!(dispatcher instanceof Dispatcher)) {
      throw new Error('Dispatcher must be provided');
    }
    super();
    this.dispatcher = dispatcher;
    this.attachedStores = [];
  }

  /**
   * Called before store is activated.
   */
  storeWillActivate() {
  }

  /**
   * Called after store is activated.
   */
  storeDidActivate() {
  }

  /**
   * Called before store is deactivated.
   */
  storeWillDeactivate() {
  }

  /**
   * Activates the store by registering to handle actions.
   */
  activate() {
    if (this.handler) {
      throw new Error('store has been activated already');
    }
    this.storeWillActivate();
    this.resetState();
    this.handler = this.dispatcher.register((action) => {
      const actionHandler = this.getActionHandler();
      if (Utils.isFunction(actionHandler)) {
        this.callActionHandler(actionHandler, action);
      } else if (Utils.isObject(actionHandler)) {
        const type = action.actionType || action.type;
        this.callActionHandler(actionHandler[type], action);
      }
    });
    this.attachedStores.map(attachedStore => attachedStore[1].activate());
    this.storeDidActivate();
  }

  /**
   * Activates the store by deregistering the action handler.
   */
  deactivate() {
    this.storeWillDeactivate();
    this.attachedStores.map(attachedStore => attachedStore[1].deactivate());
    if (this.handler) {
      this.dispatcher.unregister(this.handler);
      this.handler = undefined;
    }
  }

  /**
   * Activates the store only if its not activate yet
   * and there's at least one callback registered.
   */
  autoActivate() {
    if (!this.handler && this.callbacks.count()) {
      this.activate();
    }
  }

  /**
   * Deactivates the store only if its been activated
   * and there aren't any callbacks registered.
   */
  autoDeactivate() {
    if (this.handler && !this.callbacks.count()) {
      this.deactivate();
    }
  }

  /**
   * Sets the action handler.
   * @param {Function} handler
   */
  setActionHandler(handler) {
    this.actionHandler = handler;
  }

  /**
   * Gets the action handler.
   * @return {Function} handler
   */
  getActionHandler() {
    return this.actionHandler;
  }

  /**
   * Calls the action handler.
   * @private
   * @param {Function} handler
   * @param {Object} action
   */
  callActionHandler(handler, action) {
    if (!Utils.isFunction(handler)) {
      return;
    }
    if (handler.length === 2) {
      handler(this, action);
    } else {
      handler.call(this, action);
    }
  }

  /**
   * Extends the store with given methods.
   * @param {Object} methods
   */
  extend(methods) {
    Object.keys(methods).forEach(name => {
      if (reservedKeys.indexOf(name) === -1) {
        this[name] = methods[name].bind(this);
      }
    });
  }

  /**
   * Attaches another store to this store's state.
   * @param {String} name
   * @param {Store} store
   * @return {Function} handler
   */
  attachStore(name, store) {
    if (arguments.length === 1) {
      store = name;
      name = undefined;
    }
    const handler = store.register(stateHolder => {
      if (name) {
        this.setState([name], stateHolder.state);
      } else {
        this.setState(stateHolder.state);
      }
    });
    this.attachedStores.push([name, store, handler]);
    return handler;
  }

  /**
   * Detaches a previously attached store from this store's state.
   * @param {Store} store
   */
  detachStore(store) {
    this.attachedStores = this.attachedStores.filter(entry => {
      if (entry.store === store || entry.name === store || entry.handler === store) {
        entry.store.unregister(entry.handler);
        return false;
      }
      return true;
    });
  }

  /**
   * Exports store state to props object.
   * @return {Object} props
   */
  toProps() {
    return this.getState();
  }

};

// - -------------------------------------------------------------------- - //
