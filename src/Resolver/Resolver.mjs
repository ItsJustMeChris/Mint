import { Expression } from 'Expressions/Expressions.mjs';
import { Statement } from 'Statements/Statements.mjs';

const FunctionTypes = {
  NONE: 'NONE',
  FUNCTION: 'FUNCTION',
};

class Resolver {
  static Mint = null;

  static currentFunction = FunctionTypes.NONE;

  static Bind(Mint) {
    Resolver.Mint = Mint;
  }

  static Statements = {
    visitBlockStatement(blockStatement) {
      Resolver.beginScope();
      Resolver.resolveStatements(blockStatement.statements);
      Resolver.endScope();
    },
    visitLetStatement(letStatement) {
      Resolver.declare(letStatement.name);
      if (letStatement.initializer != null) {
        Resolver.resolveExpression(letStatement.initializer);
      }
      Resolver.define(letStatement.name);
    },
    visitFunctionStatement(functionStatement) {
      Resolver.declare(functionStatement.name);
      Resolver.define(functionStatement.name);
      Resolver.resolveFunction(functionStatement);
    },
    visitExpressionStatement(expressionStatement) {
      Resolver.resolveExpression(expressionStatement.expression);
    },
    visitIfStatement(ifStatement) {
      Resolver.resolveExpression(ifStatement.condition);
      Resolver.resolveStatement(ifStatement.thenBranch);
      if (ifStatement.elseBranch != null) {
        Resolver.resolveStatement(ifStatement.elseBranch);
      }
    },
    visitPrintStatement(printStatement) {
      if (printStatement.expression != null) {
        Resolver.resolveExpression(printStatement.expression);
      }
    },
    visitReturnStatement(returnStatement) {
      if (Resolver.currentFunction === FunctionTypes.NONE) {
        Resolver.Mint.Logger.error('Cannot return from top-level code.');
        return;
      }

      if (returnStatement.value != null) {
        Resolver.resolveExpression(returnStatement.value);
      }
    },
    visitWhileStatement(whileStatement) {
      Resolver.resolveExpression(whileStatement.condition);
      Resolver.resolveStatement(whileStatement.body);
    },
  };

  static Expressions = {
    visitVariableExpression(variableExpression) {
      if (Resolver.scopes.length !== 0) {
        const scope = Resolver.scopes[Resolver.scopes.length - 1];
        if (scope[variableExpression.name.lexeme] === false) {
          Resolver.Mint.Logger.error(
            `variable ${variableExpression.name.lexeme} cannot be read in its own initializer.`,
          );
        }

        Resolver.resolveLocal(variableExpression, variableExpression.name);
      }
    },
    visitAssignmentExpression(assignmentExpression) {
      Resolver.resolveExpression(assignmentExpression.value);
      Resolver.resolveLocal(assignmentExpression, assignmentExpression.name);
    },
    visitBinaryExpression(binaryExpression) {
      Resolver.resolveExpression(binaryExpression.left);
      Resolver.resolveExpression(binaryExpression.right);
    },
    visitCallExpression(callExpression) {
      Resolver.resolveExpression(callExpression.callee);
      if (callExpression.arguments == null) return;
      callExpression.arguments.forEach((argument) => Resolver.resolveExpression(argument));
    },
    visitGroupingExpression(groupingExpression) {
      Resolver.resolveExpression(groupingExpression.expression);
    },
    visitLiteralExpression() {},
    visitLogicalExpression(logicalExpression) {
      Resolver.resolveExpression(logicalExpression.left);
      Resolver.resolveExpression(logicalExpression.right);
    },
    visitUnaryExpression(unaryExpression) {
      Resolver.resolveExpression(unaryExpression.right);
    },
  };

  static {
    Resolver.scopes = [];
  }

  static Overload() {
    Expression.Overloads = Resolver.Expressions;
    Statement.Overloads = Resolver.Statements;
    return Resolver;
  }

  static Release() {
    Expression.Overloads = {};
    Statement.Overloads = {};
    return Resolver;
  }

  static beginScope() {
    Resolver.scopes.push({});
  }

  static endScope() {
    Resolver.scopes.pop();
  }

  static resolveStatement(statement) {
    statement.accept();
  }

  static resolveExpression(expression) {
    expression.accept();
  }

  static resolveLocal = (expression, name) => {
    Resolver.scopes.forEach((scope, index) => {
      if (scope[name.lexeme] != null) {
        Resolver.Mint.Interpreter.resolve(expression, index);
      }
    });
  };

  static define(name) {
    if (Resolver.scopes.length === 0) return;
    const scope = Resolver.scopes[Resolver.scopes.length - 1];
    scope[name.lexeme] = true;
  }

  static resolveFunction(functionStatement, functionType) {
    const enclosingFunction = Resolver.currentFunction;
    Resolver.currentFunction = functionType;

    Resolver.beginScope();
    functionStatement.params.forEach((param) => {
      Resolver.declare(param);
      Resolver.define(param);
    });
    Resolver.resolveStatements(functionStatement.body);
    Resolver.endScope();
    Resolver.currentFunction = enclosingFunction;
  }

  static declare(name) {
    if (Resolver.scopes.length === 0) return;
    const scope = Resolver.scopes[Resolver.scopes.length - 1];
    scope[name.lexeme] = false;
  }

  static resolveStatements(statements) {
    statements.forEach((statement) => Resolver.resolveStatement(statement));
    return Resolver;
  }
}

export default Resolver;
