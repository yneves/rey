// - -------------------------------------------------------------------- - //

'use strict';

import assert from 'assert';
import CallbackRegistry from '../src/CallbackRegistry.js';

describe('CallbackRegistry', () => {

  it('should add callbacks', () => {
    const callbacks = new CallbackRegistry();
    assert.strictEqual(callbacks.count(), 0);
    callbacks.add(() => {});
    assert.strictEqual(callbacks.count(), 1);
    callbacks.add(() => {});
    callbacks.add(() => {});
    assert.strictEqual(callbacks.count(), 3);
    callbacks.clear();
    assert.strictEqual(callbacks.count(), 0);
  });

  it('should remove callbacks', () => {
    const callbacks = new CallbackRegistry();
    const code = () => {};
    assert.strictEqual(callbacks.count(), 0);
    callbacks.add(code);
    assert.strictEqual(callbacks.count(), 1);
    callbacks.remove(code);
    assert.strictEqual(callbacks.count(), 0);
  });

  it('should not add repeated callbacks', () => {
    const callbacks = new CallbackRegistry();
    const code = () => {};
    callbacks.add(code);
    assert.throws(() => {
      callbacks.add(code);
    }, /cannot add repeated callbacks/);
    assert.strictEqual(callbacks.count(), 1);
  });

  it('should run callbacks', () => {
    const callbacks = new CallbackRegistry();
    let calledCode = 0;
    let calledAnon = 0;
    const code = (n) => { calledCode += n };
    callbacks.add(code);
    callbacks.add((n) => { calledAnon += n });
    callbacks.run(1);
    assert.strictEqual(calledCode, 1);
    assert.strictEqual(calledCode, calledAnon);
    callbacks.run(2);
    assert.strictEqual(calledCode, 3);
    assert.strictEqual(calledCode, calledAnon);
    callbacks.run(3);
    assert.strictEqual(calledCode, 6);
    assert.strictEqual(calledCode, calledAnon);
  });

});

// - -------------------------------------------------------------------- - //
