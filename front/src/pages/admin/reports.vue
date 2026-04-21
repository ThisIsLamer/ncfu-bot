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
      <div class="d-flex ga-3 mb-4 flex-wrap">
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
            <div class="text-h5 font-weight-bold">{{ stats.totalUsers }}</div>
            <div class="text-caption text-medium-emphasis">Пользователей</div>
          </v-card-text>
        </v-card>
      </div>

      <div class="d-flex ga-3 mb-4 flex-wrap">
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
            <div class="text-h5 font-weight-bold">{{ stats.attendanceRate }}%</div>
            <div class="text-caption text-medium-emphasis">Посещаемость</div>
          </v-card-text>
        </v-card>
      </div>

      <!-- По типам -->
      <div
        v-if="stats.byType.length > 0"
        class="mb-4"
      >
        <div class="text-subtitle-2 font-weight-bold mb-2">По типам</div>
        <v-chip
          v-for="t in stats.byType"
          :key="t.name"
          class="mr-2 mb-2"
          variant="tonal"
        >
          {{ t.name }}: {{ t.count }}
        </v-chip>
      </div>

      <!-- Таблица мероприятий -->
      <div class="text-subtitle-2 font-weight-bold mb-2">Мероприятия</div>
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
            <span>Рег: {{ e.registered }}/{{ e.capacity }} ({{ e.fillRate }}%)</span>
            <span>Посещ: {{ e.attended }} ({{ e.attendRate }}%)</span>
          </div>
          <v-progress-linear
            class="mt-2"
            :color="e.fillRate >= 100 ? 'error' : 'primary'"
            height="3"
            :model-value="e.fillRate"
            rounded
          />
        </v-card-text>
      </v-card>
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
