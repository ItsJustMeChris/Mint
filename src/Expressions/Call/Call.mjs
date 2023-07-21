import Expression from 'Expressions/Expression/Expression.mjs';

class Call extends Expression {
  constructor(callee, paren, args) {
    super();
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept() {
    return Expression.Visit(this);
  }
}

export default Call;
