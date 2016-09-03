// - -------------------------------------------------------------------- - //

'use strict';

var assert = require('assert');
var jsdom = require('mocha-jsdom');

describe('main', function() {

  jsdom();

  var Rey;

  before(function() {
    Rey = require('../src/main.js');
    window.location.href = 'http://localhost/';
  });

  it('should update state with value from promise', function(done) {
    var rey = new Rey();
    rey.run(['Promise', function(Promise) {
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
    }]);
  });

  it('should update state with reason from promise', function(done) {
    var rey = new Rey();
    rey.run(['Promise', function(Promise) {
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
    }]);
  });

  it('should attach stores', function(done) {
    var rey = new Rey();
    rey.store('ParentStore', [function() {
      return {
        attachStore: {
          child: 'ChildStore'
        }
      };
    }]);
    rey.store('ChildStore', [function() {
      return {};
    }]);
    rey.run(['ParentStore', 'ChildStore', function(ParentStore, ChildStore) {
      var changed = false;
      ParentStore.on('change', function() {
        changed = true;
      });
      ChildStore.setState({ one: 1 });
      assert.strictEqual(ParentStore.getState(['child', 'one']), 1);
      assert.ok(changed);
      done();
    }]);
  });

});

// - -------------------------------------------------------------------- - //
