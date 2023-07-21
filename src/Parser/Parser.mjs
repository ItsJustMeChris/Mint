import {
  Binary,
  Unary,
  Literal,
  Grouping,
  Variable,
  Assignment,
  Logical,
  Call,
} from 'Expressions/Expressions.mjs';

import {
  Print,
  Expression,
  Let,
  Block,
  If,
  While,
  Break,
  Function,
  Return,
} from 'Statements/Statements.mjs';

import Token from 'Token/Token.mjs';

class Parser {
  static Mint = null;

  static Bind(Mint) {
    Parser.Mint = Mint;
  }

  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  match(...types) {
    for (let i = 0; i < types.length; i += 1) {
      if (this.check(types[i])) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current += 1;
    return this.previous();
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  isAtEnd() {
    return this.peek().type === Token.TokenTypes.EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  equality() {
    let expr = this.comparison();

    while (this.match(Token.TokenTypes.BANG_EQUAL, Token.TokenTypes.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  comparison() {
    let expr = this.term();

    while (
      this.match(
        Token.TokenTypes.GREATER,
        Token.TokenTypes.GREATER_EQUAL,
        Token.TokenTypes.LESS,
        Token.TokenTypes.LESS_EQUAL,
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  term() {
    let expr = this.factor();

    while (this.match(Token.TokenTypes.MINUS, Token.TokenTypes.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  factor() {
    let expr = this.unary();

    while (this.match(Token.TokenTypes.SLASH, Token.TokenTypes.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  unary() {
    if (this.match(Token.TokenTypes.BANG, Token.TokenTypes.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.call();
  }

  finishCall(callee) {
    const args = [];
    if (!this.check(Token.TokenTypes.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          Parser.error(this.peek(), 'Cannot have more than 255 arguments.');
        }
        args.push(this.expression());
      } while (this.match(Token.TokenTypes.COMMA));
    }

    const paren = this.consume(Token.TokenTypes.RIGHT_PAREN, "Expect ')' after arguments.");

    return new Call(callee, paren, args);
  }

  call() {
    let expr = this.primary();

    while (true) {
      if (this.match(Token.TokenTypes.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  primary() {
    if (this.match(Token.TokenTypes.FALSE)) return new Literal(false);
    if (this.match(Token.TokenTypes.TRUE)) return new Literal(true);
    if (this.match(Token.TokenTypes.NIL)) return new Literal(null);

    if (this.match(Token.TokenTypes.NUMBER, Token.TokenTypes.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(Token.TokenTypes.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    if (this.match(Token.TokenTypes.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(Token.TokenTypes.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    console.log('Failed on primary', this.peek());
    throw Parser.error(this.peek(), 'Expect expression.');
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();

    throw Parser.error(this.peek(), message);
  }

  static error(token, message) {
    Parser.Mint.Logger.report(token.line, ' at end', message);
    return new Error();
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === Token.TokenTypes.SEMICOLON) return;

      switch (this.peek().type) {
        case Token.TokenTypes.CLASS:
        case Token.TokenTypes.FUNCTION:
        case Token.TokenTypes.LET:
        case Token.TokenTypes.FOR:
        case Token.TokenTypes.IF:
        case Token.TokenTypes.WHILE:
        case Token.TokenTypes.PRINT:
        case Token.TokenTypes.RETURN:
          return;
        default:
          break;
      }

      this.advance();
    }
  }

  and() {
    let expr = this.equality();

    while (this.match(Token.TokenTypes.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  or() {
    let expr = this.and();

    while (this.match(Token.TokenTypes.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  assignment() {
    const expr = this.or();
    if (this.match(Token.TokenTypes.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const { name } = expr;
        return new Assignment(name, value);
      }

      Parser.error(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  expression() {
    return this.assignment();
  }

  printStatement() {
    const expr = this.expression();
    this.consume(Token.TokenTypes.SEMICOLON, "Expect ';' after value.");
    return new Print(expr);
  }

  expressionStatement() {
    const expr = this.expression();
    this.consume(Token.TokenTypes.SEMICOLON, "Expect ';' after expression.");
    return new Expression(expr);
  }

  letDeclaration() {
    const name = this.consume(Token.TokenTypes.IDENTIFIER, 'Expect variable name.');

    let initializer = null;
    if (this.match(Token.TokenTypes.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(Token.TokenTypes.SEMICOLON, "Expect ';' after variable declaration.");
    return new Let(name, initializer);
  }

  block() {
    const statements = [];
    while (!this.check(Token.TokenTypes.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(Token.TokenTypes.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  ifStatement() {
    this.consume(Token.TokenTypes.LEFT_PAREN, "Expect '(' after 'if'.");
    const expr = this.expression();
    this.consume(Token.TokenTypes.RIGHT_PAREN, "Expect ')' after condition.");

    const thenBranch = this.statement();

    let elseBranch = null;
    if (this.match(Token.TokenTypes.ELSE)) {
      elseBranch = this.statement();
    }

    return new If(expr, thenBranch, elseBranch);
  }

  whileStatement() {
    this.consume(Token.TokenTypes.LEFT_PAREN, "Expect '(' after 'while'.");
    const expr = this.expression();
    this.consume(Token.TokenTypes.RIGHT_PAREN, "Expect ')' after condition.");
    const body = this.statement();

    return new While(expr, body);
  }

  forStatement() {
    this.consume(Token.TokenTypes.LEFT_PAREN, "Expect '(' after 'for'.");

    let initializer;
    if (this.match(Token.TokenTypes.SEMICOLON)) {
      initializer = null;
    } else if (this.match(Token.TokenTypes.LET)) {
      initializer = this.letDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check(Token.TokenTypes.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(Token.TokenTypes.SEMICOLON, "Expect ';' after loop condition.");

    let increment = null;
    if (!this.check(Token.TokenTypes.RIGHT_PAREN)) {
      increment = this.expression();
    }

    this.consume(Token.TokenTypes.RIGHT_PAREN, "Expect ')' after for clauses.");

    let body = this.statement();

    if (increment !== null) {
      body = new Block([body, new Expression(increment)]);
    }

    if (condition === null) condition = new Literal(true);
    body = new While(condition, body);

    if (initializer !== null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  break() {
    this.consume(Token.TokenTypes.SEMICOLON, "Expect ';' after 'break'.");
    return new Break();
  }

  returnStatement() {
    const keyword = this.previous();
    let value = null;

    if (!this.check(Token.TokenTypes.SEMICOLON)) {
      value = this.expression();
    }

    console.log(this.peek());
    this.consume(Token.TokenTypes.SEMICOLON, "Expect ';' after return value.");
    return new Return(keyword, value);
  }

  statement() {
    if (this.match(Token.TokenTypes.BREAK)) return this.break();
    if (this.match(Token.TokenTypes.FOR)) return this.forStatement();
    if (this.match(Token.TokenTypes.IF)) return this.ifStatement();
    if (this.match(Token.TokenTypes.PRINT)) return this.printStatement();
    if (this.match(Token.TokenTypes.RETURN)) return this.returnStatement();
    if (this.match(Token.TokenTypes.WHILE)) return this.whileStatement();
    if (this.match(Token.TokenTypes.LEFT_BRACE)) return new Block(this.block());

    return this.expressionStatement();
  }

  function(kind) {
    const name = this.consume(Token.TokenTypes.IDENTIFIER, `Expect ${kind} name.`);
    this.consume(Token.TokenTypes.LEFT_PAREN, `Expect '(' after ${kind} name.`);
    const params = [];

    if (!this.check(Token.TokenTypes.RIGHT_PAREN)) {
      do {
        if (params.length >= 255) {
          Parser.error(this.peek(), 'Cannot have more than 255 parameters.');
        }

        params.push(this.consume(Token.TokenTypes.IDENTIFIER, 'Expect parameter name.'));
      } while (this.match(Token.TokenTypes.COMMA));
    }

    this.consume(Token.TokenTypes.RIGHT_PAREN, "Expect ')' after parameters.");
    this.consume(Token.TokenTypes.LEFT_BRACE, `Expect '{' before ${kind} body.`);
    const body = this.block();
    return new Function(name, params, body);
  }

  declaration() {
    try {
      if (this.match(Token.TokenTypes.FUNCTION)) return this.function('function');
      if (this.match(Token.TokenTypes.LET)) return this.letDeclaration();
      return this.statement();
    } catch (e) {
      Parser.Mint.Logger.error(e);
      return null;
    }
  }

  parse() {
    const statements = [];

    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }
}

export default Parser;
