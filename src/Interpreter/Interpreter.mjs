import { Expression } from 'Expressions/Expressions.mjs';
import { Statement } from 'Statements/Statements.mjs';
import Token from 'Token/Token.mjs';
import Environment from 'Environment/Environment.mjs';
import Callable from 'Callable/Callable.mjs';
import { ReturnException } from 'Exceptions/Exceptions.mjs';

class Interpreter {
  Mint = null;

  static globals = new Environment();

  static Environment = Interpreter.globals;

  static LoopDepth = 0;

  static Bind(Mint) {
    Interpreter.Mint = Mint;

    Interpreter.globals.define(
      'now',
      Callable.FromNative(() => Date.now()),
    );
  }

  static {
    Expression.visitBinaryExpression = Interpreter.visitBinaryExpression;
    Expression.visitGroupingExpression = Interpreter.visitGroupingExpression;
    Expression.visitLiteralExpression = Interpreter.visitLiteralExpression;
    Expression.visitUnaryExpression = Interpreter.visitUnaryExpression;
    Expression.visitVariableExpression = Interpreter.visitVariableExpression;
    Expression.visitAssignmentExpression = Interpreter.visitAssignmentExpression;
    Expression.visitLogicalExpression = Interpreter.visitLogicalExpression;
    Expression.visitCallExpression = Interpreter.visitCallExpression;

    Statement.visitExpressionStatement = Interpreter.visitExpressionStatement;
    Statement.visitPrintStatement = Interpreter.visitPrintStatement;
    Statement.visitLetStatement = Interpreter.visitLetStatement;
    Statement.visitBlockStatement = Interpreter.visitBlockStatement;
    Statement.visitIfStatement = Interpreter.visitIfStatement;
    Statement.visitWhileStatement = Interpreter.visitWhileStatement;
    Statement.visitBreakStatement = Interpreter.visitBreakStatement;
    Statement.visitFunctionStatement = Interpreter.visitFunctionStatement;
    Statement.visitReturnStatement = Interpreter.visitReturnStatement;
  }

  static stringify(object) {
    if (object === null) return 'null';
    if (typeof object === 'string') return object;

    if (Number(object) === object && object % 1 !== 0) {
      const text = object.toString();
      if (text.indexOf('.') < 0) return `${text}.0`;
      return text;
    }

    return object.toString();
  }

  static visitReturnStatement(returnStatement) {
    let value = null;
    if (returnStatement.value !== null) value = Interpreter.evaluate(returnStatement.value);

    throw new ReturnException(value);
  }

  static visitFunctionStatement(functionStatement) {
    const func = Callable.FromExpression(functionStatement);
    Interpreter.Environment.define(functionStatement.name.lexeme, func);
  }

  static visitCallExpression(call) {
    const callee = Interpreter.evaluate(call.callee);

    const args = [];
    call.args.forEach((arg) => {
      args.push(Interpreter.evaluate(arg));
    }, this);

    if (!(callee instanceof Callable)) {
      throw new Error('Runtime Error: Can only call functions and classes.');
    }

    if (args.length !== callee.arity()) {
      throw new Error(
        `Runtime Error: Expected ${callee.arity()} arguments but got ${args.length}.`,
      );
    }

    return callee.call(Interpreter, args);
  }

  static visitBreakStatement() {
    if (Interpreter.LoopDepth === 0) throw new Error('Runtime Error: Cannot break outside of loop.');
    Interpreter.LoopDepth -= 1;
  }

  static visitWhileStatement(whileStatement) {
    Interpreter.LoopDepth += 1;

    const depth = Interpreter.LoopDepth;

    while (
      Interpreter.LoopDepth === depth
      && Interpreter.IsTruthy(Interpreter.evaluate(whileStatement.condition))
    ) {
      Interpreter.execute(whileStatement.body);
    }
  }

