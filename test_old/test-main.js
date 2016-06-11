// - -------------------------------------------------------------------- - //

'use strict';

var assert = require('assert');
var jsdom = require('mocha-jsdom');

describe('main', function () {

  jsdom();

  var Rey;

  before(function () {
    Rey = require('../src/main.js');
    window.location.href = 'http://localhost/';
  });

  it('should load without errors', function () {
    var rey = new Rey();
    assert.ok(rey instanceof Rey);
  });

  it('should provide dependencies correctly', function (done) {
    var rey = new Rey();

    var A = { a: 'a' };
    var B = { b: 'b' };
    var C = { c: 'c' };

    rey.factory('A', ['B', 'C', function (b, c) {
      assert.strictEqual(b, B);
      assert.strictEqual(c, C);
      return A;
    }]);

    rey.factory('B', ['C', function (c) {
      assert.strictEqual(c, C);
      return B;
    }]);

    rey.factory('C', [function () {
      return C;
    }]);

    rey.run(['A', function (a) {
      assert.strictEqual(a, A);
      done();
    }]);
  });

  it('should run application', function (done) {

    var rey = new Rey();

    var parts = {};

    rey.store('TodoStore', ['Immutable', function (Immutable) {
      return {
        getInitialState: function () {
          return {
            tasks: Immutable.List()
          };
        },
        registerHandler: {
          TODO_ADD: function (payload) {
            parts.store = true;
            this.setState({
              tasks: this.state.get('tasks').push(payload.task)
            });
          }
        }
      };
    }]);

    rey.action('TodoAction', [function () {
      return {
        addTask: function (task) {
          parts.action = true;
          return {
            actionType: 'TODO_ADD',
            task: task
          };
        }
      };
    }]);

    rey.controller('TodoController', ['TodoStore', 'TodoView', function (TodoStore, TodoView) {

      return {
        store: TodoStore,
        component: TodoView,
        shouldComponentUpdate: function () {
          parts.controller = true;
          return true;
        }
      };
    }]);

    rey.component('TodoView', ['React', function (React) {
      return {
        propTypes: {
          tasks: React.PropTypes.List
        },
        renderTasks: function () {
          return this.props.tasks.map(function (task, index) {
            parts.componentTasks = true;
            return React.createElement('div', { key: index }, task);
          });
        },
        render: function () {
          parts.component = true;
          return React.createElement('div', {}, this.renderTasks());
        }
      }
    }]);

    rey.router('TodoRouter', ['TodoController', function (TodoController) {
      return {
        '/': {
          name: 'root',
          controller: TodoController,
          container: document.createElement('div')
        }
      };
    }]);

    rey.run(['TodoRouter', 'TodoAction', function (Router, TodoAction) {
      Router.start('/');
      TodoAction.addTask('test');
      assert.deepEqual(parts, {
        component: true,
        action: true,
        store: true,
        controller: true,
        componentTasks: true
      });
      done();
    }]);

  });

  it('should update state with value from promise', function (done) {
    var rey = new Rey();
    rey.run(['Promise', function (Promise) {
      var stateHolder = {
        counter: 0,
        setState: function (state) {
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
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(123);
        }, 1);
      }).toState(stateHolder, 'prop');
    }]);
  });

  it('should update state with reason from promise', function (done) {
    var rey = new Rey();
    rey.run(['Promise', function (Promise) {
      var stateHolder = {
        counter: 0,
        setState: function (state) {
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
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject('reason');
        }, 1);
      }).toState(stateHolder, 'prop');
    }]);
  });

  it('should prepare api requests properly', function (done) {

    var rey = new Rey();

    rey.api('api', [function () {
      return {
        testOne: {
          url: '/test/one',
          params: { one: 1 }
        },
        testTwo: {
          url: '/test/two',
          data: { two: 2 },
          method: 'POST'
        }
      };
    }]);

    rey.run(['api', function (api) {
      assert.strictEqual(typeof api.testOne, 'function');
      assert.strictEqual(typeof api.testTwo, 'function');
      done();
    }]);
  });

  it('should attach stores', function (done) {
    var rey = new Rey();
    rey.store('ParentStore', [function () {
      return {
        attachStore: {
          child: 'ChildStore'
        }
      };
    }]);
    rey.store('ChildStore', [function () {
      return {};
    }]);
    rey.run(['ParentStore', 'ChildStore', function (ParentStore, ChildStore) {
      var changed = false;
      ParentStore.on('change', function () {
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
