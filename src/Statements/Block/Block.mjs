import Statement from 'Statements/Statement/Statement.mjs';

class Block extends Statement {
  constructor(statements) {
    super();
    this.statements = statements;
  }

  accept() {
    return Statement.visitBlockStatement(this);
  }
}

export default Block;
