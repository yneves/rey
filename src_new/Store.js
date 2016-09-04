/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const Utils = require('./Utils.js');
const Dispatcher = require('./Dispatcher.js');
const StateHolder = require('./StateHolder.js');

const reservedKeys = [
  'constructor',
  'registerHandler',
  'actionHandler',
  'attachStore'
];

/**
 * Class to represent a Store.
 */
class Store extends StateHolder {

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
  }

  /**
   * Activates the store by registering to handle actions.
   */
  activate() {
    if (this.handler) {
      throw new Error('store has been activated already');
    }
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
  }

  /**
   * Activates the store by deregistering the action handler.
   */
  deactivate() {
    if (this.handler) {
      this.dispatcher.unregister(this.handler);
      this.handler = undefined;
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
   * @param {Object} payload
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

};

module.exports = Store;

// - -------------------------------------------------------------------- - //
