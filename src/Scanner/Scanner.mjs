import Token from 'Token/Token.mjs';
// import {
//   Binary, Unary, Literal, Grouping, Expression,
// } from 'Expressions/Expressions.mjs';

class Scanner {
  static Bind(Mint) {
    Scanner.Mint = Mint;

    // const test = new Binary(
    //   new Unary(new Token(Token.TokenTypes.MINUS, '-', null, 1), new Literal(123)),
    //   new Token(Token.TokenTypes.STAR, '*', null, 1),
    //   new Grouping(new Literal(45.67)),
    // );

    // console.log(Expression.print(test));
  }

  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  advance() {
    this.current += 1;
    return this.source[this.current - 1];
  }

  addTokenLiteral(type, literal = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  addToken(type) {
    this.addTokenLiteral(type, null);
  }

  match(expected) {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current += 1;
    return true;
  }

  peek(ahead = 0) {
    if (this.isAtEnd()) return '\0';
    if (this.current + ahead >= this.source.length) return '\0';
    return this.source[this.current + ahead];
  }

  stringLiteral(type) {
    while (this.peek() !== type && !this.isAtEnd()) this.advance();

    if (this.isAtEnd()) {
      Scanner.Mint.Logger.report(this.line, 'Mint::Scanner', 'Unterminated string');
      return;
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addTokenLiteral(Token.TokenTypes.STRING, value);
  }

  static isDigit(c) {
    return c >= '0' && c <= '9';
  }

  static isAlpha(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  static isAlphaNumeric(c) {
    return Scanner.isAlpha(c) || Scanner.isDigit(c);
  }

  numberLiteral() {
    while (Scanner.isDigit(this.peek())) this.advance();

    if (this.peek() === '.' && Scanner.isDigit(this.peek(1))) {
      this.advance();

      while (Scanner.isDigit(this.peek())) this.advance();
    }

    this.addTokenLiteral(
      Token.TokenTypes.NUMBER,
      parseFloat(this.source.substring(this.start, this.current)),
    );
  }

  identifier() {
    while (Scanner.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);

    if (Token.LiteralMap[text]) {
      this.addToken(text);
      return;
    }

    this.addTokenLiteral(Token.TokenTypes.IDENTIFIER);
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case Token.TokenTypes.LEFT_PAREN:
        this.addToken(Token.TokenTypes.LEFT_PAREN);
        break;
      case Token.TokenTypes.RIGHT_PAREN:
        this.addToken(Token.TokenTypes.RIGHT_PAREN);
        break;
      case Token.TokenTypes.LEFT_BRACE:
        this.addToken(Token.TokenTypes.LEFT_BRACE);
        break;
      case Token.TokenTypes.RIGHT_BRACE:
        this.addToken(Token.TokenTypes.RIGHT_BRACE);
        break;
      case Token.TokenTypes.COMMA:
        this.addToken(Token.TokenTypes.COMMA);
        break;
      case Token.TokenTypes.DOT:
        this.addToken(Token.TokenTypes.DOT);
        break;
      case Token.TokenTypes.MINUS:
        this.addToken(Token.TokenTypes.MINUS);
        break;
      case Token.TokenTypes.PLUS:
        this.addToken(Token.TokenTypes.PLUS);
        break;
      case Token.TokenTypes.SEMICOLON:
        this.addToken(Token.TokenTypes.SEMICOLON);
        break;
      case Token.TokenTypes.STAR:
        this.addToken(Token.TokenTypes.STAR);
        break;
      case Token.TokenTypes.BANG:
        if (this.match(Token.TokenTypes.EQUAL)) {
          this.addToken(Token.TokenTypes.BANG_EQUAL);
        } else {
          this.addToken(Token.TokenTypes.BANG);
        }
        break;
      case Token.TokenTypes.EQUAL:
        if (this.match(Token.TokenTypes.EQUAL)) {
          this.addToken(Token.TokenTypes.EQUAL_EQUAL);
        } else {
          this.addToken(Token.TokenTypes.EQUAL);
        }
        break;
      case Token.TokenTypes.LESS:
        if (this.match(Token.TokenTypes.EQUAL)) {
          this.addToken(Token.TokenTypes.LESS_EQUAL);
        } else {
          this.addToken(Token.TokenTypes.LESS);
        }
        break;
      case Token.TokenTypes.GREATER:
        if (this.match(Token.TokenTypes.EQUAL)) {
          this.addToken(Token.TokenTypes.GREATER_EQUAL);
        } else {
          this.addToken(Token.TokenTypes.GREATER);
        }
        break;
      case Token.TokenTypes.SLASH:
        if (this.match(Token.TokenTypes.SLASH)) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(Token.TokenTypes.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line += 1;
        break;
      case '"':
      case "'":
        this.stringLiteral(c);
        break;
      default:
        if (Scanner.isDigit(c)) {
          this.numberLiteral();
        } else if (Scanner.isAlpha(c)) {
          this.identifier();
        } else {
          Scanner.Mint.Logger.report(this.line, 'Mint::Scanner', `Unexpected character '${c}'`);
        }
        break;
    }
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(Token.TokenTypes.EOF, '', null, this.line));
    return this.tokens;
  }
}

export default Scanner;
