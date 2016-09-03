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
    if (this.window.addEventListener) {
      this.window.addEventListener('popstate', this.handler);
    }
  }

  /**
   * Stops monitoring history popstate event.
   */
  deactivate() {
    if (this.window.removeEventListener) {
      this.window.removeEventListener('popstate', this.handler);
    }
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
   * @param {String} url
   */
  set(href) {
    this.window.location.href = href;
  }

  /**
   * Adds an entry to history.
   * @param {String} url
   */
  push(href) {
    this.window.history.pushState({href}, this.window.document.title, href);
  }

  /**
   * Replaces current history entry.
   * @param {String} url
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
   * @param {Function} callback to be registered
   * @param {Object} this variable for the callback
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

};

module.exports = Location;

// - -------------------------------------------------------------------- - //
