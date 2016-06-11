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

class Store extends StateHolder {

  constructor(dispatcher) {
    if (!(dispatcher instanceof Dispatcher)) {
      throw new Error('Dispatcher must be provided');
    }
    super();
    this.dispatcher = dispatcher;
  }

  activate() {
    const actionHandler = this.getActionHandler();
    if (actionHandler) {
      this.handler = this.dispatcher.register(actionHandler);
    }
  }

  deactivate() {
    if (this.handler) {
      this.dispatcher.unregister(this.handler);
      this.handler = undefined;
    }
  }

  getActionHandler() {
    return this.actionHandler;
  }

};

module.exports = Store;

// - -------------------------------------------------------------------- - //
