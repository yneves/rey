/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const CallbackRegistry = require('./CallbackRegistry.js');

const callbackWrapper = (callback) => (payload) => {
  if (typeof callback[payload.actionType] === 'function') {
    callback[payload.actionType].call(null, payload);
  }
};

/**
 * Class to manage Flux actions flow.
 */
class Dispatcher {

  /**
   * Creates a new Dispatcher instance.
   */
  constructor() {
    this.payloads = [];
    this.callbacks = new CallbackRegistry(callbackWrapper);
  }

  /**
   * Triggers the registered callbacks for all queued actions.
   */
  flush() {
    this.flushing = true;
    while (this.payloads.length) {
      const payload = this.payloads.shift();
      this.callbacks.run(payload);
    }
    this.flushing = false;
  }

  /**
   * Dispatches an action, triggering the registered callbacks.
   * @param {object} action payload
   */
  dispatch(payload) {
    this.payloads.push(payload);
    if (!this.flushing) {
      this.flush();
    }
  }

  /**
   * Registers a callback to be executed at every action.
   * @param {function} callback to be registered
   * @param {object} this variable for the callback
   * @param {error} trace error
   * @return {function} added callback
   */
  register(callback, context, trace) {
    return this.callbacks.add(callback, context, trace);
  }

  /**
   * Removes the given callback from the registry.
   * @param {function} callback to be removed
   * @return {boolean} true if the callback was found
   */
  unregister(callback) {
    return this.callbacks.remove(callback);
  }

};

module.exports = Dispatcher;

// - -------------------------------------------------------------------- - //
