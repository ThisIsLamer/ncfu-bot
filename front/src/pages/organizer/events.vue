<template>
  <v-container class="pa-3 d-flex flex-column page-fill">
    <v-btn
      block
      class="mb-4 flex-shrink-0"
      color="primary"
      max-height="35"
      prepend-icon="mdi-plus"
      @click="openCreateDialog"
    >
      Создать мероприятие
    </v-btn>

    <!-- Загрузка -->
    <div
      v-if="loading"
      class="d-flex justify-center py-8"
    >
      <v-progress-circular indeterminate />
    </div>

    <!-- Пустое состояние -->
    <div
      v-else-if="events.length === 0"
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
      <div class="text-body-2 text-medium-emphasis">Создайте первое мероприятие</div>
    </div>

    <!-- Список мероприятий -->
    <div
      v-else
      class="events-scroll"
    >
      <v-card
        v-for="event in events"
        :key="event.guid"
        class="mb-3"
        rounded="lg"
        variant="elevated"
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
            :color="event.registered >= event.capacity ? 'error' : 'success'"
            size="x-small"
            variant="tonal"
          >
            {{ event.registered >= event.capacity ? 'Мест нет' : 'Есть места' }}
          </v-chip>
          <v-spacer />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="openEditDialog(event)"
          />
        </v-card-actions>
      </v-card>
    </div>

    <!-- Создание / редактирование мероприятия -->
    <v-dialog
      v-model="formDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>{{ editingEvent ? 'Редактировать' : 'Новое мероприятие' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.title"
            class="mb-2"
            :error-messages="formErrors.title"
            label="Название"
            variant="outlined"
          />
          <v-textarea
            v-model="form.description"
            class="mb-2"
            :error-messages="formErrors.description"
            label="Описание"
            rows="3"
            variant="outlined"
          />
          <div class="d-flex ga-2">
            <v-date-input
              v-model="form.date"
              class="mb-2 w-50"
              :error-messages="formErrors.date"
              label="Дата"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
            />
            <v-text-field
              class="mb-2 w-50"
              :error-messages="formErrors.time"
              label="Время"
              :model-value="form.time"
              prepend-inner-icon="mdi-clock-outline"
              readonly
              variant="outlined"
            >
              <v-dialog
                v-model="timeMenu"
                activator="parent"
                width="auto"
              >
                <v-time-picker
                  v-model="form.time"
                  format="24hr"
                />
              </v-dialog>
            </v-text-field>
          </div>
          <v-text-field
            v-model="form.location"
            class="mb-2"
            :error-messages="formErrors.location"
            label="Место"
            variant="outlined"
          />
          <v-text-field
            v-model.number="form.capacity"
            class="mb-2"
            :error-messages="formErrors.capacity"
            label="Вместимость"
            type="number"
            variant="outlined"
          />
          <v-text-field
            class="mb-2"
            label="Цвет"
            :model-value="form.colors"
            readonly
            variant="outlined"
          >
            <template #prepend-inner>
              <div
                class="color-preview"
                :style="{ backgroundColor: form.colors }"
              />
            </template>
            <v-dialog
              v-model="colorMenu"
              activator="parent"
              width="auto"
            >
              <v-color-picker
                v-model="form.colors"
                mode="hexa"
                show-swatches
              />
            </v-dialog>
          </v-text-field>
          <div class="text-body-2 mb-1">Типы</div>
          <v-chip-group
            v-model="form.types"
            class="mb-2"
            column
            multiple
          >
            <v-chip
              v-for="t in availableTypes"
              :key="t.name"
              filter
              :value="t.name"
              variant="outlined"
            >
              {{ t.name }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="formDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :loading="formLoading"
            variant="flat"
            @click="submitForm"
          >
            {{ editingEvent ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type { EventResponse, EventTypeResponse } from '@/api/types'
  import { onMounted, ref } from 'vue'
  import { eventsApi, isApiError } from '@/api'
  import { formatDate } from '@/utils/date'

  const loading = ref(false)
  const events = ref<EventResponse[]>([])
  const availableTypes = ref<EventTypeResponse[]>([])

  async function fetchEvents () {
    loading.value = true
    const result = await eventsApi.getAll()
    loading.value = false
    if (isApiError(result)) return
    events.value = result.data
  }

  async function fetchTypes () {
    const result = await eventsApi.getTypes()
    if (isApiError(result)) return
    availableTypes.value = result.data
  }

  onMounted(() => {
    fetchEvents()
    fetchTypes()
  })

  // --- Форма создания / редактирования ---
  const formDialog = ref(false)
  const formLoading = ref(false)
  const colorMenu = ref(false)
  const timeMenu = ref(false)
  const editingEvent = ref<EventResponse | null>(null)

  function emptyForm () {
    return {
      title: '',
      description: '',
      date: null as Date | null,
      time: '12:00',
      location: '',
      capacity: 0,
      colors: '#1867C0',
      types: [] as string[],
    }
  }

  const form = ref(emptyForm())
  const formErrors = ref({ title: '', description: '', date: '', time: '', location: '', capacity: '' })

  function openCreateDialog () {
    editingEvent.value = null
    form.value = emptyForm()
    formErrors.value = { title: '', description: '', date: '', time: '', location: '', capacity: '' }
    formDialog.value = true
  }

  function openEditDialog (event: EventResponse) {
    editingEvent.value = event
    const d = new Date(event.date)
    form.value = {
      title: event.title,
      description: event.description,
      date: d,
      time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      location: event.location,
      capacity: event.capacity,
      colors: event.color,
      types: [...event.types],
    }
    formErrors.value = { title: '', description: '', date: '', time: '', location: '', capacity: '' }
    formDialog.value = true
  }

  function buildDatetime (): string {
    if (!form.value.date) return ''
    const [h, m] = (form.value.time || '00:00').split(':').map(Number)
    const d = new Date(form.value.date)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }

  async function submitForm () {
    const errs = { title: '', description: '', date: '', time: '', location: '', capacity: '' }
    if (!form.value.title.trim()) errs.title = 'Введите название'
    if (!form.value.description.trim()) errs.description = 'Введите описание'
    if (!form.value.date) errs.date = 'Укажите дату'
    if (!form.value.time) errs.time = 'Укажите время'
    if (!form.value.location.trim()) errs.location = 'Укажите место'
    if (!form.value.capacity || form.value.capacity <= 0) errs.capacity = 'Укажите вместимость'
    formErrors.value = errs
    if (Object.values(errs).some(Boolean)) return

    const datetime = buildDatetime()
    formLoading.value = true

    if (editingEvent.value) {
      const result = await eventsApi.update({
        guid: editingEvent.value.guid,
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        date: datetime,
        location: form.value.location.trim(),
        capacity: form.value.capacity,
        colors: form.value.colors,
        types: form.value.types,
      })
      formLoading.value = false
      if (isApiError(result)) return
    } else {
      const result = await eventsApi.create({
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        date: datetime,
        location: form.value.location.trim(),
        capacity: form.value.capacity,
        colors: form.value.colors,
        types: form.value.types,
      })
      formLoading.value = false
      if (isApiError(result)) return
    }

    formDialog.value = false
    await fetchEvents()
  }
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

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
