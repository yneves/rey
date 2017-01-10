// - -------------------------------------------------------------------- - //

'use strict';

import assert from 'assert';
import jsdom from 'mocha-jsdom';
import Location from '../src/Location.js';

describe('Location', () => {

  jsdom({
    url: 'http://localhost/'
  });

  it('should require window object', () => {
    assert.throws(() => {
      const location = new Location();
    }, 'window must be provided');
  });

  it('should manipulate location href', () => {
    const location = new Location(window);
    assert.strictEqual(location.get(), 'http://localhost/');
    location.set('test');
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
