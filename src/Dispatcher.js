/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import CallbackRegistry from './CallbackRegistry.js';

const callbackWrapper = (callback) => (payload) => {
  if (typeof callback[payload.actionType] === 'function') {
    callback[payload.actionType].call(null, payload);
  }
};

/**
 * Class to manage Flux actions flow.
 */
export default class Dispatcher {

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
   * @param {Object} payload
   */
  dispatch(payload) {
    this.payloads.push(payload);
    if (!this.flushing) {
      this.flush();
    }
  }

  /**
   * Registers a callback to be executed at every action.
   * @param {Function} callback to be registered
   * @param {Object} context this variable for the callback
   * @param {Error} trace error
   * @return {Function} added callback
   */
  register(callback, context, trace) {
    return this.callbacks.add(callback, context, trace);
  }

  /**
   * Removes the given callback from the registry.
   * @param {Function} callback to be removed
   * @return {Boolean} unregistered true if the callback was found
   */
  unregister(callback) {
    return this.callbacks.remove(callback);
  }

};

// - -------------------------------------------------------------------- - //
