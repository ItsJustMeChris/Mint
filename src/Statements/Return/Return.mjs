import Statement from 'Statements/Statement/Statement.mjs';

class Return extends Statement {
  constructor(keyword, value) {
    super();
    this.keyword = keyword;
    this.value = value;
  }

  accept() {
    return Statement.visitReturnStatement(this);
  }
}

export default Return;
