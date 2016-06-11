// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const DependencyRegistry = require('../src_new/DependencyRegistry.js');

describe('DependencyRegistry', () => {

  it('should resolve dependencies', () => {

    const One = {
      name: 'One',
      type: 'type',
      factory: () => ({one: 1})
    };

    const Two = {
      name: 'Two',
      type: 'type',
      factory: ['One', (one) => ({two: 2, one: one})]
    };

    const Three = {
      name: 'Three',
      type: 'type',
      factory: ['One', 'Two', (one, two) => ({three: 3, two: two, one: one})]
    };

    const deps = new DependencyRegistry();

    deps.add(One);
    deps.add(Two);
    deps.add(Three);

    assert.strictEqual(One.instance, undefined);
    assert.strictEqual(Two.instance, undefined);
    assert.strictEqual(Three.instance, undefined);

    assert.deepEqual(deps.get('One'), { one: 1 });
    assert.deepEqual(One.instance, { one: 1 });
    assert.strictEqual(Two.instance, undefined);

    assert.strictEqual(Three.instance, undefined);
    assert.deepEqual(deps.get('Two'), { one: One.instance, two: 2 });
    assert.deepEqual(Two.instance, { one: One.instance, two: 2 });

    assert.strictEqual(Three.instance, undefined);
    assert.deepEqual(deps.get('Three'), { one: One.instance, two: Two.instance, three: 3 });
    assert.deepEqual(Three.instance, { one: One.instance, two: Two.instance, three: 3 });

    deps.resolve(['Three', (three) => {
      assert.deepEqual(three, { one: One.instance, two: Two.instance, three: 3 });
    }]);
  });

  it('should throw exception for invalid dependencies', () => {
    const deps = new DependencyRegistry();
    assert.throws(() => deps.add(), /invalid dependency/);
    assert.throws(() => deps.add({}), /invalid dependency/);
  });

  it('should throw exception for unknown dependencies', () => {
    const deps = new DependencyRegistry();
    assert.throws(() => deps.get(), /unknown dependency/);
    assert.throws(() => deps.get('aaa'), /unknown dependency/);
  });

});

// - -------------------------------------------------------------------- - //
