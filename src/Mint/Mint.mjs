import Logger from 'Logger/Logger.mjs';
import Interpreter from 'Interpreter/Interpreter.mjs';
import Scanner from 'Scanner/Scanner.mjs';
import Parser from 'Parser/Parser.mjs';
import { readFileSync } from 'fs';
import path from 'path';
import ReadLine from 'readline';
import { Expression, Print } from 'Statements/Statements.mjs';
import Resolver from 'Resolver/Resolver.mjs';

class Mint {
  hadError = false;

  static Logger = Logger;

  static Interpreter = Interpreter;

  static Scanner = Scanner;

  static Parser = Parser;

  static Resolver = Resolver;

  static {
    Logger.info('Initializing Mint');

    Logger.addListener(() => {
      this.hadError = true;
    }, 'error');

    Interpreter.Bind(this);
    Scanner.Bind(this);
    Parser.Bind(this);
    Resolver.Bind(this);
  }

  static Boot() {
    const args = process.argv.slice(2);
    if (args.length > 1) {
      Logger.error('Mint Programming Language');
      Logger.error('Usage: mint [script]');
      return;
    }

    Logger.success('Mint Booted');

    if (args.length === 1) {
      Mint.RunFile(args[0]);
    } else {
      Mint.RunPrompt();
    }
  }

  static Run(code) {
    const scanner = new Mint.Scanner(code);
    const tokens = scanner.scanTokens();

    const parser = new Mint.Parser(tokens);
    const statements = parser.parse();

    if (statements[0] instanceof Expression) {
      statements[0] = new Print(statements[0].expression);
    }

    Resolver.Overload().resolveStatements(statements).Release();
    if (Mint.hadError) return null;
    Interpreter.Overload().Interpret(statements).Release();
    return null;
  }

  static RunPrompt() {
    const rl = ReadLine.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'mint> ',
    });

    rl.prompt();

    rl.on('line', (line) => {
      this.Run(line);
      if (Mint.hadError) Mint.hadError = false;
      rl.prompt();
    }).on('close', () => {
      Mint.Logger.notice('Goodbye!');
      process.exit(0);
    });
  }

  static RunFile(source) {
    const filePath = path.resolve(source);

    if (!filePath.endsWith('.mt')) {
      Mint.Logger.error('Mint files must end with .mt');
      return;
    }

    const file = readFileSync(filePath, 'utf-8');

    Mint.Run(file);
    if (Mint.hadError) process.exit(65);
  }
}

export default Mint;
