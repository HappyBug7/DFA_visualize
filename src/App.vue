<script setup>
import { ref, onMounted } from 'vue'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import dfa from './dfa/dfa'
import { NPopover, NInput, NButton } from 'naive-ui'

const nodes = ref([])
const edges = ref([])

const regex = ref('abc');
const input = ref('');

const expanded = ref(false)
const result = ref(null)
const currentHighlight = ref(null)

function submit() {
  console.log('正则：', regex.value);
  console.log('输入：', input.value);
  updateDFA()
}

function runTest() {
  const dfaInstance = dfa.buildDFAFromRegex(regex.value)
  const flow = dfaToVueFlow(dfaInstance)
  nodes.value = flow.nodes
  edges.value = flow.edges
  simulateInput(input.value, dfaInstance)
}

async function simulateInput(input, dfa) {
  resetHighlight()
  result.value = null
  let current = dfa.start
  highlight(current.id)

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    await delay(700)
    const next = current.transitions.get(char)
    if (!next) {
      result.value = false
      return
    }
    current = next
    highlight(current.id)
  }

  await delay(500)
  result.value = current.isAccept
  await delay(2000)
  resetHighlight()
}

function highlight(id) {
  resetHighlight()

  nodes.value = nodes.value.map(node => {
    if (node.id === String(id)) {
      currentHighlight.value = node.id
      return {
        ...node,
        style: {
          ...node.style,
          border: '2px solid yellow',
          boxShadow: '0 0 8px yellow',
        },
      }
    }
    return node
  })
}

function resetHighlight() {
  if (currentHighlight.value === null) return

  nodes.value = nodes.value.map(node => {
    if (node.id === String(currentHighlight.value)) {
      const isAccept = node.label.includes('✅')
      return {
        ...node,
        style: {
          ...node.style,
          border: isAccept ? '2px solid green' : '1px solid gray',
          boxShadow: 'none',
        },
      }
    }
    return node
  })

  currentHighlight.value = null
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function dfaToVueFlow(_dfa) {
  const nodes = []
  const edges = []
  const visited = new Set()
  const queue = [_dfa.start]

  while (queue.length > 0) {
    const state = queue.shift()
    if (visited.has(state.id)) continue
    visited.add(state.id)

    nodes.push({
      id: String(state.id),
      label: `q${state.id}${state.isAccept ? ' ✅' : ''}`,
      position: { x: state.id * 150, y: 100 + (state.id % 2) * 150 }, // 简单位置逻辑
      data: { label: `q${state.id}` },
      style: {
        border: state.isAccept ? '2px solid green' : '1px solid gray',
        borderRadius: '999px',
        padding: '10px',
        background: '#fff',
        width: '100px',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
      }
    })

    for (const [symbol, target] of state.transitions) {
      edges.push({
        id: `e${state.id}-${target.id}-${symbol}`,
        source: String(state.id),
        target: String(target.id),
        label: symbol,
        type: 'default',
        animated: true
      })

      if (!visited.has(target.id)) {
        queue.push(target)
      }
    }
  }

  return { nodes, edges }
}

function updateDFA() {
  const dfaInstance = dfa.buildDFAFromRegex(regex.value)
  const { nodes: n, edges: e } = dfaToVueFlow(dfaInstance)
  nodes.value = n
  edges.value = e
}

onMounted(() => {
  updateDFA()
})

</script>

<template>
  <div class="app-container">
    <!-- 悬浮球 + 输入框 popover -->
    <div class="floating-ball-container">
      <n-popover
        trigger="hover"
        placement="bottom-start"
        :show-arrow="false"
      >
        <template #trigger>
          <div class="floating-ball"> </div>
        </template>
        <div class="popover-content">
          <n-input v-model:value="regex" placeholder="Enter regex" @input="submit" clearable class="mb-2" />
          <n-input v-model:value="input" placeholder="Enter input" @input="submit" clearable class="mb-2" />
          <n-button @click="runTest" class="mt-2">Run</n-button>
        </div>
      </n-popover>
    </div>

    <!-- 可视化区域 -->
    <div class="visualization">
        <div style="height: 100vh; width: 100vw; overflow: hidden;">
          <VueFlow :nodes="nodes" :edges="edges" />
        </div>
    </div>

    <div class="result" v-if="result !== null">
      <n-tag :type="result ? 'success' : 'error'">
        {{ result ? 'Matched ✅' : 'Not Matched ❌' }}
      </n-tag>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.floating-ball-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.floating-ball {
  width: 50px;
  height: 50px;
  background-color: #18a058;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.popover-content {
  display: flex;
  flex-direction: column;
  width: 200px;
}

.popover-content>* {
  margin: 5px;
}

.result {
  position: absolute;
  bottom: 16px;
  left: 16px;
}
</style>
