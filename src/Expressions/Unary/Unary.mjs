import Expression from 'Expressions/Expression/Expression.mjs';

class Unary extends Expression {
  constructor(operator, right) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept() {
    return Expression.Visit(this);
  }
}

export default Unary;
