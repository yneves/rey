// - -------------------------------------------------------------------- - //

'use strict';

import assert from 'assert';
import Store from '../src/Store.js';
import Dispatcher from '../src/Dispatcher.js';

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
