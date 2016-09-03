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

/**
 * Class to represent a Store.
 */
class Store extends StateHolder {

  /**
   * Creates a new store instance.
   * @param {Dispatcher} dispatcher
   */
  constructor(dispatcher) {
    if (!(dispatcher instanceof Dispatcher)) {
      throw new Error('Dispatcher must be provided');
    }
    super();
    this.dispatcher = dispatcher;
  }

  /**
   * Activates the store by registering to handle actions.
   */
  activate() {
    this.handler = this.dispatcher.register((action) => {
      const actionHandler = this.getActionHandler();
      if (actionHandler) {
        actionHandler(action);
      }
    });
  }

  /**
   * Activates the store by deregistering the action handler.
   */
  deactivate() {
    if (this.handler) {
      this.dispatcher.unregister(this.handler);
      this.handler = undefined;
    }
  }

  /**
   * Sets the action handler.
   * @param {Function} handler
   */
  setActionHandler(handler) {
    this.actionHandler = handler;
  }

  /**
   * Gets the action handler.
   * @return {Function} handler
   */
  getActionHandler() {
    return this.actionHandler;
  }

};

module.exports = Store;

// - -------------------------------------------------------------------- - //
