/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const Dispatcher = require('./Dispatcher.js');
const StateHolder = require('./StateHolder.js');

/**
 * Class to manage action creators.
 */
class Actions {

  /**
   * Creates a new set of action creators.
   * @param {Dispatcher} dispatcher to be used
   */
  constructor(dispatcher) {
    if (!(dispatcher instanceof Dispatcher)) {
      throw new Error('Dispatcher must be provided');
    }
    this.dispatcher = dispatcher;
  }

  /**
   * Sets the registered actions.
   * @param {object} a map of action name as key and function as value
   */
  setActions(actions) {
    this.actions = actions;
  }

  /**
   * Returns the registered actions.
   * @return {object} a map of action name as key and function as value
   */
  getActions() {
    return this.actions || {};
  }

  /**
   * Creates the actions to be used by the container.
   * @return {object} a map of action name as key and function as value
   */
  createActions() {

    const dispatch = (arg) => this.dispatcher.dispatch(arg);

    const getState = Array.from(arguments).map((stateHolder) => {
      if (!(stateHolder instanceof StateHolder)) {
        throw new Error('expected a StateHolder instance');
      }
      return (path) => stateHolder.getState(path);
    });

    const args = [].concat(dispatch, getState);

    const createAction = (code) => () => {
      let payload = code.apply(this, arguments);
      if (typeof payload === 'function') {
        payload = payload.apply(undefined, args);
      }
      if (typeof payload === 'string') {
        payload = { actionType: payload };
      }
      if (typeof payload !== 'undefined') {
        this.dispatcher.dispatch(payload);
      }
    };

    const actions = {};
    for (let name in actions) {
      actions[name] = createAction(actions[name]);
    }
    return actions;
  }

};

module.exports = Actions;

// - -------------------------------------------------------------------- - //
