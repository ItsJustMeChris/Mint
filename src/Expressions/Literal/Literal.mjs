import Expression from 'Expressions/Expression/Expression.mjs';

class Literal extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }

  accept() {
    return Expression.Visit(this);
  }
}

export default Literal;
