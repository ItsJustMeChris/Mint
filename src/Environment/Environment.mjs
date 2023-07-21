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
}

export default Environment;
