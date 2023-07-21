import { Expression } from 'Expressions/Expressions.mjs';
import { Statement, Function } from 'Statements/Statements.mjs';
import Token from 'Token/Token.mjs';
import Environment from 'Environment/Environment.mjs';
import Callable from 'Callable/Callable.mjs';
import { ReturnException } from 'Exceptions/Exceptions.mjs';

class Interpreter {
  Mint = null;

  static globals = new Environment();

  static Environment = Interpreter.globals;

  static Locals = {};

  static LoopDepth = 0;

  static Bind(Mint) {
    Interpreter.Mint = Mint;

    Interpreter.globals.define(
      'now',
      Callable.FromNative(() => Date.now()),
    );
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

  static Expressions = {
    visitBinaryExpression(binary) {
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
    },
    visitLiteralExpression(literal) {
      if (literal.value == null) return 'null';
      return literal.value;
    },
    visitGroupingExpression(grouping) {
      return Interpreter.evaluate(grouping.expression);
    },
    visitUnaryExpression(unary) {
      const right = Interpreter.evaluate(unary.right);

      switch (unary.operator.type) {
        case Token.TokenTypes.MINUS:
          return -right;
        case Token.TokenTypes.BANG:
          return !Interpreter.IsTruthy(right);
        default:
          return null;
      }
    },
    visitAssignmentExpression(assignment) {
      const distance = Interpreter.Locals[assignment.name.lexeme];
      if (distance != null) {
        Interpreter.Environment.assignAt(
          distance,
          assignment.name.lexeme,
          Interpreter.evaluate(assignment.value),
        );
      } else {
        Interpreter.Environment.assign(
          assignment.name.lexeme,
          Interpreter.evaluate(assignment.value),
        );
      }

      const value = Interpreter.evaluate(assignment.value);
      Interpreter.Environment.assign(assignment.name.lexeme, value);
    },
    visitVariableExpression(variable) {
      if (Interpreter.Locals[variable.name.lexeme] != null) {
        return Interpreter.Environment.getAt(
          Interpreter.Locals[variable.name.lexeme],
          variable.name.lexeme,
        );
      }
      return Interpreter.Environment.get(variable.name.lexeme);
    },
    visitLogicalExpression(logical) {
      const left = Interpreter.evaluate(logical.left);

      if (logical.operator.type === Token.TokenTypes.OR) {
        if (Interpreter.IsTruthy(left)) return left;
      }

      if (logical.operator.type === Token.TokenTypes.AND) {
        if (!Interpreter.IsTruthy(left)) return left;
      }

      return Interpreter.evaluate(logical.right);
    },
    visitCallExpression(call) {
      const callee = Interpreter.evaluate(call.callee);

      const args = [];
      call.args.forEach((arg) => {
        if (arg instanceof Function) {
          const anon = Callable.FromExpression(arg, Interpreter.Environment);
          args.push(anon);
        } else {
          args.push(Interpreter.evaluate(arg));
        }
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
    },
  };

  static Statements = {
    visitBlockStatement(block) {
      Interpreter.executeBlock(block.statements, new Environment(Interpreter.Environment));
    },
    visitLetStatement(statement) {
      let value = null;
      if (statement.initializer !== null) {
        value = Interpreter.evaluate(statement.initializer);
      }

      try {
        Interpreter.Environment.define(statement.name.lexeme, value);
      } catch (e) {
        Interpreter.Mint.Logger.error(e);
      }
    },
    visitExpressionStatement(expressionStatement) {
      Interpreter.evaluate(expressionStatement.expression);
      return null;
    },
    visitPrintStatement(printStatement) {
      const value = Interpreter.evaluate(printStatement.expression);
      Interpreter.Mint.Logger.print(Interpreter.stringify(value));
    },
    visitReturnStatement(returnStatement) {
      let value = null;
      if (returnStatement.value !== null) value = Interpreter.evaluate(returnStatement.value);

      throw new ReturnException(value);
    },
    visitFunctionStatement(functionStatement) {
      const func = Callable.FromExpression(functionStatement, Interpreter.Environment);
      Interpreter.Environment.define(functionStatement.name.lexeme, func);
    },
    visitBreakStatement() {
      if (Interpreter.LoopDepth === 0) throw new Error('Runtime Error: Cannot break outside of loop.');
      Interpreter.LoopDepth -= 1;
    },
    visitWhileStatement(whileStatement) {
      Interpreter.LoopDepth += 1;

      const depth = Interpreter.LoopDepth;

      while (
        Interpreter.LoopDepth === depth
        && Interpreter.IsTruthy(Interpreter.evaluate(whileStatement.condition))
      ) {
        Interpreter.execute(whileStatement.body);
      }
    },
    visitIfStatement(ifStatement) {
      if (Interpreter.IsTruthy(Interpreter.evaluate(ifStatement.condition))) {
        Interpreter.execute(ifStatement.thenBranch);
      } else if (ifStatement.elseBranch !== null) {
        Interpreter.execute(ifStatement.elseBranch);
      }
    },
  };

  static Overload() {
    Expression.Overloads = Interpreter.Expressions;
    Statement.Overloads = Interpreter.Statements;

    return Interpreter;
  }

  static Release() {
    Expression.Overloads = {};
    Statement.Overloads = {};

    return Interpreter;
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

  static evaluate(expression) {
    return expression.accept();
  }

  static IsTruthy(object) {
    if (object == null) return false;
    if (typeof object === 'boolean') return object;
    return true;
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

  static execute(statement) {
    statement.accept();
  }

  static resolve(expression, depth) {
    Interpreter.Locals[expression] = depth;
  }

  static Interpret(statements) {
    try {
      statements.forEach((stmnt) => {
        Interpreter.execute(stmnt);
      });
    } catch (e) {
      Interpreter.Mint.Logger.error(e);
    }

    return Interpreter;
  }
}

export default Interpreter;
