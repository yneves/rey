// - -------------------------------------------------------------------- - //

'use strict';

const assert = require('assert');
const jsdom = require('mocha-jsdom');
const Router = require('../src_new/Router.js');
const Location = require('../src_new/Location.js');
const Dispatcher = require('../src_new/Dispatcher.js');

describe('Router', () => {

  jsdom();

  let dispatcher;
  let location;

  before(() => {
    dispatcher = new Dispatcher();
    location = new Location(window);
  });


  it('should require location and dispatcher', () => {
    assert.throws(() => {
      const router = new Router();
    }, 'Dispatcher must be provided');
    assert.throws(() => {
      const router = new Router(dispatcher);
    }, 'Location must be provided');
    assert.doesNotThrow(() => {
      const router = new Router(dispatcher, location);
    });
  });

  it('should set and get routes', () => {
    const router = new Router(dispatcher, location);
    router.setRoutes({
      a: { name: 'a' },
      b: { name: 'b' }
    });
    assert.deepEqual(router.getRoutes(), {
      a: { name: 'a' },
      b: { name: 'b' }
    });
  });

  it('should handle navigation', (done) => {
    const router = new Router(dispatcher, location);
    router.setRoutes({
      '/': { name: 'index' },
      '/home': { name: 'home' },
      '/id/{id}': { name: 'id' }
    });
    location.set('/');
    let counter = 0;
    router.register(() => {
      if (counter === 0) {
        assert.strictEqual(router.state.get('name'), 'index');
        router.navigate('/home');
      } else if (counter === 1) {
        assert.strictEqual(router.state.get('name'), 'home');
        router.navigate('/id/3');
      } else if (counter === 2) {
        assert.strictEqual(router.state.get('name'), 'id');
        assert.strictEqual(router.state.getIn(['params', 'id']), '3');
        router.navigate('/id/3');
      }
      counter++;
      if (counter === 3) {
        done();
      }
    });
    router.activate();
  });

});

// - -------------------------------------------------------------------- - //
