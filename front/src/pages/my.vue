<template>
  <v-container class="pa-3 d-flex flex-column page-fill">
    <v-tabs
      v-model="tab"
      class="flex-shrink-0 mb-3"
      grow
      style="max-height: 50px;"
    >
      <v-tab value="upcoming">Предстоящие</v-tab>
      <v-tab value="past">Прошедшие</v-tab>
    </v-tabs>

    <!-- Загрузка -->
    <div
      v-if="loading"
      class="d-flex justify-center py-8"
    >
      <v-progress-circular indeterminate />
    </div>

    <!-- Пустое состояние -->
    <div
      v-else-if="currentEvents.length === 0"
      class="d-flex flex-column align-center justify-center flex-grow-1"
    >
      <v-icon
        class="mb-3"
        color="grey"
        size="72"
      >
        {{ tab === 'upcoming' ? 'mdi-calendar-check-outline' : 'mdi-calendar-clock-outline' }}
      </v-icon>
      <div class="text-h6 text-medium-emphasis mb-1">
        {{ tab === 'upcoming' ? 'Нет предстоящих мероприятий' : 'Нет прошедших мероприятий' }}
      </div>
      <div class="text-body-2 text-medium-emphasis">
        {{ tab === 'upcoming' ? 'Зарегистрируйтесь на событие' : 'Здесь появятся завершённые события' }}
      </div>
    </div>

    <!-- Карточки -->
    <div
      v-else
      class="events-scroll"
    >
      <v-card
        v-for="event in currentEvents"
        :key="event.guid"
        class="mb-3"
        :class="{ 'opacity-60': tab === 'past' }"
        rounded="lg"
        style="cursor: pointer"
        variant="elevated"
        @click="$router.push(`/events/${event.guid}`)"
      >
        <div
          class="event-banner d-flex align-end pa-3"
          :style="{ background: event.color }"
        >
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

        <v-card-text class="pb-2">
          <div class="text-subtitle-1 font-weight-bold mb-1">{{ event.title }}</div>

          <div class="d-flex align-center text-body-2 text-medium-emphasis mb-1">
            <v-icon
              class="mr-1"
              size="16"
            >
              mdi-calendar
            </v-icon>
            {{ formatDate(event.date) }}
          </div>

          <div class="d-flex align-center text-body-2 text-medium-emphasis mb-1">
            <v-icon
              class="mr-1"
              size="16"
            >
              mdi-map-marker
            </v-icon>
            {{ event.location }}
          </div>

          <div class="d-flex align-center text-body-2 text-medium-emphasis">
            <v-icon
              class="mr-1"
              size="16"
            >
              mdi-account-group
            </v-icon>
            {{ event.registered }} / {{ event.capacity }}
          </div>
        </v-card-text>

        <v-progress-linear
          class="mx-4"
          :color="event.registered >= event.capacity ? 'error' : 'primary'"
          height="3"
          :model-value="(event.registered / event.capacity) * 100"
          rounded
        />

        <v-card-actions class="px-4 pb-3 pt-2">
          <v-chip
            :color="tab === 'past' ? 'grey' : (event.registered >= event.capacity ? 'error' : 'success')"
            size="x-small"
            variant="tonal"
          >
            {{ tab === 'past' ? 'Завершено' : (event.registered >= event.capacity ? 'Мест нет' : 'Есть места') }}
          </v-chip>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
  import type { EventResponse } from '@/api/types'
  import { computed, onMounted, ref } from 'vue'
  import { eventsApi, isApiError } from '@/api'
  import { formatDate } from '@/utils/date'

  const tab = ref('upcoming')
  const loading = ref(false)
  const events = ref<EventResponse[]>([])

  const now = new Date()

  const upcomingEvents = computed(() =>
    events.value.filter(e => new Date(e.date) >= now),
  )

  const pastEvents = computed(() =>
    events.value.filter(e => new Date(e.date) < now),
  )

  const currentEvents = computed(() =>
    tab.value === 'upcoming' ? upcomingEvents.value : pastEvents.value,
  )

  async function fetchMyEvents () {
    loading.value = true
    const result = await eventsApi.getMy()
    loading.value = false
    if (isApiError(result)) return
    events.value = result.data
  }

  onMounted(fetchMyEvents)
</script>

<style scoped>
.page-fill {
  height: 100%;
  overflow: hidden;
}

.events-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
}

.event-banner {
  height: 80px;
  border-radius: 12px 12px 0 0;
}

.opacity-60 {
  opacity: 0.6;
}
</style>
