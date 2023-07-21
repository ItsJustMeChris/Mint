import Statement from 'Statements/Statement/Statement.mjs';

class Break extends Statement {
  accept() {
    return Statement.Visit(this);
  }
}

export default Break;
