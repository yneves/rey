// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const Immutable = require('immutable');
const xhr = require('xhr');
const Promise = require('bluebird');
const API = require('../src/API.js');

describe('API', () => {

  it('should merge options', () => {
    const api = new API(xhr, Promise);
    const options = api.prepare([{
      method: 'GET',
      responseType: 'json'
    },
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

  it('should convert immutables', () => {
    return;
    const api = new API(xhr, Promise);
    const options = api.prepare([{
      method: 'GET',
      responseType: 'json'
    },
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
