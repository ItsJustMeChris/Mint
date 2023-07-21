import Statement from 'Statements/Statement/Statement.mjs';

class Print extends Statement {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept() {
    return Statement.Visit(this);
  }
}

export default Print;
