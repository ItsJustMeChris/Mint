import Expression from 'Expressions/Expression/Expression.mjs';

class Literal extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }

  accept() {
    return Expression.visitLiteralExpression(this);
  }
}

export default Literal;
