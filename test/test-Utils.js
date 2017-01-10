// - -------------------------------------------------------------------- - //

'use strict';

import assert from 'assert';
import Utils from '../src/Utils.js';

describe('Utils', () => {

  it('should check types correct', function() {
    assert.strictEqual(Utils.isArray([]), true);
    assert.strictEqual(Utils.isObject({}), true);
    assert.strictEqual(Utils.isObject([]), false);
    assert.strictEqual(Utils.isArguments([]), false);
    assert.strictEqual(Utils.isArguments(arguments), true);
  });

});

// - -------------------------------------------------------------------- - //
