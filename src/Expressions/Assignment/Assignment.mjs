import Expression from 'Expressions/Expression/Expression.mjs';

class Assignment extends Expression {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }

  accept() {
    return Expression.visitAssignmentExpression(this);
  }
}

export default Assignment;
