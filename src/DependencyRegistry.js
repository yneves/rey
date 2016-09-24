/*!
**  rey -- React & Flux framework.
**  Copyright (c) 2016 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/rey>
*/
// - -------------------------------------------------------------------- - //

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
   * @param {Object} dependency - dependency to be registered
   */
  add(dependency) {
    const valid = typeof dependency === 'object' &&
      typeof dependency.name === 'string' &&
      (dependency.factory instanceof Array ||
        typeof dependency.factory === 'function');
    if (!valid) {
      throw new Error('invalid dependency');
    }
    this.dependencies[dependency.name] = dependency;
  }

  /**
   * Removes a dependency from the registry.
   * @param {String} dependency - dependency to be removed
   */
  remove(dependency) {
    if (typeof dependency === 'string') {
      delete this.dependencies[dependency];
    } else if (typeof dependency === 'object' && typeof dependency.name === 'string') {
      delete this.dependencies[dependency.name];
    }
  }

  /**
   * Returns the requested instance.
   * @param {String} name of the dependency
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
   * @param {Array} dependencies - list of dependencies, factory is last element
   */
  resolve(dependencies) {
    const hasTrace = dependencies[dependencies.length - 1] instanceof Error;
    const codeIndex = hasTrace ? dependencies.length - 2 : dependencies.length - 1;
    const trace = hasTrace ? dependencies[codeIndex + 1] : null;
    const code = dependencies[codeIndex];
    const args = [];
    for (let i = 0; i < codeIndex; i++) {
      args[i] = this.get(dependencies[i]);
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
