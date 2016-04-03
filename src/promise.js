/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');
var Immutable = require('immutable');

function toState (stateHolder, propertyName) {

  if (!factory.isObject(stateHolder) || !factory.isFunction(stateHolder.setState)) {
    throw new Error('state holder must have a setState method');
  }

  if (!factory.isString(propertyName)) {
    throw new Error('state property name must be string');
  }

  var promise = this;

  function getState () {
    return Immutable.fromJS({
      value: promise.isFulfilled() ? promise.value() : undefined,
      reason: promise.isRejected() ? promise.reason() : undefined,
      isFulfilled: promise.isFulfilled(),
      isRejected: promise.isRejected(),
      isPending: promise.isPending(),
      isCancelled: promise.isCancelled()
    })
  }

  function updateState (value) {
    var newState = getState();
    if (Immutable.Map.isMap(stateHolder.state)) {
      stateHolder.setState(stateHolder.state.mergeIn([propertyName], newState));
    } else {
      var state = {};
      state[propertyName] = newState;
      stateHolder.setState(state);
    }
    return value;
  }

  updateState();

  return promise.bind(stateHolder)
    .then(updateState)
    .catch(updateState)
    .finally(updateState);
};

module.exports = function (Promise) {
  Promise.prototype.toState = toState;
  return Promise;
};

// - -------------------------------------------------------------------- - //
