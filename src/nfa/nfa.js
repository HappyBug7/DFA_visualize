import * as Nodes from '../ast/nodes/nodes.js';

let stateId = 0;
function getStateId() {
  return stateId++;
}


class NFAState {
  constructor() {
    this.id = getStateId();
    this.transitions = [];
  }

  addTransition(symbol, state) {
    this.transitions.push({ symbol, state });
  }
}

class NFA {
  constructor(start, accept) {
    this.start = start;
    this.accept = accept;
  }
}

function buildFromChar(char) {
  const start = new NFAState();
  const accept = new NFAState();
  start.addTransition(char, accept);
  return new NFA(start, accept);
}

function buildFromStar(ast) {
  const nfa = buildFromAST(ast);
  const start = new NFAState();
  const accept = new NFAState();

  start.addTransition('ε', nfa.start);
  start.addTransition('ε', accept);
  nfa.accept.addTransition('ε', nfa.start);
  nfa.accept.addTransition('ε', accept);

  return new NFA(start, accept);
}

function buildFromConcat(ast) {
  const leftNFA = buildFromAST(ast.left);
  const rightNFA = buildFromAST(ast.right);

  leftNFA.accept.addTransition('ε', rightNFA.start);

  return new NFA(leftNFA.start, rightNFA.accept);
}

function buildFromUnion(ast) {
  const leftNFA = buildFromAST(ast.left);
  const rightNFA = buildFromAST(ast.right);

  const start = new NFAState();
  const accept = new NFAState();

  start.addTransition('ε', leftNFA.start);
  start.addTransition('ε', rightNFA.start);
  leftNFA.accept.addTransition('ε', accept);
  rightNFA.accept.addTransition('ε', accept);

  return new NFA(start, accept);
}

function buildFromAST(ast) {
  switch (ast.type) {
    case Nodes.NodeType.CHAR:
      return buildFromChar(ast.char);
    case Nodes.NodeType.STAR:
      return buildFromStar(ast.expr);
    case Nodes.NodeType.CONCAT:
      return buildFromConcat(ast);
    case Nodes.NodeType.UNION:
      return buildFromUnion(ast);
    default:
      throw new Error(`Unknown AST node type: ${ast.type}`);
  }
}

export default {
  buildFromAST,
  NFAState,
  NFA
}