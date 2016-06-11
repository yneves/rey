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

const defaultActionHandler = () => {};

class Actions {

  constructor(dispatcher) {
    if (!(dispatcher instanceof Dispatcher)) {
      throw new Error('Dispatcher must be provided');
    }
    super();
    this.dispatcher = dispatcher;
  }

  getActions() {
    const actions = {};
    if (typeof this.actions === 'object') {
      for (let name in this.actions) {
        actions[name] = this.createAction(this.actions[name]);
      }
    }
    return actions;
  }

  createAction(code) {
    return () => {
      let payload = code.apply(this, arguments);
      if (typeof payload === 'function') {
        payload = payload((arg) => this.dispatcher.dispatch(arg));
      }
      if (typeof payload === 'string') {
        payload = { actionType: payload };
      }
      if (typeof payload !== 'undefined') {
        this.dispatcher.dispatch(payload);
      }
    };
  }

};

module.exports = Actions;

// - -------------------------------------------------------------------- - //
