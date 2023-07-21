import Statement from 'Statements/Statement/Statement.mjs';

class Let extends Statement {
  constructor(name, initializer) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept() {
    return Statement.Visit(this);
  }
}

export default Let;