  static visitLogicalExpression(logical) {
    const left = Interpreter.evaluate(logical.left);

    if (logical.operator.type === Token.TokenTypes.OR) {
      if (Interpreter.IsTruthy(left)) return left;
    }

    if (logical.operator.type === Token.TokenTypes.AND) {
      if (!Interpreter.IsTruthy(left)) return left;
    }

    return Interpreter.evaluate(logical.right);
  }

  static visitIfStatement(ifStatement) {
    if (Interpreter.IsTruthy(Interpreter.evaluate(ifStatement.condition))) {
      Interpreter.execute(ifStatement.thenBranch);
    } else if (ifStatement.elseBranch !== null) {
      Interpreter.execute(ifStatement.elseBranch);
    }
  }

  static executeBlock(statements, environment) {
    const previous = Interpreter.Environment;

    try {
      Interpreter.Environment = environment;
      statements.forEach((statement) => {
        Interpreter.execute(statement);
      });
    } finally {
      Interpreter.Environment = previous;
    }
  }

  static visitBlockStatement(block) {
    Interpreter.executeBlock(block.statements, new Environment(Interpreter.Environment));
  }

  static visitLetStatement(statement) {
    let value = null;
    if (statement.initializer !== null) {
      value = Interpreter.evaluate(statement.initializer);
    }

    Interpreter.Environment.define(statement.name.lexeme, value);
  }

  static visitAssignmentExpression(assignment) {
    const value = Interpreter.evaluate(assignment.value);
    Interpreter.Environment.assign(assignment.name.lexeme, value);
  }

  static visitVariableExpression(variable) {
    return Interpreter.Environment.get(variable.name.lexeme);
  }

  static visitExpressionStatement(expressionStatement) {
    Interpreter.evaluate(expressionStatement.expression);
    return null;
  }

  static visitPrintStatement(printStatement) {
    const value = Interpreter.evaluate(printStatement.expression);
    Interpreter.Mint.Logger.print(Interpreter.stringify(value));
  }

  static evaluate(expression) {
    return expression.accept();
  }

  static visitLiteralExpression(literal) {
    if (literal.value == null) return 'null';
    return literal.value;
  }

  static visitGroupingExpression(grouping) {
    return Interpreter.evaluate(grouping.expression);
  }

  static IsTruthy(object) {
    if (object == null) return false;
    if (typeof object === 'boolean') return object;
    return true;
  }

  static visitUnaryExpression(unary) {
    const right = Interpreter.evaluate(unary.right);

    switch (unary.operator.type) {
      case Token.TokenTypes.MINUS:
        return -right;
      case Token.TokenTypes.BANG:
        return !Interpreter.IsTruthy(right);
      default:
        return null;
    }
  }

  static IsEqual(left, right) {
    if (left == null && right == null) return true;
    if (left == null) return false;

    return left === right;
  }

  static CheckNumberOperands(operator, left, right) {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new Error(`${operator} must be numbers.`);
  }

