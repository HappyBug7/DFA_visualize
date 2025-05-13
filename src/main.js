import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createStore } from 'vuex'
import naive from 'naive-ui'

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

app.use(store)
app.use(naive)
app.mount('#app')
