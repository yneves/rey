// - -------------------------------------------------------------------- - //

"use strict";

var assert = require("assert");
var jsdom = require("mocha-jsdom");

describe("main", function() {
  
  jsdom();
  
  var Rey;
  
  before(function() {
    Rey = require("../src/main.js");
    window.location.href = "http://localhost/";
  });
  
  it("should load without errors", function() {
    var rey = new Rey();
    assert.ok(rey instanceof Rey);
  });
  
  it("should provide dependencies correctly", function(done) {
    var rey = new Rey();
    
    var A = { a: "a" };
    var B = { b: "b" };
    var C = { c: "c" };
    
    rey.factory("A", ["B", "C", function(b, c) {
      assert.strictEqual(b, B);
      assert.strictEqual(c, C);
      return A;
    }]);
    
    rey.factory("B", ["C", function(c) {
      assert.strictEqual(c, C);
      return B;
    }]);
    
    rey.factory("C", [function() {
      return C;
    }]);
    
    rey.run(["A", function(a) {
      assert.strictEqual(a, A);
      done();
    }]);
  });
  
  it("should run application", function(done) {
    
    var rey = new Rey();
    
    var parts = {};
    
    rey.store("TodoStore", ["Immutable", function(Immutable) {
      return {
        getInitialState: function() {
          return {
            tasks: Immutable.List()
          };
        },
        registerHandler: {
          TODO_ADD: function(payload) {
            parts.store = true;
            this.setState({
              tasks: this.state.get("tasks").push(payload.task)
            });
          }
        }
      };
    }]);
    
    rey.action("TodoAction", [function() {
      return {
        addTask: function(task) {
          parts.action = true;
          return {
            actionType: "TODO_ADD",
            task: task
          };
        }
      };
    }]);
    
    rey.controller("TodoController", ["TodoStore", "TodoView", function(TodoStore, TodoView) {
      
      return {
        store: TodoStore,
        component: TodoView,
        shouldComponentUpdate: function() {
          parts.controller = true;
          return true;
        }
      };
    }]);
    
    rey.component("TodoView", ["React", function(React) {
      return {
        propTypes: {
          tasks: React.PropTypes.List
        },
        renderTasks: function() {
          return this.props.tasks.map(function(task, index) {
            parts.componentTasks = true;
            return React.createElement("div", { key: index }, task);
          });
        },
        render: function() {
          parts.component = true;
          return React.createElement("div", {}, this.renderTasks());
        }
      }
    }]);
    
    rey.routes("TodoRoutes", ["TodoController", function(TodoController) {
      return {
        "/": {
          name: "root",
          controller: TodoController,
          container: document.createElement("div")
        }
      };
    }]);
    
    rey.load(["TodoRoutes"]);
    
    rey.run(["Router", "TodoAction", function(Router, TodoAction) {
      Router.start("/");
      TodoAction.addTask("test");
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
  
});

// - -------------------------------------------------------------------- - //
