/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const Promise = require('bluebird');
const Immutable = require('immutable');
const Utils = require('./Utils.js');

Promise.prototype.toState = function(stateHolder, propertyName) {

  if (!stateHolder || !Utils.isFunction(stateHolder.setState)) {
    throw new Error('state holder must have a setState method');
  }

  if (!Utils.isString(propertyName)) {
    throw new Error('state property name must be string');
  }

  const getState = () => {
    return Immutable.fromJS({
      value: this.isFulfilled() ? this.value() : undefined,
      reason: this.isRejected() ? this.reason() : undefined,
      isFulfilled: this.isFulfilled(),
      isRejected: this.isRejected(),
      isPending: this.isPending(),
      isCancelled: this.isCancelled()
    })
  };

  const updateState = (value) => {
    var newState = getState();
    if (Immutable.Map.isMap(stateHolder.state)) {
      stateHolder.setState(stateHolder.state.mergeIn([propertyName], newState));
    } else {
      var state = {};
      state[propertyName] = newState;
      stateHolder.setState(state);
    }
    return value;
  };

  updateState();

  return this.bind(stateHolder)
    .then(updateState)
    .catch(updateState)
    .finally(updateState);
};

module.exports = Promise;

// - -------------------------------------------------------------------- - //
