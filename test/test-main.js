// - -------------------------------------------------------------------- - //

"use strict";

var assert = require("assert");
var jsdom = require("mocha-jsdom");

describe("main", function() {
  
  jsdom();
  
  it("should load without errors", function(done) {
    
    var rey = require("../");
    
    rey.routes("AppRoutes", [function() {
      return {
        "/home": function() {}
      };
    }]);
    
    rey.load(["AppRoutes"]);
    
    rey.run(["Router", function(Router) {
      assert.ok(rey.isRouter(Router));
      done();
    }]);

  });
  
});

// - -------------------------------------------------------------------- - //
