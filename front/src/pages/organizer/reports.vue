<template>
  <v-container class="pa-3">
    <div
      v-if="loading"
      class="d-flex justify-center py-8"
    >
      <v-progress-circular indeterminate />
    </div>

    <template v-else-if="stats">
      <!-- Сводка -->
      <div class="d-flex ga-3 mb-4">
        <v-card
          class="flex-grow-1"
          variant="tonal"
        >
          <v-card-text class="text-center">
            <div class="text-h5 font-weight-bold">{{ stats.totalEvents }}</div>
            <div class="text-caption text-medium-emphasis">Мероприятий</div>
          </v-card-text>
        </v-card>
        <v-card
          class="flex-grow-1"
          variant="tonal"
        >
          <v-card-text class="text-center">
            <div class="text-h5 font-weight-bold">{{ stats.attendanceRate }}%</div>
            <div class="text-caption text-medium-emphasis">Посещаемость</div>
          </v-card-text>
        </v-card>
      </div>

      <div class="d-flex ga-3 mb-4">
        <v-card
          class="flex-grow-1"
          variant="tonal"
        >
          <v-card-text class="text-center">
            <div class="text-h5 font-weight-bold">{{ stats.totalRegistrations }}</div>
            <div class="text-caption text-medium-emphasis">Регистраций</div>
          </v-card-text>
        </v-card>
        <v-card
          class="flex-grow-1"
          variant="tonal"
        >
          <v-card-text class="text-center">
            <div class="text-h5 font-weight-bold">{{ stats.totalAttended }}</div>
            <div class="text-caption text-medium-emphasis">Посещений</div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Мероприятия -->
      <div class="text-subtitle-2 font-weight-bold mb-2">Детализация</div>
      <v-card
        v-for="e in stats.events"
        :key="e.guid"
        class="mb-2"
        variant="tonal"
      >
        <v-card-text class="py-2">
          <div class="text-body-2 font-weight-bold mb-1">{{ e.title }}</div>
          <div class="d-flex ga-4 text-caption text-medium-emphasis flex-wrap">
            <span>{{ formatDate(e.date) }}</span>
            <span>{{ e.registered }}/{{ e.capacity }} зарег.</span>
            <span>{{ e.attended }} посетили ({{ e.attendRate }}%)</span>
          </div>
          <v-progress-linear
            class="mt-2"
            :color="e.attendRate >= 80 ? 'success' : e.attendRate >= 50 ? 'warning' : 'error'"
            height="3"
            :model-value="e.attendRate"
            rounded
          />
        </v-card-text>
      </v-card>

      <div
        v-if="stats.events.length === 0"
        class="text-center py-6"
      >
        <v-icon
          class="mb-2"
          color="grey"
          size="48"
        >
          mdi-chart-box-outline
        </v-icon>
        <div class="text-body-2 text-medium-emphasis">Нет данных для отчёта</div>
      </div>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
  import type { EventStats } from '@/api/types'
  import { onMounted, ref } from 'vue'
  import { eventsApi, isApiError } from '@/api'
  import { formatDate } from '@/utils/date'

  const loading = ref(false)
  const stats = ref<EventStats | null>(null)

  onMounted(async () => {
    loading.value = true
    const result = await eventsApi.getStats()
    loading.value = false
    if (!isApiError(result)) stats.value = result.data
  })
</script>
