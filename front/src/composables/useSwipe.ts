import { onMounted, onUnmounted, ref } from 'vue'

interface SwipeOptions {
  minDistance?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipe (el: () => HTMLElement | null, options: SwipeOptions) {
  const startX = ref(0)
  const startY = ref(0)
  const minDistance = options.minDistance ?? 50

  function onTouchStart (e: TouchEvent) {
    startX.value = e.touches[0].clientX
    startY.value = e.touches[0].clientY
  }

  function onTouchEnd (e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX.value
    const dy = e.changedTouches[0].clientY - startY.value

    // Игнорируем если вертикальный свайп сильнее горизонтального
    if (Math.abs(dy) > Math.abs(dx)) {
      return
    }
    if (Math.abs(dx) < minDistance) {
      return
    }

    if (dx < 0) {
      options.onSwipeLeft?.()
    } else {
      options.onSwipeRight?.()
    }
  }

  onMounted(() => {
    const element = el()
    if (!element) {
      return
    }
    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const element = el()
    if (!element) {
      return
    }
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchend', onTouchEnd)
  })
}
