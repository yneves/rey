// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const jsdom = require('mocha-jsdom');
const Location = require('../src/Location.js');

describe('Location', () => {

  jsdom();

  it('should require window object', () => {
    assert.throws(() => {
      const location = new Location();
    }, 'window must be provided');
  });

  it('should manipulate location href', () => {
    const location = new Location(window);
    assert.strictEqual(location.get(), 'about:blank');
    location.set('test');
    assert.strictEqual(location.get(), 'test');
  });

  it('should manipulate history state', () => {
    const location = new Location(window);
    location.push('url');
    location.replace('url');
    location.back();
  });

  it('should activate and deactivate', () => {
    const location = new Location(window);
    location.activate();
    location.deactivate();
  });

  it('should register and unregister', () => {
    const location = new Location(window);
    const callback = () => {};
    const handler = location.register(callback);
    location.unregister(handler);
  });

});

// - -------------------------------------------------------------------- - //
