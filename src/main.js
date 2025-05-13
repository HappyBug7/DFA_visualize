import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createStore } from 'vuex'
import { Parser } from './ast/parser'

const store = createStore({
  state: {
    regex: '',   
    input: '',   
    dfaState: null,
    isMatch: false,
  },
  mutations: {
    setRegex(state, regex) {
      state.regex = regex
    },
    setInput(state, input) {
      state.input = input
    },
    setDFAState(state, dfaState) {
      state.dfaState = dfaState
    },
    setIsMatch(state, isMatch) {
      state.isMatch = isMatch
    }
  },
  actions: {
    updateRegex({ commit }, regex) {
      commit('setRegex', regex)
    },
    updateInput({ commit }, input) {
      commit('setInput', input)
    }
  },
  getters: {
    getRegex(state) {
      return state.regex
    },
    getInput(state) {
      return state.input
    },
    getDFAState(state) {
      return state.dfaState
    },
    getIsMatch(state) {
      return state.isMatch
    }
  }
})

const app = createApp(App)
const parser = new Parser()
parser.display(parser.parse('(a|b)c*'))

app.use(store)
app.mount('#app')
