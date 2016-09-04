// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const jsdom = require('mocha-jsdom');

describe('Rey', () => {

  jsdom({
    url: 'http://localhost/'
  });

  let Rey;
  before(() => {
    Rey = require('../src_new/Rey.js');
  });

  it('constructor', () => {
    const rey = new Rey();
    assert.ok(rey instanceof Rey);
  });

  it('should provide dependencies correctly', (done) => {
    const rey = new Rey();

    var A = { a: 'a' };
    var B = { b: 'b' };
    var C = { c: 'c' };

    rey.factory('A', ['B', 'C', (b, c) => {
      assert.strictEqual(b, B);
      assert.strictEqual(c, C);
      return A;
    }]);

    rey.factory('B', ['C', (c) => {
      assert.strictEqual(c, C);
      return B;
    }]);

    rey.factory('C', [() => {
      return C;
    }]);

    rey.run(['A', (a) => {
      assert.strictEqual(a, A);
      done();
    }]);
  });

  it('should prepare api requests properly', (done) => {

    var rey = new Rey();

    rey.api('api', [() => {
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

    rey.run(['api', (api) => {
      assert.strictEqual(typeof api.testOne, 'function');
      assert.strictEqual(typeof api.testTwo, 'function');
      done();
    }]);
  });

  it('should run application', (done) => {

    const rey = new Rey();

    const parts = {};

    rey.store('TodoStore', ['Immutable', (Immutable) => {
      return {
        getInitialState: () => {
          return {
            tasks: Immutable.List()
          };
        },
        registerHandler: {
          TODO_ADD: (store, payload) => {
            parts.store = true;
            store.setState({
              tasks: store.state.get('tasks').push(payload.task)
            });
          }
        }
      };
    }]);

    rey.actions('TodoAction', [() => {
      return {
        addTask: (task) => {
          parts.action = true;
          return {
            actionType: 'TODO_ADD',
            task: task
          };
        }
      };
    }]);

    rey.controller('TodoController', ['TodoStore', 'TodoView', (TodoStore, TodoView) => {
      return {
        store: TodoStore,
        component: TodoView
      };
    }]);

    rey.component('TodoView', ['React', (React) => {
      return {
        propTypes: {
          tasks: React.PropTypes.List
        },
        renderTasks: function() {
          return this.props.tasks.map((task, index) => {
            parts.componentTasks = true;
            return React.createElement('div', { key: index }, task);
          });
        },
        render: function() {
          parts.component = true;
          return React.createElement('div', {}, this.renderTasks());
        }
      }
    }]);

    rey.router('TodoRouter', ['TodoController', 'document', (TodoController, document) => {
      return {
        '/': {
          name: 'root',
          controller: TodoController,
          container: document.createElement('div')
        }
      };
    }]);

    rey.run(['TodoRouter', 'TodoAction', 'Location', 'TodoStore',
      (Router, TodoAction, Location, TodoStore) => {
        TodoStore.activate();
        Location.activate();
        Router.activate();
        TodoAction.addTask('test');
        assert.deepEqual(parts, {
          component: true,
          action: true,
          store: true,
          componentTasks: true
        });
        done();
      }]);

  });


});

// - -------------------------------------------------------------------- - //