  static Operators = {
    Subtract: (left, right) => {
      if (typeof left === 'number' && typeof right === 'number') return left - right;
      if (typeof left === 'string' && typeof right === 'number') {
        if (left.length - right < 0) throw new Error('Runtime Error: Cannot substring more than string length.');
        return left.slice(0, -right);
      }
      if (typeof left === 'string' && typeof right === 'string') return left.replace(right, '');
      throw new Error(
        'Runtime Error: Operands must be two numbers or two strings or start with a string.',
      );
    },
    Add: (left, right) => {
      if (typeof left === 'number' && typeof right === 'number') return left + right;
      if (typeof left === 'string' && typeof right === 'string') return left + right;
      if (
        (typeof left === 'string' && typeof right === 'number')
        || (typeof left === 'number' && typeof right === 'string')
      ) return left.toString() + right.toString();
      throw new Error('Runtime Error: Operands cannot be added.');
    },
    Greatness: (left, right) => {
      if (typeof left === 'number' && typeof right === 'number') return left > right;
      if (typeof left === 'number' && typeof right === 'number') return left > right;
      if (typeof left === 'string' && typeof right === 'string') return left.length > right.length;
      if (typeof left === 'string' && typeof right === 'number') return left.length > right;
      if (typeof left === 'number' && typeof right === 'string') return left > right.length;
      throw new Error('Runtime Error: Operands cannot be compared.');
    },
    Lessness: (left, right) => {
      if (typeof left === 'number' && typeof right === 'number') return left < right;
      if (typeof left === 'string' && typeof right === 'string') return left.length < right.length;
      if (typeof left === 'string' && typeof right === 'number') return left.length < right;
      if (typeof left === 'number' && typeof right === 'string') return left < right.length;
      throw new Error('Runtime Error: Operands cannot be compared.');
    },
    GreatnessEqual: (left, right) => {
      if (typeof left === 'number' && typeof right === 'number') return left >= right;
      if (typeof left === 'string' && typeof right === 'string') return left.length >= right.length;
      if (typeof left === 'string' && typeof right === 'number') return left.length >= right;
      if (typeof left === 'number' && typeof right === 'string') return left >= right.length;
      throw new Error('Runtime Error: Operands cannot be compared.');
    },
    LessnessEqual: (left, right) => {
      if (typeof left === 'number' && typeof right === 'number') return left <= right;
      if (typeof left === 'string' && typeof right === 'string') return left.length <= right.length;
      if (typeof left === 'string' && typeof right === 'number') return left.length <= right;
      if (typeof left === 'number' && typeof right === 'string') return left <= right.length;
      throw new Error('Runtime Error: Operands cannot be compared.');
    },
    Divide: (left, right) => {
      if (right === 0) throw new Error('Runtime Error: Cannot divide by zero.');
      if (typeof left === 'number' && typeof right === 'number') return left / right;
      if (typeof left === 'string' && typeof right === 'number') {
        const roundedFraction = Math.round(left.length / right);
        if (roundedFraction === 0) throw new Error('Runtime Error: Cannot divide by zero.');
        return left.slice(0, roundedFraction);
      }
      throw new Error('Runtime Error: Operands must be two numbers.');
    },
    Multiply: (left, right) => {
      if (typeof left === 'number' && typeof right === 'number') return left * right;
      if (typeof left === 'string' && typeof right === 'number') {
        let output = '';
        for (let i = 0; i < right; i += 1) output += left;
        return output;
      }
      throw new Error('Runtime Error: Operands must be two numbers or start with a string.');
    },
  };

  static visitBinaryExpression(binary) {
    const left = Interpreter.evaluate(binary.left);
    const right = Interpreter.evaluate(binary.right);

    switch (binary.operator.type) {
      case Token.TokenTypes.MINUS:
        return Interpreter.Operators.Subtract(left, right);
      case Token.TokenTypes.SLASH:
        return Interpreter.Operators.Divide(left, right);
      case Token.TokenTypes.STAR:
        return Interpreter.Operators.Multiply(left, right);
      case Token.TokenTypes.PLUS:
        return Interpreter.Operators.Add(left, right);
      case Token.TokenTypes.GREATER:
        return Interpreter.Operators.Greatness(left, right);
      case Token.TokenTypes.GREATER_EQUAL:
        return Interpreter.Operators.GreatnessEqual(left, right);
      case Token.TokenTypes.LESS:
        return Interpreter.Operators.Lessness(left, right);
      case Token.TokenTypes.LESS_EQUAL:
        return Interpreter.Operators.LessnessEqual(left, right);
      case Token.TokenTypes.BANG_EQUAL:
        return !Interpreter.IsEqual(left, right);
      case Token.TokenTypes.EQUAL_EQUAL:
        return Interpreter.IsEqual(left, right);
      default:
        return null;
    }
  }

  static execute(statement) {
    statement.accept();
  }

  static Interpret(statements) {
    try {
      statements.forEach((stmnt) => {
        Interpreter.execute(stmnt);
      });
    } catch (e) {
      Interpreter.Mint.Logger.error(e);
    }
  }
}

export default Interpreter;
