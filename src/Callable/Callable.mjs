import Environment from 'Environment/Environment.mjs';

class Callable {
  constructor({ arity, call, toString }) {
    this.arity = arity;
    this.call = call;
    this.toString = toString;
  }

  static FromExpression(expression) {
    return new Callable({
      arity: () => expression.params.length,
      call: (interpreter, args) => {
        const env = new Environment(interpreter.globals);
        for (let i = 0; i < expression.params.length; i += 1) {
          env.define(expression.params[i].lexeme, args[i]);
        }

        interpreter.executeBlock(expression.body, env);

        return null;
      },
      toString: () => `<func ${expression.name.lexeme}>`,
    });
  }

  static FromNative(func) {
    return new Callable({
      arity: () => func.length,
      call: func,
      toString: () => '<native func>',
    });
  }
}

export default Callable;
