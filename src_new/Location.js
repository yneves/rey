/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const CallbackRegistry = require('./CallbackRegistry.js');

/**
 * Simple wrapper for window.location and window.history.
 */
class Location {

  /**
   * Creates a new location wrapper instance.
   * @param {object} window object
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
   * @return {string} current url
   */
  get() {
    return this.window.location.href;
  }

  /**
   * Specifies current url.
   * @param {string} new url
   */
  set(href) {
    this.window.location.href = href;
  }

  /**
   * Adds an entry to history.
   * @param {string} url
   */
  push(href) {
    this.window.history.pushState({href}, this.window.document.title, href);
  }

  /**
   * Replaces current history entry.
   * @param {string} url
   */
  replace(href) {
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
   * @param {function} callback to be registered
   * @param {object} this variable for the callback
   * @param {error} trace error
   * @return {function} added callback
   */
  register(callback, context, trace) {
    return this.callbacks.add(callback, context, trace);
  }

  /**
   * Removes the given callback from the registry.
   * @param {function} callback to be removed
   * @return {boolean} true if the callback was found
   */
  unregister(callback) {
    return this.callbacks.remove(callback);
  }

};

module.exports = Location;

// - -------------------------------------------------------------------- - //
