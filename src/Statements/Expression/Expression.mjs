import Statement from 'Statements/Statement/Statement.mjs';

class Expression extends Statement {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept() {
    return Expression.visitExpressionStatement(this);
  }
}

export default Expression;
