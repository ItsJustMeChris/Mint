import Statement from 'Statements/Statement/Statement.mjs';

class Break extends Statement {
  accept() {
    return Statement.visitBreakStatement(this);
  }
}

export default Break;
