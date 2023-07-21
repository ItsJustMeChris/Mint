class Expression {
  static parenthesize(name, ...expressions) {
    let output = `(${name}`;

    expressions.forEach((expression) => {
      output += ` ${expression.accept(expression)}`;
    });

    output += ')';
    return output;
  }

  static Visit(expression) {
    if (Expression.Overloads[`visit${expression.constructor.name}Expression`] != null) {
      return Expression.Overloads[`visit${expression.constructor.name}Expression`](expression);
    }

    return Expression.Visitors[`visit${expression.constructor.name}Expression`](expression);
  }

  static Overloads = {};

  static Visitors = {
    visitBinaryExpression(binary) {
      return Expression.parenthesize(binary.operator.lexeme, binary.left, binary.right);
    },
    visitGroupingExpression(grouping) {
      return Expression.parenthesize('group', grouping.expression);
    },
    visitLiteralExpression(literal) {
      if (literal.value == null) return 'null';
      return literal.value.toString();
    },
    visitUnaryExpression(unary) {
      return Expression.parenthesize(unary.operator.lexeme, unary.right);
    },
    visitVariableExpression(variable) {
      return variable.name.lexeme;
    },
    visitAssignmentExpression(assignment) {
      return Expression.parenthesize(assignment.name.lexeme, assignment.value);
    },
    visitLogicalExpression(logical) {
      return Expression.parenthesize(logical.operator.lexeme, logical.left, logical.right);
    },
    visitCallExpression(call) {
      return Expression.parenthesize(call.callee, ...call.args);
    },
  };

  static print(expression) {
    return expression.accept(expression);
  }
}

export default Expression;
