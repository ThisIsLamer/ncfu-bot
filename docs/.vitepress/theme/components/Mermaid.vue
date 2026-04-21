<template>
  <div class="mermaid-wrapper">
    <div v-if="loading" class="mermaid-loading">Загрузка диаграммы...</div>
    <div v-show="!loading" ref="mermaidRef" class="mermaid-diagram"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, useSlots, computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  graph?: string
}>()

const slots = useSlots()
const { isDark } = useData()
const mermaidRef = ref<HTMLElement>()
const loading = ref(true)

const diagramSource = computed(() => {
  if (props.graph) return props.graph
  const slot = slots.default?.()
  if (!slot?.length) return ''
  const extractText = (vnode: any): string => {
    if (typeof vnode === 'string') return vnode
    if (typeof vnode.children === 'string') return vnode.children
    if (Array.isArray(vnode.children)) {
      return vnode.children.map(extractText).join('')
    }
    return ''
  }
  return slot.map(extractText).join('').trim()
})

let counter = 0

// @ts-ignore
const renderDiagram = async () => {
  if (!mermaidRef.value || !diagramSource.value) return
  loading.value = true
  try {
    // @ts-ignore
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark.value ? 'dark' : 'default',
      securityLevel: 'strict',
    })
    const id = 'mermaid-' + Date.now() + '-' + (counter++)
    const { svg } = await mermaid.render(id, diagramSource.value)
    mermaidRef.value.innerHTML = svg
  } catch (error) {
    console.error('Mermaid render error:', error)
    mermaidRef.value.innerHTML = '<pre class="mermaid-error">Ошибка рендера диаграммы</pre>'
  } finally {
    loading.value = false
  }
}

onMounted(renderDiagram)
watch(isDark, renderDiagram)
</script>

<style scoped>
.mermaid-wrapper {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  overflow-x: auto;
}
.mermaid-diagram {
  display: flex;
  justify-content: center;
  align-items: center;
}
.mermaid-diagram :deep(svg) {
  max-width: 100%;
  height: auto;
}
.mermaid-loading {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
}
.mermaid-error {
  color: var(--vp-c-danger-1);
  padding: 1rem;
}
</style>
