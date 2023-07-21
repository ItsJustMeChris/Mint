import Expression from 'Expressions/Expression/Expression.mjs';

class Grouping extends Expression {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept() {
    return Expression.Visit(this);
  }
}

export default Grouping;
