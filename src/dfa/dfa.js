import { Parser } from "@/ast/parser";
import nfa from "@/nfa/nfa";

let dfaStateId = 0;
function getDFAStateId() {
  return dfaStateId++;
}

class DFAState {
  constructor(nfaStates, isAccept = false) {
    this.id = getDFAStateId();
    this.nfaStates = nfaStates; // Set of NFAState
    this.transitions = new Map(); // Map<symbol, DFAState>
    this.isAccept = isAccept;
  }
}

class DFA {
  constructor(start) {
    this.start = start;
    this.states = new Set();
  }
}

// Compute ε-closure of a set of NFA states
function epsilonClosure(states) {
  const stack = [...states];
  const result = new Set(states);

  while (stack.length > 0) {
    const state = stack.pop();
    for (const { symbol, state: target } of state.transitions) {
      if (symbol === 'ε' && !result.has(target)) {
        result.add(target);
        stack.push(target);
      }
    }
  }

  return result;
}

// Move from a set of NFA states on a symbol
function move(states, symbol) {
  const result = new Set();
  for (const state of states) {
    for (const { symbol: s, state: target } of state.transitions) {
      if (s === symbol) {
        result.add(target);
      }
    }
  }
  return result;
}

// Main conversion function
function nfaToDfa(nfa) {
  dfaStateId = 0; // reset DFA ID counter

  const startClosure = epsilonClosure(new Set([nfa.start]));
  const isStartAccept = startClosure.has(nfa.accept);
  const startDFAState = new DFAState(startClosure, isStartAccept);

  const dfaStates = new Map(); // key: stringified nfaStates ids, value: DFAState
  const unmarked = [startDFAState];

  dfaStates[stateSetId(startClosure)] = startDFAState;

  while (unmarked.length > 0) {
    const dfaState = unmarked.pop();

    const symbolSet = new Set();
    for (const nfaState of dfaState.nfaStates) {
      for (const { symbol } of nfaState.transitions) {
        if (symbol !== 'ε') {
          symbolSet.add(symbol);
        }
      }
    }

    for (const symbol of symbolSet) {
      const moveSet = move(dfaState.nfaStates, symbol);
      const closure = epsilonClosure(moveSet);
      const key = stateSetId(closure);

      if (!dfaStates[key]) {
        const isAccept = closure.has(nfa.accept);
        const newDFAState = new DFAState(closure, isAccept);
        dfaStates[key] = newDFAState;
        unmarked.push(newDFAState);
      }

      dfaState.transitions.set(symbol, dfaStates[key]);
    }
  }

  const allStates = new Set(Object.values(dfaStates));
  return new DFA(startDFAState, allStates);
}

function stateSetId(stateSet) {
  return [...stateSet].map(s => s.id).sort((a, b) => a - b).join(',');
}

function displayDFA(dfa) {
  const visited = new Set();
  const queue = [dfa.start];

  console.log('=== DFA Visualization ===');
  console.log(`Start State: ${dfa.start.id}`);

  const acceptStates = [];

  while (queue.length > 0) {
    const state = queue.shift();
    if (visited.has(state.id)) continue;
    visited.add(state.id);

    if (state.isAccept) {
      acceptStates.push(state.id);
    }

    console.log(`\nState ${state.id}${state.isAccept ? ' (accept)' : ''}:`);
    for (const [symbol, target] of state.transitions) {
      console.log(`  --[${symbol}]--> ${target.id}`);
      if (!visited.has(target.id)) {
        queue.push(target);
      }
    }
  }

  console.log('\nAccept States:', acceptStates.join(', ') || '(none)');
  console.log('==========================');
}

function buildDFAFromRegex(regex) {
  const parser = new Parser();
  const ast = parser.parse(regex);
  const nfaInstance = nfa.buildFromAST(ast);
  const dfaInstance = nfaToDfa(nfaInstance);
  // displayDFA(dfaInstance);
  return dfaInstance;
}

export default {
  DFA,
  DFAState,
  nfaToDfa,
  displayDFA,
  epsilonClosure,
  move,
  stateSetId,
  buildDFAFromRegex,
}