/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import Dispatcher from './Dispatcher.js';
import StateHolder from './StateHolder.js';

/**
 * Class to manage action creators.
 */
export default class Actions {

  /**
   * Creates a new set of action creators.
   * @param {Dispatcher} dispatcher
   */
  constructor(dispatcher) {
    if (!(dispatcher instanceof Dispatcher)) {
      throw new Error('Dispatcher must be provided');
    }
    this.dispatcher = dispatcher;
  }

  /**
   * Extends the action creator with given actions.
   * @param {Object} actions
   */
  extend(actions) {
    const dispatch = this.dispatcher.dispatch.bind(this.dispatcher);
    Object.keys(actions).forEach(name => {
      const code = actions[name];
      this[name] = function() {
        let payload = code.apply(this, arguments);
        if (typeof payload === 'string') {
          payload = { actionType: payload };
        }
        if (typeof payload !== 'undefined') {
          dispatch(payload);
        }
      };
    });
  }

};

// - -------------------------------------------------------------------- - //
