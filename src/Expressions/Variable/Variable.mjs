import Expression from 'Expressions/Expression/Expression.mjs';

class Variable extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }

  accept() {
    return Expression.visitVariableExpression(this);
  }
}

export default Variable;
