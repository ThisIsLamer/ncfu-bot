import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnackbar = defineStore('snackbar', () => {
  const visible = ref(false)
  const text = ref('')
  const color = ref('error')
  const timeout = ref(4000)

  function show (message: string, options?: { color?: string, timeout?: number }) {
    text.value = message
    color.value = options?.color ?? 'error'
    timeout.value = options?.timeout ?? 4000
    visible.value = true
  }

  function success (message: string) {
    show(message, { color: 'success' })
  }

  return { visible, text, color, timeout, show, success }
})
