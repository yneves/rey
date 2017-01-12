/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

import window from 'global/window';
import React from 'react';
import ReactDOM from 'react-dom';
import Rey from './Rey.js';
import Utils from './Utils';
import deepExtend from 'deep-extend';

const rey = new Rey();

rey.extend = deepExtend;

Object.keys(Utils).forEach(name => {
  rey[name] = Utils[name];
});

window.rey = rey;
window.React = React;
window.ReactDOM = ReactDOM;

export default rey;

// - -------------------------------------------------------------------- - //
