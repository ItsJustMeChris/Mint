import Statement from 'Statements/Statement/Statement.mjs';

class If extends Statement {
  constructor(condition, thenBranch, elseBranch) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept() {
    return Statement.Visit(this);
  }
}

export default If;
