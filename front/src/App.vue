<template>
  <v-app>
    <DefaultLayout>
      <router-view v-slot="{ Component, route }">
        <transition mode="out-in" :name="transitionName">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </DefaultLayout>
  </v-app>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import { useAccountStore } from '@/stores/account'

  const account = useAccountStore()
  const theme = useTheme()
  const router = useRouter()
  const transitionName = ref('fade-slide-right')

  const vuetifyThemeName = computed(() =>
    account.user.theme === 'dark' ? 'ncfuDark' : 'ncfuLight',
  )

  watch(vuetifyThemeName, name => {
    theme.global.name.value = name
  }, { immediate: true })

  const routeOrder = ['/', '/my', '/organizer', '/organizer/scanner', '/organizer/reports', '/admin', '/admin/institutes', '/admin/reports', '/profile']

  watch(() => router.currentRoute.value.path, (to, from) => {
    const toIndex = routeOrder.indexOf(to)
    const fromIndex = routeOrder.indexOf(from)
    transitionName.value = toIndex >= fromIndex ? 'fade-slide-left' : 'fade-slide-right'
  })
</script>

<style>
  .fade-slide-left-enter-active,
  .fade-slide-left-leave-active,
  .fade-slide-right-enter-active,
  .fade-slide-right-leave-active {
    transition: all 0.2s ease;
  }

  .fade-slide-left-enter-from {
    opacity: 0;
    transform: translateX(24px);
  }

  .fade-slide-left-leave-to {
    opacity: 0;
    transform: translateX(-24px);
  }

  .fade-slide-right-enter-from {
    opacity: 0;
    transform: translateX(-24px);
  }

  .fade-slide-right-leave-to {
    opacity: 0;
    transform: translateX(24px);
  }

  /* View Transition — отключаем дефолтный crossfade, наша анимация через clip-path */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  ::view-transition-old(root) {
    z-index: 1;
  }

  ::view-transition-new(root) {
    z-index: 9999;
  }
</style>
