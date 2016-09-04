// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const StateHolder = require('../src/StateHolder.js');

describe('StateHolder', () => {

  it('should use initial state', () => {
    class MyStateHolder extends StateHolder {
      getInitialState() {
        return {
          one: 1,
          two: 2
        };
      }
    };
    const stateHolder = new MyStateHolder();
    assert.deepEqual(stateHolder.state.toJS(), {
      one: 1,
      two: 2
    });
  });

  it('should trigger change callbacks', () => {
    const stateHolder = new StateHolder();
    let called = 0;
    const onChange = () => { called++ };
    stateHolder.register(onChange);
    stateHolder.setState('one', 123);
    assert.strictEqual(called, 1);
    stateHolder.unregister(onChange);
    stateHolder.setState('one', 321);
    assert.strictEqual(called, 1);
  });

  it('should set state with path', () => {
    const stateHolder = new StateHolder();
    stateHolder.setState(['one', 'two', 'three'], 123);
    assert.deepEqual(stateHolder.state.toJS(), {
      one: {
        two: {
          three: 123
        }
      }
    });
    stateHolder.setState(['one', 'two'], {
      four: 4,
      five: 5
    });
    assert.deepEqual(stateHolder.state.toJS(), {
      one: {
        two: {
          four: 4,
          five: 5
        }
      }
    });
    assert.strictEqual(stateHolder.getState(['one', 'two', 'three']), undefined);
  });

  it('should merge state with path', () => {
    const stateHolder = new StateHolder();
    stateHolder.setState(['one'], ['two', 'three'], 123);
    stateHolder.mergeState(['one'], 'two', {
      four: 4,
      five: 5
    });
    assert.deepEqual(stateHolder.state.toJS(), {
      one: {
        two: {
          three: 123,
          four: 4,
          five: 5
        }
      }
    });
    assert.strictEqual(stateHolder.getState(['one'], ['two', 'three']), 123);
    assert.strictEqual(stateHolder.getState(['one', 'two', 'three']), 123);
  });

});

// - -------------------------------------------------------------------- - //
