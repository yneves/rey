/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

const window = require('global/window');
const React = require('react');
const ReactDOM = require('react-dom');

window.React = React;
window.ReactDOM = ReactDOM;

const Rey = require('./src/Rey.js');
const Utils = require('./src/Utils');
const xtend = require('xtend');
const deepExtend = require('deep-extend');
const rey = new Rey();

module.exports = xtend(rey, Utils, {extend: deepExtend});

// - -------------------------------------------------------------------- - //
