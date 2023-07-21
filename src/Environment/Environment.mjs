class Environment {
  constructor(enclosing = null) {
    this.values = {};
    this.enclosing = enclosing;
  }

  define(name, value) {
    if (this.values[name] !== undefined) {
      throw new Error(`Cannot define defined variable (${name}).`);
    }

    this.values[name] = value;
  }

  get(name) {
    if (this.values[name] === undefined) {
      if (this.enclosing !== null) return this.enclosing.get(name);
      throw new Error(`Undefined variable (${name}).`);
    }

    return this.values[name];
  }

  ancestor(distance) {
    let environment = this;
    for (let i = 0; i < distance; i += 1) {
      environment = environment.enclosing;
    }

    return environment;
  }

  getAt(distance, name) {
    return this.ancestor(distance).values[name];
  }

  assign(name, value) {
    if (this.values[name] === undefined) {
      if (this.enclosing !== null) {
        this.enclosing.assign(name, value);
        return;
      }
      throw new Error(`Undefined variable (${name}).`);
    }

    this.values[name] = value;
  }

  assignAt(distance, name, value) {
    this.ancestor(distance).values[name] = value;
  }
}

export default Environment;
