class Statement {
  static parenthesize(name, ...statements) {
    let output = `(${name}`;

    statements.forEach((statement) => {
      output += ` ${Statement.accept(statement)}`;
    });

    output += ')';
    return output;
  }

  static Visit(statement) {
    if (Statement.Overloads[`visit${statement.constructor.name}Statement`] != null) {
      return Statement.Overloads[`visit${statement.constructor.name}Statement`](statement);
    }

    return Statement.Visitors[`visit${statement.constructor.name}Statement`](statement);
  }

  static Overloads = {};

  static Visitors = {
    visitExpressionStatement(expression) {
      return Statement.parenthesize('expression', expression.expression);
    },
    visitPrintStatement(print) {
      return Statement.parenthesize('print', print.expression);
    },
    visitLetStatement(letStatement) {
      return Statement.parenthesize('let', letStatement.name, letStatement.initializer);
    },
    visitBlockStatement(block) {
      return Statement.parenthesize('block', ...block.statements);
    },
    visitIfStatement(ifStatement) {
      return Statement.parenthesize(
        'if',
        ifStatement.condition,
        ifStatement.thenBranch,
        ifStatement.elseBranch,
      );
    },
    visitWhileStatement(whileStatement) {
      return Statement.parenthesize('while', whileStatement.condition, whileStatement.body);
    },
    visitBreakStatement() {
      return Statement.parenthesize('break');
    },
    visitFunctionStatement(functionStatement) {
      return Statement.parenthesize(
        'function',
        functionStatement.name,
        functionStatement.params,
        functionStatement.body,
      );
    },
    visitReturnStatement(returnStatement) {
      return Statement.parenthesize('return', returnStatement.value);
    },
  };

  static print(statement) {
    return Statement.accept(statement);
  }
}

export default Statement;
