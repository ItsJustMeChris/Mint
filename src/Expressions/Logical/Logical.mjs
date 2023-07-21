import Expression from 'Expressions/Expression/Expression.mjs';

class Logical extends Expression {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept() {
    return Expression.Visit(this);
  }
}

export default Logical;
