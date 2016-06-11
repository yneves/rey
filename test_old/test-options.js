// - -------------------------------------------------------------------- - //

'use strict';

var assert = require('assert');
var Immutable = require('immutable');
var prepareOptions = require('../src/options.js');

describe('options', function () {

  it('should merge options', function () {
    var options = prepareOptions({
      method: 'GET',
      responseType: 'json'
    }, [
      [{ params: { one: 1, two: 2 } }, 'params'],
      { three: 3, two: 22 },
      [{ data: { a: 1, b: 2 } }, 'data'],
      { a: 2, b: 1, c: 3 }
    ]);
    assert.deepEqual(options, {
      method: 'GET',
      responseType: 'json',
      params: { one: 1, two: 22, three: 3},
      data: { a: 2, b: 1, c: 3}
    });
  });

  it('should convert immutables', function () {
    var options = prepareOptions({
      method: 'GET',
      responseType: 'json'
    }, [
      [Immutable.fromJS({ params: { one: 1, two: 2 } }), 'params'],
      Immutable.fromJS({ three: 3, two: 22 }),
      [Immutable.fromJS({ data: { a: 1, b: 2 } }), 'data'],
      Immutable.fromJS({ a: 2, b: 1, c: 3 })
    ]);
    assert.deepEqual(options, {
      method: 'GET',
      responseType: 'json',
      params: { one: 1, two: 22, three: 3},
      data: { a: 2, b: 1, c: 3}
    });
  });

});

// - -------------------------------------------------------------------- - //
