<template>
  <v-layout>
    <v-app-bar density="compact" flat>
      <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
      <template #append>
        <v-btn icon size="small" @click="toggleTheme($event)">
          <v-icon>{{ account.user.theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props" size="small">
              <v-icon>{{ roleIcon }}</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="r in roles"
              :key="r.value"
              :active="account.user.role === r.value"
              @click="account.setRole(r.value)"
            >
              <template #prepend>
                <v-icon>{{ r.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ r.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main ref="mainRef" style="overflow: hidden">
      <slot />
    </v-main>

    <v-bottom-navigation v-model="activeTab" grow>
      <v-btn
        v-for="tab in currentTabs"
        :key="tab.value"
        :value="tab.value"
        @click="router.push(tab.to)"
      >
        <v-icon>{{ tab.icon }}</v-icon>
        <span>{{ tab.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script lang="ts" setup>
  import type { UserRole } from '@/stores/account'
  import { computed, ref, useTemplateRef, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  // import { useSwipe } from '@/composables/useSwipe'
  import { useThemeTransition } from '@/composables/useThemeTransition'
  import { useAccountStore } from '@/stores/account'

  const account = useAccountStore()
  const { toggleTheme } = useThemeTransition()
  const router = useRouter()
  const route = useRoute()
  const mainRef = useTemplateRef('mainRef')

  const roles: { value: UserRole, label: string, icon: string }[] = [
    { value: 'student', label: 'Студент', icon: 'mdi-school' },
    { value: 'organizer', label: 'Организатор', icon: 'mdi-calendar-edit' },
    { value: 'admin', label: 'Админ', icon: 'mdi-shield-crown' },
  ]

  const studentTabs = [
    { value: 'events', label: 'События', icon: 'mdi-calendar', to: '/' },
    { value: 'my', label: 'Мои', icon: 'mdi-ticket', to: '/my' },
    { value: 'profile', label: 'Профиль', icon: 'mdi-account', to: '/profile' },
  ]

  const organizerTabs = [
    { value: 'events', label: 'События', icon: 'mdi-calendar-edit', to: '/organizer' },
    { value: 'scanner', label: 'Сканер', icon: 'mdi-qrcode-scan', to: '/organizer/scanner' },
    { value: 'reports', label: 'Отчёты', icon: 'mdi-chart-bar', to: '/organizer/reports' },
    { value: 'profile', label: 'Профиль', icon: 'mdi-account', to: '/profile' },
  ]

  const adminTabs = [
    { value: 'dashboard', label: 'Дашборд', icon: 'mdi-view-dashboard', to: '/admin' },
    { value: 'institutes', label: 'Институты', icon: 'mdi-domain', to: '/admin/institutes' },
    { value: 'reports', label: 'Отчёты', icon: 'mdi-file-chart', to: '/admin/reports' },
    { value: 'profile', label: 'Профиль', icon: 'mdi-account', to: '/profile' },
  ]

  const currentTabs = computed(() => {
    if (account.isOrganizer) return organizerTabs
    if (account.isAdmin) return adminTabs
    return studentTabs
  })

  const activeTab = ref('events')

  const roleIcon = computed(() => {
    return roles.find(r => r.value === account.user.role)?.icon ?? 'mdi-account'
  })

  const pageTitle = computed(() => {
    return currentTabs.value.find(t => t.to === route.path)?.label ?? 'СКФУ События'
  })

  watch(() => route.path, path => {
    const tab = currentTabs.value.find(t => t.to === path)
    if (tab) activeTab.value = tab.value
  }, { immediate: true })

  // const currentTabIndex = computed(() => {
  //   return currentTabs.value.findIndex(t => t.to === route.path)
  // })

  // function goToTabByOffset (offset: number) {
  //   const tabs = currentTabs.value
  //   const next = currentTabIndex.value + offset
  //   if (next >= 0 && next < tabs.length) {
  //     router.push(tabs[next].to)
  //   }
  // }

  // useSwipe(
  //   () => (mainRef.value as unknown as { $el: HTMLElement })?.$el ?? null,
  //   {
  //     onSwipeLeft: () => goToTabByOffset(1),
  //     onSwipeRight: () => goToTabByOffset(-1),
  //   },
  // )
</script>
