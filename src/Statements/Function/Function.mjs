import Statement from 'Statements/Statement/Statement.mjs';

class Function extends Statement {
  constructor(name, params, body) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept() {
    return Statement.visitFunctionStatement(this);
  }
}

export default Function;
