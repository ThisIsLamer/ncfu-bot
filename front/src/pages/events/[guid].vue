<template>
  <v-container class="pa-3 d-flex flex-column page-fill">
    <!-- Шапка -->
    <div class="d-flex align-center mb-3 flex-shrink-0">
      <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="$router.back()" />
      <span class="text-subtitle-1 font-weight-bold ml-1 text-truncate">
        {{ event?.title ?? 'Загрузка...' }}
      </span>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate />
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="d-flex flex-column align-center justify-center flex-grow-1">
      <v-icon class="mb-3" color="error" size="72">mdi-alert-circle-outline</v-icon>
      <div class="text-h6 text-medium-emphasis mb-1">Мероприятие не найдено</div>
      <v-btn
        class="mt-3"
        color="primary"
        size="small"
        variant="tonal"
        @click="$router.back()"
      >
        Назад
      </v-btn>
    </div>

    <!-- Контент -->
    <div v-else-if="event" class="event-scroll">
      <!-- Баннер -->
      <div class="event-banner d-flex align-end pa-3" :style="{ background: event.color }">
        <v-chip
          v-for="t in event.types"
          :key="t"
          class="font-weight-medium mr-1"
          color="white"
          size="x-small"
          variant="flat"
        >
          {{ t }}
        </v-chip>
      </div>

      <!-- Заголовок -->
      <div class="text-h6 font-weight-bold mt-4 mb-1 px-1">{{ event.title }}</div>
      <v-divider class="mb-3" />

      <!-- Инфо -->
      <div class="d-flex flex-column ga-2 px-1 mb-4">
        <div class="d-flex align-center text-body-2">
          <v-icon class="mr-2" size="18">mdi-calendar</v-icon>
          {{ formatDate(event.date) }}
        </div>
        <div class="d-flex align-center text-body-2">
          <v-icon class="mr-2" size="18">mdi-map-marker</v-icon>
          {{ event.location }}
        </div>
        <div class="d-flex align-center text-body-2">
          <v-icon class="mr-2" size="18">mdi-account-group</v-icon>
          {{ event.registered }} из {{ event.capacity }} мест
        </div>
        <div v-if="event.types.length > 0" class="d-flex align-center text-body-2">
          <v-icon class="mr-2" size="18">mdi-tag-outline</v-icon>
          Тип: {{ event.types.join(', ') }}
        </div>
      </div>

      <!-- Прогресс -->
      <v-progress-linear
        class="mb-4"
        :color="event.registered >= event.capacity ? 'error' : 'primary'"
        height="4"
        :model-value="(event.registered / event.capacity) * 100"
        rounded
      />

      <!-- Описание -->
      <div class="px-1 mb-4">
        <div class="text-subtitle-2 font-weight-bold mb-1">Описание:</div>
        <div class="text-body-2" style="white-space: pre-wrap">{{ event.description }}</div>
      </div>

      <!-- Мероприятие прошло -->
      <div
        v-if="isPast"
        class="d-flex flex-column align-center mb-4 py-4"
      >
        <v-icon
          class="mb-2"
          color="grey"
          size="48"
        >
          mdi-calendar-check
        </v-icon>
        <div class="text-body-1 text-medium-emphasis">Мероприятие завершено</div>
      </div>

      <!-- QR-код (если зарегистрирован и не прошло) -->
      <div
        v-else-if="registrationGuid"
        class="d-flex flex-column align-center mb-4"
      >
        <div class="text-subtitle-2 font-weight-bold mb-2">Вы зарегистрированы</div>
        <QRCodeVue3
          :background-options="{ color: 'transparent' }"
          :corners-dot-options="{ type: 'dot', color: '#FFFFFF' }"
          :corners-square-options="{ type: 'extra-rounded', color: '#FFFFFF' }"
          :dots-options="{ type: 'rounded', color: '#FFFFFF' }"
          :height="200"
          :value="registrationGuid"
          :width="200"
        />
        <div class="text-caption text-medium-emphasis mt-2">Покажите QR-код организатору</div>
      </div>

      <!-- Кнопка регистрации (если не зарегистрирован и не прошло) -->
      <v-btn
        v-else
        block
        :color="event.registered >= event.capacity ? 'grey' : 'primary'"
        :disabled="event.registered >= event.capacity || registering"
        :loading="registering"
        rounded="lg"
        size="large"
        @click="registerForEvent"
      >
        {{ event.registered >= event.capacity ? 'Мест нет' : 'Зарегистрироваться' }}
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
  import type { EventResponse } from '@/api/types'
  import QRCodeVue3 from 'qrcode-vue3'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { eventsApi, isApiError } from '@/api'
  import { formatDate } from '@/utils/date'

  const route = useRoute()
  const guid = (route.params as { guid: string }).guid

  const event = ref<EventResponse | null>(null)
  const loading = ref(false)
  const error = ref(false)
  const registrationGuid = ref<string | null>(null)
  const registering = ref(false)

  const isPast = computed(() => {
    if (!event.value) return false
    return new Date(event.value.date) < new Date()
  })

  async function fetchEvent () {
    loading.value = true

    const [eventResult, regResult] = await Promise.all([
      eventsApi.getOne(guid),
      eventsApi.checkRegistration(guid),
    ])

    loading.value = false

    if (isApiError(eventResult)) {
      error.value = true
      return
    }

    event.value = eventResult.data

    if (!isApiError(regResult) && regResult.data) {
      registrationGuid.value = regResult.data.guid
    }
  }

  async function registerForEvent () {
    registering.value = true
    const result = await eventsApi.register({ guidEvent: guid })
    registering.value = false

    if (isApiError(result)) return

    registrationGuid.value = result.data.guid
    await fetchEvent()
  }

  onMounted(fetchEvent)
</script>

<style scoped>
.page-fill {
  height: 100%;
  overflow: hidden;
}

.event-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
}

.event-banner {
  height: 120px;
  border-radius: 12px;
}
</style>
