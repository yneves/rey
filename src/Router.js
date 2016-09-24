/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

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
   * @param {String} initialURI - initial url
   */
  activate(initialURI) {

    this.locationHandler = this.location.register((href) => {
      this.dispatcher.dispatch({
        actionType: 'ROUTER_CHANGE',
        href: href
      });
    });

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
      actionType: 'ROUTER_START',
      href: initialURI
    });
  }

  /**
   * Deactivates the store by removing any listeners from dispatcher and location.
   */
  deactivate() {
    if (this.locationHandler) {
      this.location.unregister(this.locationHandler);
      this.locationHandler = undefined;
    }
    if (this.dispatcherHandler) {
      this.dispatcher.unregister(this.dispatcherHandler);
      this.dispatcherHandler = undefined;
    }
  }

  /**
   * Navigates to the given url.
   * @param {String} href
   */
  navigate(href) {
    this.location.push(href);
    this.dispatcher.dispatch({
      actionType: 'ROUTER_NAVIGATE',
      href: href
    });
  }

  /**
   * Handle start, change and navigate actions.
   * @param {String} href
   */
  handleNavigation(href = this.location.get()) {
    const route = this.matchRoute(href);
    if (route) {
      this.setState(route);
    }
  }

  /**
   * Register the given routes.
   * @param {Object} routes
   */
  setRoutes(routes) {
    if (!this.routes) {
      this.routes = {};
    }
    for (let key in routes) {
      this.routes[key] = routes[key];
    }
  }

  /**
   * Returns the registered routes.
   * @return {Object} routes
   */
  getRoutes() {
    return this.routes || {};
  }

  /**
   * Finds the route for the given url.
   * @param {String} href
   * @return {Object} route
   */
  matchRoute(href) {
    const routes = this.getRoutes();
    const url = this.location.parse(href);
    let route;

    // Exact match
    if (routes[url.pathname]) {
      route = this.prepareRoute(url, this.routes[url.pathname]);

    // Match params
    } else {
      for (let key in routes) {
        const params = key.match(/\{[\w]+\}/g);
        if (params) {
          const routeMatcher = new RegExp('^' + key.replace(/\{[\w]+\}/g, '([\\w0-9-]+)') + '$');
          const values = url.pathname ? url.pathname.match(routeMatcher) : undefined;
          if (values) {
            route = this.prepareRoute(url, routes[key], params, values);
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
   * @private
   * @param {Object} href - parsed url
   * @param {Object} props - route properties
   * @param {Array} params - matched parameters
   * @param {Array} values - value for each parameter
   * @return {Object} consolidated route object
   */
  prepareRoute(href, props, params, values) {
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

  /**
   * Exports route state to props object.
   * @return {Object} props
   */
  toProps() {
    return this.state.withMutations((route) => {
      route.delete('controller');
      route.delete('container');
      return route;
    }).toObject();
  }

};

module.exports = Router;

// - -------------------------------------------------------------------- - //
