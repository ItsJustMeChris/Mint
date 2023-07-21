class ReturnException extends Error {
  constructor(value) {
    super();
    this.value = value;
  }
}

export default ReturnException;
