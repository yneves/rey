/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const deepExtend = require('deep-extend');
const Immutable = require('immutable');

const Utils = require('./Utils.js');

const toJS = (arg) => (arg.toJS ? arg.toJS() : arg);

/**
 * Class to create API wrappers.
 */
class API {

  /**
   * Creates a new API wrapper.
   */
  constructor(xhr, Promise) {
    this.xhr = xhr;
    this.Promise = Promise;
    this.defaults = {};
  }

  /**
   * Extends the API wrapper with new methods.
   * @param {Object} methods
   */
  extend(methods) {
    Object.keys(methods).forEach(name => {
      const method = methods[name];
      this[name] = Utils.isFunction(method) ? method.bind(this) :
        this.request.bind(this, method);
    });
  }

  /**
   * Combines multiple arguments into a single xhr options object.
   * @param {Array} args
   */
  prepare(givenArgs) {
    const defaults = Utils.isFunction(this.defaults) ? this.defaults() : this.defaults;
    const args = [{}, defaults];
    const argNames = [];
    givenArgs.forEach((arg) => {
      arg = toJS(arg);
      if (Utils.isString(arg)) {
        argNames.push(arg);
      } else if (Utils.isArray(arg)) {
        arg.forEach((subArg) => {
          subArg = toJS(subArg);
          if (Utils.isString(subArg)) {
            argNames.push(subArg);

          } else {
            if (argNames.length) {
              args.push({ [argNames.shift()]: subArg });
            } else {
              args.push(subArg);
            }
          }
        });
      } else {
        if (argNames.length) {
          args.push({ [argNames.shift()]: arg });
        } else {
          args.push(arg);
        }
      }
    });
    // console.log(args);
    return deepExtend.apply(undefined, args);
  }

  /**
   * Performs a request and returns a Promise.
   * @param {Array} args
   * @return {Promise} response
   */
  request() {
    const options = this.prepare(Array.from(arguments));
    const promise = new this.Promise((resolve, reject) => {
      this.xhr(options, (error, response) => {
        if (response.statusCode === 200 && response.body) {
          resolve(Immutable.fromJS(response.body));
        } else {
          reject(error);
        }
      });
    });
    return promise.bind(this);
  }
};

module.exports = API;

// - -------------------------------------------------------------------- - //
