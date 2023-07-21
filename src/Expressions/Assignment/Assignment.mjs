import Expression from 'Expressions/Expression/Expression.mjs';

class Assignment extends Expression {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }

  accept() {
    return Expression.Visit(this);
  }
}

export default Assignment;
