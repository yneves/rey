/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import deepExtend from 'deep-extend';
import Immutable from 'immutable';

import Utils from './Utils.js';

const toJS = (arg) => (arg.toJS ? arg.toJS() : arg);

/**
 * Class to create API wrappers.
 */
export default class API {

  /**
   * Creates a new API wrapper.
   * @param {Function} xhr
   * @param {Function} Promise
   * @param {Location} location
   */
  constructor(xhr, Promise, location) {
    this.xhr = xhr;
    this.Promise = Promise;
    this.location = location;
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
   * @param {Array} givenArgs
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

    const options = deepExtend.apply(undefined, args);

    if (options.query) {
      const parsed = Utils.isString(options.url) ?
        this.location.parse(options.url) : Utils.isObject(options.url) ?
        options.url : {};
      parsed.query = options.query;
      delete options.query;
      options.url = this.location.format(parsed);
    }

    if (Utils.isObject(options.body)) {
      options.json = options.body;
      delete options.body;
    }

    return options;
  }

  /**
   * Performs a request and returns a Promise.
   * @param {Array} args
   * @return {Promise} response
   */
  request(args) {
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

// - -------------------------------------------------------------------- - //
