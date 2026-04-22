<template>
  <v-app>
    <transition
      mode="out-in"
      name="loader-fade"
    >
      <!-- Загрузка -->
      <AppLoader v-if="showLoader" />

      <!-- Не зарегистрирован -->
      <div
        v-else-if="account.authState === 'not-registered'"
        class="d-flex flex-column align-center justify-center fill-height pa-6"
      >
        <v-icon
          class="mb-4"
          color="primary"
          size="80"
        >
          mdi-account-plus-outline
        </v-icon>
        <div class="text-h6 text-center mb-2">Завершите регистрацию</div>
        <div class="text-body-2 text-medium-emphasis text-center mb-6">
          Попросите администратора выдать вам QR-код, затем отсканируйте его для завершения регистрации
        </div>
        <v-btn
          block
          color="primary"
          :loading="registering"
          max-height="40"
          prepend-icon="mdi-qrcode-scan"
          rounded="lg"
          size="large"
          @click="scanAndRegister"
        >
          Сканировать QR-код
        </v-btn>
        <v-alert
          v-if="registerError"
          class="mt-4 w-100"
          color="error"
          icon="mdi-alert-circle"
          variant="tonal"
        >
          {{ registerError }}
        </v-alert>
      </div>

      <!-- Ошибка -->
      <div
        v-else-if="account.authState === 'error'"
        class="d-flex flex-column align-center justify-center fill-height pa-6"
      >
        <v-icon
          class="mb-4"
          color="error"
          size="80"
        >
          mdi-alert-circle-outline
        </v-icon>
        <div class="text-h6 text-center mb-2">Ошибка подключения</div>
        <div class="text-body-2 text-medium-emphasis text-center mb-6">
          Не удалось подключиться к серверу
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          @click="account.fetchAccount()"
        >
          Повторить
        </v-btn>
      </div>

      <!-- Приложение -->
      <div
        v-else
        class="app-content"
      >
        <DefaultLayout>
          <router-view v-slot="{ Component, route }">
            <transition
              mode="out-in"
              :name="transitionName"
            >
              <component
                :is="Component"
                :key="route.path"
              />
            </transition>
          </router-view>
        </DefaultLayout>
      </div>
    </transition>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      location="top"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="snackbar.visible = false"
        />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import AppLoader from '@/components/AppLoader.vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import { useAccountStore } from '@/stores/account'
  import { useSnackbar } from '@/stores/snackbar'

  const account = useAccountStore()
  const snackbar = useSnackbar()
  const theme = useTheme()
  const router = useRouter()
  const transitionName = ref('fade-slide-right')
  const registering = ref(false)
  const registerError = ref('')
  const showLoader = ref(true)
  const minLoaderDone = ref(false)

  const MIN_LOADER_MS = 2200

  onMounted(async () => {
    const timerPromise = new Promise<void>(resolve => setTimeout(() => {
      minLoaderDone.value = true
      resolve()
    }, MIN_LOADER_MS))

    await Promise.all([
      account.fetchAccount(),
      timerPromise,
    ])

    showLoader.value = false
  })

  const vuetifyThemeName = computed(() =>
    account.user?.theme === 'dark' ? 'ncfuDark' : 'ncfuLight',
  )

  watch(vuetifyThemeName, name => {
    theme.global.name.value = name
  }, { immediate: true })

  const routeOrder = ['/', '/my', '/organizer/events', '/organizer/scanner', '/organizer/reports', '/admin', '/admin/institutes', '/admin/reports', '/profile']

  watch(() => router.currentRoute.value.path, (to, from) => {
    const toIndex = routeOrder.indexOf(to)
    const fromIndex = routeOrder.indexOf(from)
    transitionName.value = toIndex >= fromIndex ? 'fade-slide-left' : 'fade-slide-right'
  })

  async function scanAndRegister () {
    registerError.value = ''

    if (!window.WebApp) {
      registerError.value = 'WebApp SDK не загружен. Откройте приложение через мессенджер MAX.'
      return
    }

    if (!window.WebApp.openCodeReader) {
      registerError.value = `QR-сканер недоступен (платформа: ${window.WebApp.platform || 'unknown'})`
      return
    }

    registering.value = true
    try {
      const result = await window.WebApp.openCodeReader()
      const value = result?.value

      if (!value) {
        registering.value = false
        return
      }

      const success = await account.register(value)
      registering.value = false

      if (!success) {
        registerError.value = 'Не удалось завершить регистрацию. Проверьте QR-код.'
      }
    } catch (error: any) {
      registering.value = false
      registerError.value = `Ошибка сканирования: ${error?.message || error?.error?.code || 'отменено'}`
    }
  }
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

  .loader-fade-enter-active {
    transition: opacity 0.4s ease;
  }

  .loader-fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .loader-fade-enter-from,
  .loader-fade-leave-to {
    opacity: 0;
  }

  .app-content {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
