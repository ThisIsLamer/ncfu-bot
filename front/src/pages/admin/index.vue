<template>
  <v-container>
    <div class="text-h6 mb-4">Дашборд</div>

    <v-card
      class="mb-3"
      prepend-icon="mdi-tag-multiple"
      variant="tonal"
      @click="openTypesDialog"
    >
      <template #title>
        <span class="text-body-1">Типы мероприятий</span>
      </template>
      <template #subtitle>
        <span>Управление категориями событий</span>
      </template>
    </v-card>

    <!-- Диалог типов -->
    <v-dialog
      v-model="typesDialog"
      max-width="420"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>Типы мероприятий</span>
          <v-spacer />
          <v-btn
            icon="mdi-plus"
            size="small"
            variant="text"
            @click="openCreateType"
          />
        </v-card-title>
        <v-card-text>
          <div
            v-if="typesLoading"
            class="d-flex justify-center py-4"
          >
            <v-progress-circular indeterminate />
          </div>
          <v-list
            v-else-if="types.length > 0"
            density="compact"
          >
            <v-list-item
              v-for="t in types"
              :key="t.guid"
            >
              <v-list-item-title>{{ t.name }}</v-list-item-title>
              <template #append>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openEditType(t)"
                />
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="confirmDeleteType(t)"
                />
              </template>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="text-center py-6"
          >
            <v-icon
              class="mb-2"
              color="grey"
              size="48"
            >
              mdi-tag-off-outline
            </v-icon>
            <div class="text-body-2 text-medium-emphasis">Типов пока нет</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="typesDialog = false"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Создание / редактирование типа -->
    <v-dialog
      v-model="typeFormDialog"
      max-width="360"
    >
      <v-card>
        <v-card-title>{{ editingType ? 'Редактировать тип' : 'Новый тип' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="typeName"
            :error-messages="typeNameError"
            label="Название"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="typeFormDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :loading="typeFormLoading"
            variant="flat"
            @click="submitType"
          >
            {{ editingType ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Удаление типа -->
    <v-dialog
      v-model="deleteTypeDialog"
      max-width="360"
    >
      <v-card>
        <v-card-title>Удалить тип?</v-card-title>
        <v-card-text>Удалить «{{ deletingType?.name }}»?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteTypeDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            :loading="deleteTypeLoading"
            variant="flat"
            @click="performDeleteType"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type { EventTypeResponse } from '@/api/types'
  import { ref } from 'vue'
  import { eventsApi, isApiError } from '@/api'

  // --- Типы мероприятий ---
  const typesDialog = ref(false)
  const typesLoading = ref(false)
  const types = ref<EventTypeResponse[]>([])

  async function fetchTypes () {
    typesLoading.value = true
    const result = await eventsApi.getTypes()
    typesLoading.value = false
    if (isApiError(result)) return
    types.value = result.data
  }

  function openTypesDialog () {
    typesDialog.value = true
    fetchTypes()
  }

  // --- Создание / редактирование ---
  const typeFormDialog = ref(false)
  const typeFormLoading = ref(false)
  const typeName = ref('')
  const typeNameError = ref('')
  const editingType = ref<EventTypeResponse | null>(null)

  function openCreateType () {
    editingType.value = null
    typeName.value = ''
    typeNameError.value = ''
    typeFormDialog.value = true
  }

  function openEditType (t: EventTypeResponse) {
    editingType.value = t
    typeName.value = t.name
    typeNameError.value = ''
    typeFormDialog.value = true
  }

  async function submitType () {
    if (!typeName.value.trim()) {
      typeNameError.value = 'Введите название'
      return
    }
    typeFormLoading.value = true
    const result = editingType.value
      ? await eventsApi.updateType({ guid: editingType.value.guid, name: typeName.value.trim() })
      : await eventsApi.createType({ name: typeName.value.trim() })
    typeFormLoading.value = false
    if (isApiError(result)) {
      typeNameError.value = result.message
      return
    }
    typeFormDialog.value = false
    await fetchTypes()
  }

  // --- Удаление ---
  const deleteTypeDialog = ref(false)
  const deleteTypeLoading = ref(false)
  const deletingType = ref<EventTypeResponse | null>(null)

  function confirmDeleteType (t: EventTypeResponse) {
    deletingType.value = t
    deleteTypeDialog.value = true
  }

  async function performDeleteType () {
    if (!deletingType.value) return
    deleteTypeLoading.value = true
    const result = await eventsApi.removeType({ guid: deletingType.value.guid })
    deleteTypeLoading.value = false
    if (isApiError(result)) return
    deleteTypeDialog.value = false
    await fetchTypes()
  }
</script>
