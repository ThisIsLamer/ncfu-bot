<template>
  <v-container class="pa-3 d-flex flex-column page-fill">
    <!-- Поиск -->
    <v-text-field
      v-model="search"
      class="mb-3 flex-shrink-0"
      density="compact"
      hide-details
      placeholder="Найти мероприятие..."
      prepend-inner-icon="mdi-magnify"
      rounded
      style="max-height: 40px"
      variant="outlined"
    />

    <!-- Фильтры -->
    <v-chip-group v-model="selectedFilter" class="mb-2 flex-shrink-0" mandatory>
      <v-chip
        v-for="f in filterNames"
        :key="f"
        filter
        size="small"
        variant="outlined"
      >
        {{ f }}
      </v-chip>
    </v-chip-group>

    <!-- Загрузка -->
    <div
      v-if="loading"
      class="d-flex justify-center py-8"
    >
      <v-progress-circular indeterminate />
    </div>

    <!-- Пустое состояние -->
    <div
      v-else-if="filteredEvents.length === 0"
      class="d-flex flex-column align-center justify-center flex-grow-1"
    >
      <v-icon
        class="mb-3"
        color="grey"
        size="72"
      >
        mdi-calendar-blank-outline
      </v-icon>
      <div class="text-h6 text-medium-emphasis mb-1">Мероприятий пока нет</div>
      <div class="text-body-2 text-medium-emphasis">Загляните позже</div>
    </div>

    <!-- Карточки мероприятий -->
    <div
      v-else
      class="events-scroll"
    >
      <v-card
        v-for="event in filteredEvents"
        :key="event.guid"
        class="mb-3"
        rounded="lg"
        style="cursor: pointer"
        variant="elevated"
        @click="$router.push(`/events/${event.guid}`)"
      >
        <!-- Баннер -->
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
            <v-icon class="mr-1" size="16">mdi-calendar</v-icon>
            {{ formatDate(event.date) }}
          </div>

          <div class="d-flex align-center text-body-2 text-medium-emphasis mb-1">
            <v-icon class="mr-1" size="16">mdi-map-marker</v-icon>
            {{ event.location }}
          </div>

          <div class="d-flex align-center text-body-2 text-medium-emphasis">
            <v-icon class="mr-1" size="16">mdi-account-group</v-icon>
            {{ event.registered }} / {{ event.capacity }}
          </div>
        </v-card-text>

        <!-- Прогресс заполненности -->
        <v-progress-linear
          class="mx-4"
          :color="event.registered >= event.capacity ? 'error' : 'primary'"
          height="3"
          :model-value="(event.registered / event.capacity) * 100"
          rounded
        />

        <v-card-actions class="px-4 pb-3 pt-2">
          <v-chip
            :color="event.registered >= event.capacity ? 'error' : 'success'"
            size="x-small"
            variant="tonal"
          >
            {{ event.registered >= event.capacity ? 'Мест нет' : 'Есть места' }}
          </v-chip>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
  import type { EventResponse, EventTypeResponse } from '@/api/types'
  import { computed, onMounted, ref } from 'vue'
  import { eventsApi, isApiError } from '@/api'
  import { formatDate } from '@/utils/date'

  const search = ref('')
  const selectedFilter = ref(0)
  const loading = ref(false)

  const allEvents = ref<EventResponse[]>([])
  const eventTypes = ref<EventTypeResponse[]>([])

  const filterNames = computed(() => ['Все', ...eventTypes.value.map(t => t.name)])

  const filteredEvents = computed(() => {
    let result = allEvents.value

    // Фильтр по типу
    if (selectedFilter.value > 0) {
      const typeName = filterNames.value[selectedFilter.value]
      result = result.filter(e => e.types.includes(typeName))
    }

    // Поиск по названию и описанию
    const q = search.value.trim().toLowerCase()
    if (q) {
      result = result.filter(e =>
        e.title.toLowerCase().includes(q)
        || e.description.toLowerCase().includes(q)
        || e.location.toLowerCase().includes(q),
      )
    }

    return result
  })

  async function fetchData () {
    loading.value = true

    const [eventsResult, typesResult] = await Promise.all([
      eventsApi.getAll(),
      eventsApi.getTypes(),
    ])

    loading.value = false

    if (!isApiError(eventsResult)) {
      allEvents.value = eventsResult.data
    }

    if (!isApiError(typesResult)) {
      eventTypes.value = typesResult.data
    }
  }

  onMounted(fetchData)
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
</style>
