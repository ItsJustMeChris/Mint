import Expression from 'Expressions/Expression/Expression.mjs';

class Variable extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }

  accept() {
    return Expression.Visit(this);
  }
}

export default Variable;
