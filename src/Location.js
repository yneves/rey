/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import URLParser from 'url';
import Utils from './Utils.js';
import CallbackRegistry from './CallbackRegistry.js';

/**
 * Simple wrapper for window.location and window.history.
 */
export default class Location {

  /**
   * Creates a new location wrapper instance.
   * @param {Object} window
   */
  constructor(window) {
    if (!window) {
      throw new Error('window must be provided');
    }
    this.window = window;
    this.callbacks = new CallbackRegistry();
  }

  /**
   * Starts monitoring history popstate event.
   */
  activate() {
    this.handler = (event) => {
      if (event && event.state) {
        this.callbacks.run(event.state.href);
      }
    };
    this.window.addEventListener('popstate', this.handler);
  }

  /**
   * Stops monitoring history popstate event.
   */
  deactivate() {
    this.window.removeEventListener('popstate', this.handler);
  }

  /**
   * Returns current url.
   * @return {String} url
   */
  get() {
    return this.window.location.href;
  }

  /**
   * Specifies current url.
   * @param {String} href
   */
  set(href) {
    this.window.location.href = href;
  }

  /**
   * Adds an entry to history.
   * @param {String} href
   */
  push(href) {
    if (Utils.isObject(href)) {
      href = this.format(href);
    }
    this.window.history.pushState({href}, this.window.document.title, href);
  }

  /**
   * Replaces current history entry.
   * @param {String} href
   */
  replace(href) {
    if (Utils.isObject(href)) {
      href = this.format(href);
    }
    this.window.history.replaceState({href}, this.window.document.title, href);
  }

  /**
   * Navigates back in history.
   */
  back() {
    this.window.history.back();
  }

  /**
   * Registers a callback to be executed when history changes.
   * @param {Function} callback callback to be registered
   * @param {Object} context this variable for the callback
   * @param {Error} trace error
   * @return {Function} callback added callback
   */
  register(callback, context, trace) {
    return this.callbacks.add(callback, context, trace);
  }

  /**
   * Removes the given callback from the registry.
   * @param {Function} callback to be removed
   * @return {Boolean} unregistered true if the callback was found
   */
  unregister(callback) {
    return this.callbacks.remove(callback);
  }

  /**
   * Parses the given url.
   * @param {String} href
   * @return {Object} parsed
   */
  parse(href) {
    if (Utils.isObject(href)) {
      href = this.format(href);
    }
    return URLParser.parse(href, true);
  }

  /**
   * Formats given properties into an url.
   * @param {Object} properties
   * @return {String} url
   */
  format(properties) {
    return URLParser.format(properties);
  }

};

// - -------------------------------------------------------------------- - //
