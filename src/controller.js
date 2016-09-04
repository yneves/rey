/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const React = require('react');
const Immutable = require('Immutable');
const Store = require('./Store.js');
const Router = require('./Router.js');
const Actions = require('./Actions.js');

const Controller = React.createClass({

  displayName: 'Controller',

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

  componentWillMount() {
    const updateState = () => this.setState(this.mapProps());
    this.routerHandler = this.props.router.register(updateState);
    this.storeHandlers = this.getStores().map((store) => store.register(updateState));
  },

  componentWillUnmount() {
    this.props.router.unregister(this.routerHandler);
    this.getStores.map((store, index) => store.unregister(this.storeHandlers[index]));
  },

  getStores() {
    return [].concat(this.props.store);
  },

  getActions() {
    return [].concat(this.props.actions);
  },

  mapProps() {
    const props = {};

    if (this.props.router) {
      props.route = this.props.router.toProps();
    }

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

    return props;
  },

  render() {
    return React.createElement(this.props.component, this.state);
  }
});

module.exports = Controller;

// - -------------------------------------------------------------------- - //
