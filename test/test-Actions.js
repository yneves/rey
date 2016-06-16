// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const Actions = require('../src_new/Actions.js');
const Dispatcher = require('../src_new/Dispatcher.js');

describe('Actions', () => {

  it('should require dispatcher', () => {
    assert.throws(() => {
      const actions = new Actions();
    }, 'Dispatcher must be provided');
    assert.doesNotThrow(() => {
      const dispatcher = new Dispatcher();
      const actions = new Actions(dispatcher);
    });
  });

  it('should set and get actions', () => {
    const dispatcher = new Dispatcher();
    const actions = new Actions(dispatcher);
    actions.setActions({
      one: () => {},
      two: () => {}
    });
    assert.strictEqual(typeof actions.getActions().one, 'function');
    assert.strictEqual(typeof actions.getActions().two, 'function');
    assert.strictEqual(Object.keys(actions.getActions()).length, 2);
  });

  it('should create actions', () => {
  });

});

// - -------------------------------------------------------------------- - //
