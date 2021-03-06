/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import Immutable from 'immutable';
import CallbackRegistry from './CallbackRegistry.js';

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
export default class StateHolder {

  /**
   * Creates a new state holder object.
   */
  constructor() {
    this.callbacks = new CallbackRegistry(callbackWrapper);
    this.resetState();
  }

  /**
   * Registers a callback to be executed at every state change.
   * @param {Function} callback to be registered
   * @param {Object} context this variable for the callback
   * @param {Error} trace error
   * @return {Function} callback added callback
   */
  register(callback, context, trace) {
    return this.callbacks.add(callback, context, trace);
  }

  /**
   * Removes a callback previously registered.
   * @param {Function} callback to be removed
   */
  unregister(callback) {
    return this.callbacks.remove(callback);
  }

  /**
   * Runs all registered callbacks passing the object itself.
   */
  emitChange() {
    this.callbacks.run(this);
  }

  /**
   * Returns the initial state for the object.
   * @return {Object} state
   */
  getInitialState() {
    return Immutable.Map();
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
   * @param {Array} path to the wanted state property
   * @return {any} value
   */
  getState(path) {
    const args = Array.from(arguments);
    return args.length === 0 ? this.state.toObject()
      : this.state.getIn(concatPath(args, 0));
  }

  /**
   * Sets given state values.
   * @param {Array} path to the state value
   * @param {any} value
   */
  setState(path, value) {
    const args = Array.from(arguments);
    const length = args.length;
    if (length === 1) {
      this.state = this.state.merge(args[0]);
    } else if (length > 1) {
      const path = concatPath(args, 1);
      this.state = this.state.setIn(path, args[length - 1]);
    }
    this.emitChange();
  }

  /**
   * Merges given state values.
   * @param {Array} path to the state value
   * @param {any} value
   */
  mergeState(path, value) {
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
   * @param {Array} path to the state value
   */
  deleteState(path) {
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
   * @param {Array} path to the state value
   * @param {Function} callback to return new state value
   */
  updateState(path, callback) {
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

// - -------------------------------------------------------------------- - //
