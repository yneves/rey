/*!
**  rey -- Framework based on React and Flux that looks like AngularJS.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const React = require('react');
const Store = require('./Store.js');
const Router = require('./Router.js');
const Actions = require('./Actions.js');

class Container extends React.Component {

  static propTypes = {
    component: React.PropTypes.func.isRequired,
    actions: React.PropTypes.oneOfType([
      React.PropTypes.instanceOf(Actions),
      React.PropTypes.arrayOf(React.PropTypes.instanceOf(Actions))
    ]),
    store: React.PropTypes.oneOfType([
      React.PropTypes.instanceOf(Store),
      React.PropTypes.arrayOf(React.PropTypes.instanceOf(Store))
    ]),
    router: React.PropTypes.instanceOf(Router)
  }

  componentWillMount() {
    const updateState = () => this.setState(this.mapProps());
    this.routerHandler = this.props.router.register(updateState);
    this.storeHandlers = this.getStores().map((store) => store.register(updateState));
  }

  componentWillUnmount() {
    this.props.router.unregister(this.routerHandler);
    this.getStores.map((store, index) => store.unregister(this.storeHandlers[index]));
  }

  getStores() {
    return [].concat(this.props.store);
  }

  getActions() {
    return [].concat(this.props.actions);
  }

  mapRouteToProps(router) {
    return router.state.toObject();
  }

  mapStateToProps() {
    const props = Immutable.Map();
    Array.from(arguments).forEach(arg => {
      props = props.merge(arg);
    });
    return props.toObject();
  }

  mapStoreToProps() {
    const states = Array.from(arguments).map(store => store.state);
    return this.mapStateToProps.apply(this, states);
  }

  mapActionsToProps() {
    const props = Immutable.Map();
    const router = this.props.router;
    const stores = this.getStores();
    Array.from(arguments).map(arg => {
      props = props.merge(arg.createActions(stores, router));
    });
    return props.toObject();
  }

  mapProps() {
    const props = Immutable.Map();
    const router = this.props.router;
    const stores = this.getStores();
    const actions = this.getActions();
    props = props.merge(this.mapRouteToProps(router));
    props = props.merge(this.mapStoreToProps(stores));
    props = props.merge(this.mapActionsToProps(actions));
    return props.toObject();
  }

  render() {
    return React.createElement(this.props.component, this.state);
  }
};

module.exports = Container;

// - -------------------------------------------------------------------- - //
