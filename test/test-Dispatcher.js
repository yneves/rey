// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const Dispatcher = require('../src/Dispatcher.js');

describe('Dispatcher', () => {

  it('should dispatch actions', () => {
    const dispatcher = new Dispatcher();
    let counter = 0;
    dispatcher.register((payload) => { counter += payload.number });
    dispatcher.dispatch({ number: 1 });
    assert.strictEqual(counter, 1);
    dispatcher.dispatch({ number: 3 });
    assert.strictEqual(counter, 4);
  });

  it('should unregister callbacks', () => {
    const dispatcher = new Dispatcher();
    let counter = 0;
    const handler = dispatcher.register((payload) => { counter += payload.number });
    dispatcher.dispatch({ number: 1 });
    assert.strictEqual(counter, 1);
    dispatcher.unregister(handler);
    dispatcher.dispatch({ number: 3 });
    assert.strictEqual(counter, 1);
  });

  it('should queue actions when dispatched during actions', () => {
    const dispatcher = new Dispatcher();
    let called = 0;
    let counter = 0;
    dispatcher.register((payload) => {
      counter += payload.number;
      called++;
      if (counter < 10) {
        dispatcher.dispatch(payload);
      }
    });
    dispatcher.dispatch({ number: 2 });
    assert.strictEqual(called, 5);
    assert.strictEqual(counter, 10);
  });

  it('should call actions specific handler', () => {
    const dispatcher = new Dispatcher();
    let counter = 0;
    dispatcher.register({
      ADD: (payload) => { counter += payload.number },
      SUBTRACT: (payload) => { counter -= payload.number }
    });
    dispatcher.dispatch({ actionType: 'ADD', number: 20 });
    assert.strictEqual(counter, 20);
    dispatcher.dispatch({ actionType: 'SUBTRACT' , number: 7 });
    assert.strictEqual(counter, 13);
  });

});

// - -------------------------------------------------------------------- - //
