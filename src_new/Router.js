/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const URLParser = require('url');
const Location = require('./Location.js');
const Dispatcher = require('./Dispatcher.js');
const StateHolder = require('./StateHolder.js');

/**
 * Routing class.
 */
class Router extends StateHolder {

  /**
   * Creates a new Router instance
   * @param {Dispatcher} dispatcher instance to use
   * @param {Location} location instance to use
   */
  constructor(dispatcher, location) {
    if (!(dispatcher instanceof Dispatcher)) {
      throw new Error('Dispatcher must be provided');
    }
    if (!(location instanceof Location)) {
      throw new Error('Location must be provided');
    }
    super();
    this.location = location;
    this.dispatcher = dispatcher;
  }

  /**
   * Activates the store by hooking up dispatcher and location listeners.
   */
  activate() {

    this.locationHandler = this.location.register((href) => dispatch({
      actionType: 'ROUTER_CHANGE',
      href: href
    }));

    this.dispatcherHandler = this.dispatcher.register(payload => {
      switch (payload.actionType) {
        case 'ROUTER_START':
        case 'ROUTER_CHANGE':
        case 'ROUTER_NAVIGATE':
          this.handleNavigation(payload.href);
          break;
      }
    });

    this.dispatcher.dispatch({
      actionType: 'ROUTER_START'
    });
  }

  /**
   * Deactivates the store by removing any listeners from dispatcher and location.
   */
  deactivate() {
    if (this.locationHandler) {
      this.location.unregister(this.locationHandler);
    }
    if (this.dispatcherHandler) {
      this.dispatcher.unregister(this.dispatcherHandler);
    }
  }

  /**
   * Navigates to the given url.
   * @param {string} the url
   */
  navigate(href) {
    this.dispatcher.dispatch({
      actionType: 'ROUTER_NAVIGATE',
      href: href
    });
  }

  /**
   * Handle start, change and navigate actions.
   * @param {string} the url
   */
  handleNavigation(href = this.location.get()) {
    const route = this.matchRoute(href);
    if (route) {
      this.setState(route);
    }
  }

  /**
   * Finds the route for the given url.
   * @param {string} url to be matched
   * @return {object} consolidated route object
   */
  matchRoute(href) {
    const url = URLParser.parse(href, true);
    let route;

    // Exact match
    if (this.routes[url.pathname]) {
      route = this.prepareRoute(url, this.routes[url.pathname]);

    // Match params
    } else {
      for (let key in this.routes) {
        const params = key.match(/\{[\w]+\}/g);
        if (params) {
          const routeMatcher = new RegExp('^' + key.replace(/\{[\w]+\}/g, '([\\w0-9-]+)') + '$');
          const values = url.pathname ? url.pathname.match(routeMatcher) : undefined;
          if (values) {
            route = this.prepareRoute(url, this.routes[key], params, values);
          }
        }
        if (route) {
          break;
        }
      }
    }
    return route;
  }

  /**
   * Prepares a route object with given data.
   * @param {object} parsed url
   * @param {object} route properties
   * @param {array} route matched parameters
   * @param {array} value for each parameter
   * @return {object} consolidated route object
   */
  prepareRoute(url, props, params, values) {
    const route = {
      path: url.path,
      query: url.query,
      pathname: url.pathname,
      params: {}
    };
    for (let prop in props) {
      route[prop] = props[prop];
    }
    if (params && values) {
      for (let p = 0; p < params.length; p++) {
        const name = params[p].substr(1, params[p].length - 2);
        const value = values[p + 1];
        route.params[name] = value;
      }
    }
    return route;
  }

};

module.exports = Router;

// - -------------------------------------------------------------------- - //
