class Expression {
  static parenthesize(name, ...expressions) {
    let output = `(${name}`;

    expressions.forEach((expression) => {
      output += ` ${expression.accept(expression)}`;
    });

    output += ')';
    return output;
  }

  static visitBinaryExpression(binary) {
    return Expression.parenthesize(binary.operator.lexeme, binary.left, binary.right);
  }

  static visitGroupingExpression(grouping) {
    return Expression.parenthesize('group', grouping.expression);
  }

  static visitLiteralExpression(literal) {
    if (literal.value == null) return 'null';
    return literal.value.toString();
  }

  static visitUnaryExpression(unary) {
    return Expression.parenthesize(unary.operator.lexeme, unary.right);
  }

  static visitVariableExpression(variable) {
    return variable.name.lexeme;
  }

  static visitAssignmentExpression(assignment) {
    return Expression.parenthesize(assignment.name.lexeme, assignment.value);
  }

  static visitLogicalExpression(logical) {
    return Expression.parenthesize(logical.operator.lexeme, logical.left, logical.right);
  }

  static visitCallExpression(call) {
    return Expression.parenthesize(call.callee, ...call.args);
  }

  static print(expression) {
    return expression.accept(expression);
  }
}

export default Expression;
