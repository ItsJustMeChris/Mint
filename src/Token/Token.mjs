class Token {
  static TokenTypes = {
    // Single-character tokens.
    LEFT_PAREN: '(',
    RIGHT_PAREN: ')',
    LEFT_BRACE: '{',
    RIGHT_BRACE: '}',
    COMMA: ',',
    DOT: '.',
    MINUS: '-',
    PLUS: '+',
    SEMICOLON: ';',
    SLASH: '/',
    STAR: '*',

    // One or two character tokens.
    BANG: '!',
    BANG_EQUAL: '!=',
    EQUAL: '=',
    EQUAL_EQUAL: '==',
    GREATER: '>',
    GREATER_EQUAL: '>=',
    LESS: '<',
    LESS_EQUAL: '<=',

    // Literals.
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',

    // Keywords.
    AND: 'and',
    CLASS: 'class',
    ELSE: 'else',
    FALSE: 'false',
    FUNCTION: 'func',
    FOR: 'for',
    IF: 'if',
    NIL: 'null',
    OR: 'or',
    PRINT: 'print',
    RETURN: 'ret',
    SUPER: 'super',
    THIS: 'this',
    TRUE: 'true',
    LET: 'let',
    WHILE: 'while',
    BREAK: 'break',

    EOF: 'EOF',
  };

  static LiteralMap = {
    ...Object.keys(this.TokenTypes).reduce((obj, key) => {
      const o = obj;
      o[this.TokenTypes[key]] = key;
      return obj;
    }, {}),
  };

  constructor(type, lexeme, literal, line) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}

export default Token;
