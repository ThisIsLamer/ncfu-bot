<template>
  <v-container class="d-flex flex-column align-center justify-center page-fill">
    <!-- Результат последнего сканирования -->
    <v-alert
      v-if="lastResult"
      class="mb-6 w-100"
      closable
      :color="lastResult.success ? 'success' : 'error'"
      :icon="lastResult.success ? 'mdi-check-circle' : 'mdi-alert-circle'"
      variant="tonal"
      @click:close="lastResult = null"
    >
      {{ lastResult.message }}
    </v-alert>

    <v-icon
      class="mb-4"
      color="primary"
      size="80"
    >
      mdi-qrcode-scan
    </v-icon>
    <div class="text-h6 mb-2">Сканер посещаемости</div>
    <div class="text-body-2 text-medium-emphasis mb-6 text-center">
      Отсканируйте QR-код студента для отметки посещения мероприятия
    </div>

    <v-btn
      block
      color="primary"
      :loading="scanning"
      max-height="35"
      prepend-icon="mdi-qrcode-scan"
      rounded="lg"
      size="large"
      @click="scan"
    >
      Сканировать
    </v-btn>

    <!-- Счётчик -->
    <div
      v-if="scanCount > 0"
      class="text-body-2 text-medium-emphasis mt-4"
    >
      Отмечено за сессию: {{ scanCount }}
    </div>
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { eventsApi, isApiError } from '@/api'

  const scanning = ref(false)
  const scanCount = ref(0)
  const lastResult = ref<{ success: boolean, message: string } | null>(null)

  async function scan () {
    if (!window.WebApp?.openCodeReader) {
      lastResult.value = { success: false, message: 'QR-сканер недоступен вне приложения' }
      return
    }

    scanning.value = true
    lastResult.value = null

    try {
      const { value } = await window.WebApp.openCodeReader()

      if (!value) {
        scanning.value = false
        return
      }

      const result = await eventsApi.attend(value)
      scanning.value = false

      if (isApiError(result)) {
        lastResult.value = { success: false, message: 'Ошибка: регистрация не найдена' }
        return
      }

      scanCount.value++
      lastResult.value = { success: true, message: 'Посещение отмечено' }
    } catch {
      scanning.value = false
      lastResult.value = { success: false, message: 'Сканирование отменено' }
    }
  }
</script>

<style scoped>
.page-fill {
  height: 100%;
}
</style>
