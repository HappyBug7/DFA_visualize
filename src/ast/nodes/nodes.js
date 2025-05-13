export const NodeType = {
  CHAR : 'CHAR',
  STAR : 'STAR',
  CONCAT : 'CONCAT',
  UNION : 'UNION'
}

export class CharNode {
  constructor(char) {
    this.type = NodeType.CHAR;
    this.char = char;
  }

  to_string() {
    return this.char;
  }
}

export class StarNode {
  constructor(expr) {
    this.type = NodeType.STAR;
    this.expr = expr;
  }

  to_string() {
    return `(${this.expr.to_string()})*`;
  }
}

export class ConcatNode {
  constructor(left, right) {
    this.type = NodeType.CONCAT;
    this.left = left;
    this.right = right;
  }

  to_string() {
    return `${this.left.to_string()}${this.right.to_string()}`;
  }
}

export class UnionNode {
  constructor(left, right) {
    this.type = NodeType.UNION;
    this.left = left;
    this.right = right;
  }

  to_string() {
    return `${this.left.to_string()}|${this.right.to_string()}`;
  }
}