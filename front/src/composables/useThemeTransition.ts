import { useTheme } from 'vuetify'
import { useAccountStore } from '@/stores/account'

function getClickPosition (event?: MouseEvent | TouchEvent): { x: number, y: number } {
  if (event && 'clientX' in event) {
    return { x: event.clientX, y: event.clientY }
  }
  if (event && 'touches' in event && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
  const el = document.activeElement as HTMLElement | null
  if (el) {
    const rect = el.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

export function useThemeTransition () {
  const theme = useTheme()
  const account = useAccountStore()

  function applyTheme () {
    account.toggleTheme()
    theme.global.name.value = account.user.theme === 'dark' ? 'ncfuDark' : 'ncfuLight'
  }

  function toggleTheme (event?: MouseEvent | TouchEvent) {
    const { x, y } = getClickPosition(event)

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        applyTheme()
      })

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })

      return
    }

    applyTheme()
  }

  return { toggleTheme }
}
