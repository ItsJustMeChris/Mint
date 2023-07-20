class Statement {
  static parenthesize(name, ...statements) {
    let output = `(${name}`;

    statements.forEach((statement) => {
      output += ` ${Statement.accept(statement)}`;
    });

    output += ')';
    return output;
  }

  static visitExpressionStatement(expression) {
    return Statement.parenthesize('expression', expression.expression);
  }

  static visitPrintStatement(print) {
    return Statement.parenthesize('print', print.expression);
  }

  static visitLetStatement(letStatement) {
    return Statement.parenthesize('let', letStatement.name, letStatement.initializer);
  }

  static visitBlockStatement(block) {
    return Statement.parenthesize('block', ...block.statements);
  }

  static visitIfStatement(ifStatement) {
    return Statement.parenthesize(
      'if',
      ifStatement.condition,
      ifStatement.thenBranch,
      ifStatement.elseBranch,
    );
  }

  static visitWhileStatement(whileStatement) {
    return Statement.parenthesize('while', whileStatement.condition, whileStatement.body);
  }

  static visitBreakStatement() {
    return Statement.parenthesize('break');
  }

  static print(statement) {
    return Statement.accept(statement);
  }
}

export default Statement;
