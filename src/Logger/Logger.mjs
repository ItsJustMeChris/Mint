/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
import Colors from 'colors';

class Logger {
  static Listeners = [];

  static addListener(cb, ...types) {
    const listener = {
      callback: cb,
      types,
    };

    this.Listeners.push(listener);
  }

  static push(type, message) {
    this.Listeners.forEach((listener) => {
      if (listener.types.includes('*') || listener.types.includes(type)) {
        listener.callback(message);
      }
    });
  }

  static log(message) {
    console.log(`[MINT][LOG] ${message}`);
    this.push('log', message);
  }

  static info(message) {
    console.log(`${'[MINT][INFO]'.blue} ${message}`);
    this.push('info', message);
  }

  static error(message) {
    console.log(`${'[MINT][ERROR]'.red} ${message}`);
    this.push('error', message);
  }

  static success(message) {
    console.log(`${'[MINT][SUCCESS]'.green} ${message}`);
    this.push('success', message);
  }

  static warning(message) {
    console.log(`${'[MINT][WARNING]'.yellow} ${message}`);
    this.push('warning', message);
  }

  static notice(message) {
    console.log(`${'[MINT][NOTICE]'.cyan} ${message}`);
    this.push('notice', message);
  }

  static report(line, where, message) {
    this.error(`[line ${line}] Error ${where}: ${message}`);
  }

  static print(message) {
    console.log(message);
    this.push('print', message);
  }
}

export default Logger;
