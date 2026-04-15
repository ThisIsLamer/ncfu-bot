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
        v-for="f in filters"
        :key="f"
        filter
        size="small"
        variant="outlined"
      >
        {{ f }}
      </v-chip>
    </v-chip-group>

    <!-- Карточки мероприятий -->
    <div class="events-scroll">
      <v-card
        v-for="event in events"
        :key="event.id"
        class="mb-3"
        rounded="lg"
        variant="elevated"
      >
        <!-- Баннер -->
        <div
          class="event-banner d-flex align-end pa-3"
          :style="{ background: event.gradient }"
        >
          <v-chip class="font-weight-medium" color="white" size="x-small" variant="flat">
            {{ event.type }}
          </v-chip>
        </div>

        <v-card-text class="pb-2">
          <div class="text-subtitle-1 font-weight-bold mb-1">{{ event.title }}</div>

          <div class="d-flex align-center text-body-2 text-medium-emphasis mb-1">
            <v-icon class="mr-1" size="16">mdi-calendar</v-icon>
            {{ event.date }}
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
          <v-spacer />
          <v-btn
            append-icon="mdi-arrow-right"
            color="primary"
            :disabled="event.registered >= event.capacity"
            size="small"
            variant="tonal"
          >
            Подробнее
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const search = ref('')
  const filters = ['Все', 'Лекции', 'Спорт', 'Хакатоны', 'Концерты']
  const selectedFilter = ref(0)

  const events = ref([
    {
      id: '1',
      title: 'Хакатон по искусственному интеллекту',
      type: 'Хакатон',
      date: '15 апреля 2026, 14:00',
      location: 'Корпус 1, ауд. 305',
      registered: 45,
      capacity: 100,
      gradient: 'linear-gradient(135deg, #1B3A5C 0%, #3A6EA5 100%)',
    },
    {
      id: '2',
      title: 'Лекция: Квантовые вычисления',
      type: 'Лекция',
      date: '18 апреля 2026, 10:00',
      location: 'Корпус 3, ауд. 210',
      registered: 120,
      capacity: 150,
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    },
    {
      id: '3',
      title: 'Турнир по волейболу',
      type: 'Спорт',
      date: '20 апреля 2026, 16:00',
      location: 'Спортивный комплекс СКФУ',
      registered: 32,
      capacity: 32,
      gradient: 'linear-gradient(135deg, #E65100 0%, #FF9800 100%)',
    },
    {
      id: '4',
      title: 'Весенний концерт студенческих коллективов',
      type: 'Концерт',
      date: '25 апреля 2026, 18:30',
      location: 'Актовый зал, Корпус 1',
      registered: 180,
      capacity: 300,
      gradient: 'linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)',
    },
  ])
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
