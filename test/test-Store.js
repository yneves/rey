// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const Store = require('../src_new/Store.js');
const Dispatcher = require('../src_new/Dispatcher.js');

describe('Store', () => {

  it('should require dispatcher', () => {
    assert.throws(() => {
      const store = new Store();
    }, 'Dispatcher must be provided');
    assert.doesNotThrow(() => {
      const dispatcher = new Dispatcher();
      const store = new Store(dispatcher);
    });
  });

  it('should handle dispatcher actions', (done) => {
    const dispatcher = new Dispatcher();
    const store = new Store(dispatcher);
    store.setActionHandler((action) => {
      assert.strictEqual(action.actionType, 'TEST');
      done();
    });
    store.activate();
    dispatcher.dispatch({
      actionType: 'TEST'
    });
  });

  it('should not handle dispatcher unless its activated', () => {
    const dispatcher = new Dispatcher();
    const store = new Store(dispatcher);
    store.setActionHandler((action) => {
      throw new Error('');
    });
    store.activate();
    store.deactivate();
    dispatcher.dispatch({
      actionType: 'TEST'
    });
  });

});

// - -------------------------------------------------------------------- - //