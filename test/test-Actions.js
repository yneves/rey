// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const Actions = require('../src/Actions.js');
const Dispatcher = require('../src/Dispatcher.js');

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
    actions.extend({
      one: () => {},
      two: () => {}
    });
    assert.strictEqual(typeof actions.one, 'function');
    assert.strictEqual(typeof actions.two, 'function');
  });

  it('should create actions', () => {
  });

});

// - -------------------------------------------------------------------- - //
