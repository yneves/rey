// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const jsdom = require('mocha-jsdom');
const Promise = require('../src/Promise.js');

describe('Promise', () => {

  it('should update state with value from promise', (done) => {
    var stateHolder = {
      counter: 0,
      setState: function(state) {
        this.counter++
        if (this.counter === 1) {
          assert.strictEqual(state.prop.get('isFulfilled'), false);
          assert.strictEqual(state.prop.get('isPending'), true);
          assert.strictEqual(state.prop.get('isRejected'), false);
          assert.strictEqual(state.prop.get('isCancelled'), false);
          assert.strictEqual(state.prop.get('reason'), undefined);
          assert.strictEqual(state.prop.get('value'), undefined);
        } else {
          assert.strictEqual(state.prop.get('isFulfilled'), true);
          assert.strictEqual(state.prop.get('isPending'), false);
          assert.strictEqual(state.prop.get('isRejected'), false);
          assert.strictEqual(state.prop.get('isCancelled'), false);
          assert.strictEqual(state.prop.get('reason'), undefined);
          assert.strictEqual(state.prop.get('value'), 123);
        }
        if (this.counter === 3) {
          done();
        }
      }
    };
    new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(123);
      }, 1);
    }).toState(stateHolder, 'prop');
  });

  it('should update state with reason from promise', (done) => {
    var stateHolder = {
      counter: 0,
      setState: function(state) {
        this.counter++
        if (this.counter === 1) {
          assert.strictEqual(state.prop.get('isFulfilled'), false);
          assert.strictEqual(state.prop.get('isPending'), true);
          assert.strictEqual(state.prop.get('isRejected'), false);
          assert.strictEqual(state.prop.get('isCancelled'), false);
          assert.strictEqual(state.prop.get('reason'), undefined);
          assert.strictEqual(state.prop.get('value'), undefined);
        } else {
          assert.strictEqual(state.prop.get('isFulfilled'), false);
          assert.strictEqual(state.prop.get('isPending'), false);
          assert.strictEqual(state.prop.get('isRejected'), true);
          assert.strictEqual(state.prop.get('isCancelled'), false);
          assert.strictEqual(state.prop.get('reason'), 'reason');
          assert.strictEqual(state.prop.get('value'), undefined);
        }
        if (this.counter === 3) {
          done();
        }
      }
    };
    new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject('reason');
      }, 1);
    }).toState(stateHolder, 'prop');
  });

});

// - -------------------------------------------------------------------- - //
