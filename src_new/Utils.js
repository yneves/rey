/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const getObjectType = (arg) => {
  const type = Object.prototype.toString.call(arg);
  return type.substr(8, type.length - 9);
};

module.exports = {

  isString(arg) {
    return typeof arg === 'string' || arg instanceof Number;
  },

  isNumber(arg) {
    return typeof arg === 'number' || arg instanceof Number;
  },

  isBoolean(arg) {
    return typeof arg === 'boolean';
  },

  isArray(arg) {
    return arg instanceof Array;
  },

  isObject(arg) {
    return getObjectType(arg) === 'Object';
  },

  isNull(arg) {
    return arg === null;
  },

  isDefined(arg) {
    return typeof arg === 'undefined';
  },

  isUndefined(arg) {
    return typeof arg === 'undefined';
  },

  isFunction(arg) {
    return typeof arg === 'function';
  },

  isError(arg) {
    return arg instanceof Error;
  },

  isDate(arg) {
    return arg instanceof Date;
  },

  isRegExp(arg) {
    return arg instanceof RegExp;
  },

  isArguments(arg) {
    return getObjectType(arg) === 'Arguments';
  }

};

// - -------------------------------------------------------------------- - //
