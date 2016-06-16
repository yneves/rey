// - -------------------------------------------------------------------- - //

'use strict';

const window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    title: 'title'
  },
  location: {
    href: 'about:blank'
  },
  history: {
    pushState: () => {},
    replaceState: () => {},
    back: () => {}
  }
};

module.exports = window;

// - -------------------------------------------------------------------- - //
