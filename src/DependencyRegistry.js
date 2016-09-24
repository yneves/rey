/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

'use strict';

/**
 * Dependency registry.
 */
class DependencyRegistry {

  /**
   * Creates a new dependency registry.
   */
  constructor() {
    this.dependencies = {};
  }

  /**
   * Registers a new dependency.
   * @param {Object} dependency to be registered
   */
  add(dep) {
    const valid = typeof dep === 'object' &&
      typeof dep.name === 'string' &&
      (dep.factory instanceof Array ||
        typeof dep.factory === 'function');
    if (!valid) {
      throw new Error('invalid dependency');
    }
    this.dependencies[dep.name] = dep;
  }

  /**
   * Removes a dependency from the registry.
   * @param {string|object} dependency to be removed
   */
  remove(dep) {
    if (typeof dep === 'string') {
      delete this.dependencies[dep];
    } else if (typeof dep === 'object' && typeof dep.name === 'string') {
      delete this.dependencies[dep.name];
    }
  }

  /**
   * Returns the requested instance.
   * @param {string} name of the dependency
   * @return {Object} dependency instance
   */
  get(name) {
    const dep = this.dependencies[name];
    if (!dep) {
      throw new Error('unknown dependency: ' + name);
    }
    if (!dep.instance) {
      dep.instance = this.resolve([].concat(dep.factory));
    }
    return dep.instance;
  }

  /**
   * Resolves dependencies for the given factory.
   * @param {array} list of dependencies, factory is last element
   */
  resolve(deps) {
    const hasTrace = deps[deps.length - 1] instanceof Error;
    const codeIndex = hasTrace ? deps.length - 2 : deps.length - 1;
    const trace = hasTrace ? deps[codeIndex + 1] : null;
    const code = deps[codeIndex];
    const args = [];
    for (let i = 0; i < codeIndex; i++) {
      args[i] = this.get(deps[i]);
    }
    try {
      return code.apply(this, args);
    } catch (error) {
      console.error(error, trace);
    }
  }

};

module.exports = DependencyRegistry;

// - -------------------------------------------------------------------- - //
