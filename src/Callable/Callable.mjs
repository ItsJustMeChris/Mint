import Environment from 'Environment/Environment.mjs';
import { ReturnException } from 'Exceptions/Exceptions.mjs';

class Callable {
  constructor({
    arity, call, toString, closure = null,
  }) {
    this.arity = arity;
    this.call = call;
    this.toString = toString;
    this.closure = closure;
  }

  static FromExpression(expression, closure = null) {
    return new Callable({
      arity: () => expression.params.length,
      call: (interpreter, args) => {
        const env = new Environment(closure);
        for (let i = 0; i < expression.params.length; i += 1) {
          env.define(expression.params[i].lexeme, args[i]);
        }

        try {
          interpreter.executeBlock(expression.body, env);
        } catch (error) {
          if (error instanceof ReturnException) {
            return error.value;
          }
        }

        return null;
      },
      toString: () => `<func ${expression.name ? expression.name.lexeme : 'anonymous'}>`,
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
