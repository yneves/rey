/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

const React = require('react');
const Immutable = require('immutable');
const Store = require('./Store.js');
const Router = require('./Router.js');
const Actions = require('./Actions.js');

const empty = [];

const Controller = {

  propTypes: {
    component: React.PropTypes.any,
    actions: React.PropTypes.oneOfType([
      React.PropTypes.instanceOf(Actions),
      React.PropTypes.arrayOf(React.PropTypes.instanceOf(Actions))
    ]),
    store: React.PropTypes.oneOfType([
      React.PropTypes.instanceOf(Store),
      React.PropTypes.arrayOf(React.PropTypes.instanceOf(Store))
    ]),
    router: React.PropTypes.instanceOf(Router)
  },

  getInitialState() {
    return this.mapProps();
  },

  routeDidChange() {
    this.setState(this.mapProps());
  },

  storeDidChange() {
    this.setState(this.mapProps());
  },

  componentWillMount() {
    this.storeHandlers = this.getStores().map((store) => store.register(this.storeDidChange));
    this.routerHandler = this.getRouters().map((router) => router.register(this.routeDidChange));
    this.getStores().map((store) => store.autoActivate());
  },

  componentWillUnmount() {
    this.getStores().map((store, index) => store.unregister(this.storeHandlers[index]));
    this.getRouters().map((store, index) => store.unregister(this.routerHandler[index]));
    this.getStores().map((store) => store.autoDeactivate());
  },

  getStores() {
    if (!this.props.store) {
      return empty;
    }
    return empty.concat(this.props.store);
  },

  getActions() {
    if (!this.props.actions) {
      return empty;
    }
    return empty.concat(this.props.actions);
  },

  getRouters() {
    if (!this.props.router) {
      return empty;
    }
    return empty.concat(this.props.router);
  },

  mapProps() {
    const props = {};

    this.getActions().forEach(actions => {
      for (let key in actions) {
        if (key !== 'extend' && key !== 'constructor') {
          props[key] = actions[key];
        }
      }
    });

    this.getStores().forEach(store => {
      const storeProps = store.toProps();
      for (let key in storeProps) {
        props[key] = storeProps[key];
      }
    });

    this.getRouters().forEach(router => {
      const routerProps = router.toProps();
      for (let key in routerProps) {
        props[key] = routerProps[key];
      }
    });

    for (let key in this.props) {
      if (!Controller.propTypes[key]) {
        props[key] = this.props[key];
      }
    }

    return props;
  },

  render() {
    return React.createElement(this.props.component, this.state);
  }
};

module.exports = Controller;

// - -------------------------------------------------------------------- - //
