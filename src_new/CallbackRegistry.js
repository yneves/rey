/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

/**
 * Generic class to manage a list of callbacks.
 */
class CallbackRegistry {

  /**
   * Creates a new list of callbacks.
   * @param {function} used to wrap non-function callbacks into function
   */
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.callbacks = [];
  }

  /**
   * Returns the number of registered callbacks.
   */
  count() {
    return this.callbacks.length;
  }

  /**
   * Removes all registered callbacks.
   */
  clear() {
    this.callbacks.length = 0;
  }

  /**
   * Registers a new callback.
   * Call the wrapper passed on contructur if the argument is not a function.
   * Throws an exception if the callback is already registered.
   * @param {function} callback to be registered
   * @param {object} this variable for the callback
   * @param {error} trace error
   * @return {function} added callback
   */
  add(callback, context, trace) {
    const wrapped = typeof callback === 'function'
      ? callback : typeof this.wrapper === 'function'
        ? this.wrapper(callback) : callback;
    const index = this.indexOf(wrapped);
    if (index !== -1) {
      throw new Error('cannot add repeated callbacks');
    }
    this.callbacks.push({
      callback: wrapped,
      context: context,
      trace: trace || new Error()
    });
    return wrapped;
  }

  /**
   * Finds the given callback within the list.
   * @param {function} callback to be found
   * @return {number} index of the callback within the list
   */
  indexOf(callback) {
    let index = -1;
    const length = this.callbacks.length;
    for (let i = 0; i < length; i++) {
      if (this.callbacks[i].callback === callback) {
        index = i;
        break;
      }
    }
    return index;
  }

  /**
   * Removes the given callback from the registry.
   * @param {function} callback to be removed
   * @return {boolean} true if the callback was found
   */
  remove(callback) {
    const index = this.indexOf(callback);
    const found = index !== -1;
    if (found) {
      this.callbacks.splice(index, 1);
    }
    return found;
  }

  /**
   * Executes the given callback passing arguments.
   * @param {object} callback entry
   * @param {array} arguments
   */
  call(entry, args) {
    try {
      entry.callback.apply(entry.context, args);
    } catch (error) {
      console.error(error, entry.trace);
    }
  }

  /**
   * Executes all registered callbacks passing given arguments.
   */
  run() {
    const args = Array.from(arguments);
    const length = this.callbacks.length;
    for (let i = 0; i < length; i++) {
      this.call(this.callbacks[i], args);
    }
  }

};

module.exports = CallbackRegistry;

// - -------------------------------------------------------------------- - //
