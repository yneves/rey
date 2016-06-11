/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const Immutable = require('immutable');
const CallbackRegistry = require('./CallbackRegistry.js');

const callbackWrapper = (callback) => (state) => {
  if (typeof callback === 'object' && typeof callback.setState === 'function') {
    callback.setState(state);
  }
};

const concatPath = (args, offset) => {
  const length = args.length;
  let path = Immutable.List();
  for (let i = 0; i < length - offset; i++) {
    path = path.concat(args[i]);
  }
  return path;
};

/**
 * Base class for manipulating state.
 */
class StateHolder {

  /**
   * Creates a new state holder object.
   */
  constructor() {
    this.callbacks = new CallbackRegistry(callbackWrapper);
    this.initialState = this.state;
    this.resetState();
  }

  /**
   * Registers a callback to be executed at every state change.
   * @param {function} callback to be registered
   * @param {object} this variable for the callback
   * @param {error} trace error
   * @return {function} added callback
   */
  register(callback, context, trace) {
    return this.callbacks.add(callback, context, trace);
  }

  /**
   * Removes a callback previously registered.
   * @param {function} callback to be removed
   */
  unregister(callback) {
    this.callbacks.remove(callback);
  }

  /**
   * Runs all registered callbacks passing the object itself.
   */
  emitChange() {
    this.callbacks.run(this);
  }

  /**
   * Returns the initial state for the object.
   * @return {object} the initial state
   */
  getInitialState() {
    return this.initialState;
  }

  /**
   * Restores the state to the initial state.
   */
  resetState() {
    this.state = Immutable.Map().merge(this.getInitialState());
    this.emitChange();
  }

  /**
   * Returns the state or the requested property.
   * @param {string|array} path to the wanted state property
   * @return {any} state vaue
   */
  getState() {
    const args = Array.from(arguments);
    return args.length === 0 ? this.state : this.state.getIn(concatPath(args, 0));
  }

  /**
   * Sets given state values.
   * @param {string|array} path to the state value
   * @param {any} state value
   */
  setState() {
    const args = Array.from(arguments);
    const length = args.length;
    if (length === 1) {
      this.state = this.state.merge(args[0]);
    } else if (length > 1) {
      const path = concatPath(args, 1 );
      this.state = this.state.setIn(path, args[length - 1]);
    }
    this.emitChange();
  }

  /**
   * Merges given state values.
   * @param {string|array} path to the state value
   * @param {any} state value
   */
  mergeState() {
    const args = Array.from(arguments);
    const length = args.length;
    if (length === 1) {
      this.state = this.state.merge(args[0]);
    } else if (length > 1) {
      const path = concatPath(args, 1 );
      this.state = this.state.mergeIn(path, args[length - 1]);
    }
    this.emitChange();
  }

  /**
   * Deletes given state values.
   * @param {string|array} path to the state value
   */
  deleteState() {
    const args = Array.from(arguments);
    const length = args.length;
    if (length === 0) {
      this.state = this.state.clear();
    } else if (length > 0) {
      const path = concatPath(args, 0);
      this.state = this.state.deleteIn(path);
    }
    this.emitChange();
  }

  /**
   * Updates state values.
   * @param {string|array} path to the state value
   * @param {function} callback to return new state value
   */
  updateState() {
    const args = Array.from(arguments);
    const length = args.length;
    if (length === 1) {
      this.state = this.state.update(args[0]);
    } else if (length > 1) {
      const path = concatPath(args, 1 );
      this.state = this.state.updateIn(path, args[length - 1]);
    }
    this.emitChange();
  }

};

module.exports = StateHolder;

// - -------------------------------------------------------------------- - //
