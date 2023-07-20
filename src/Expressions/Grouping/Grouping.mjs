import Expression from 'Expressions/Expression/Expression.mjs';

class Grouping extends Expression {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept() {
    return Expression.visitGroupingExpression(this);
  }
}

export default Grouping;
