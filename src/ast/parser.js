import * as Nodes from './nodes/nodes.js';

export class Parser {
  constructor() {    
  }

  insertConcatOperators(regex) {
    const result = [];
    const isChar = c => /[a-zA-Z]/.test(c);

    for (let i = 0; i < regex.length; i++) {
      const char = regex[i];
      result.push(char);
      
      const nextChar = regex[i + 1];
      if (!nextChar) {
        continue;
      }

      if ((isChar(char) || char === ')' || char === '*') && (isChar(nextChar) || nextChar === '(')) {
        result.push('.');
      }
    }

    return result.join('');
  }

  toPostfix(regex) {
    const output = [];
    const stack = [];
    const ops = new Set(['*', '.', '|']);

    const precedence = {
      '|': 1,
      '.': 2,
      '*': 3,
    };

    for (const token of regex) {
      if (/[a-zA-Z]/.test(token)) {
        output.push(token);
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length && stack[stack.length - 1] !== '(') {
          output.push(stack.pop());
        }
        stack.pop();
      } else if (ops.has(token)) {
        while (stack.length && precedence[stack[stack.length - 1]] >= precedence[token]) {
          output.push(stack.pop());
        }
        stack.push(token);
      }
    }

    while (stack.length) {
      output.push(stack.pop());
    }
    return output;
  }

  buildAST(postfix) {
    const stack = [];

    for (const token of postfix) {
      if (/[a-zA-Z]/.test(token)) {
        stack.push(new Nodes.CharNode(token));
      } else if (token === '*') {
        const node = stack.pop();
        stack.push(new Nodes.StarNode(node));
      } else if (token === '.') {
        const right = stack.pop();
        const left = stack.pop();
        stack.push(new Nodes.ConcatNode(left, right));
      } else if (token === '|') {
        const right = stack.pop();
        const left = stack.pop();
        stack.push(new Nodes.UnionNode(left, right));
      }
    }

    return stack[0];
  }

  parse(regex) {
    const withConcat = this.insertConcatOperators(regex);
    const postfix = this.toPostfix(withConcat);
    const ast = this.buildAST(postfix);
    return ast;
  }

  display(ast, indent = 0) {
    const padding = '  '.repeat(indent);
    console.log(padding + ast.to_string());

    switch (ast.type) {
      case 'CHAR':
        // CharNode 是叶子节点，无需继续
        break;

      case 'STAR':
        this.display(ast.expr, indent + 1);
        break;

      case 'CONCAT':
      case 'UNION':
        this.display(ast.left, indent + 1);
        this.display(ast.right, indent + 1);
        break;

      default:
        console.warn(padding + '[Unknown Node Type]', ast);
    }
  }

}