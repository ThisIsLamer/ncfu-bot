<template>
  <v-container>
    <v-btn
      block
      class="mb-4"
      color="primary"
      prepend-icon="mdi-plus"
      @click="openCreateDialog"
    >
      Добавить институт
    </v-btn>

    <v-text-field
      v-model="search"
      class="mb-4"
      density="compact"
      hide-details
      label="Поиск института"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
    />

    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate />
    </div>

    <v-card
      v-for="inst in filtered"
      :key="inst.guid"
      class="mb-3"
      variant="tonal"
      @click="openMembersDialog(inst)"
    >
      <v-card-title class="text-body-1">
        <v-icon start>mdi-domain</v-icon>
        {{ inst.name }}
      </v-card-title>
      <v-card-actions>
        <v-btn
          prepend-icon="mdi-account-multiple"
          size="small"
          variant="text"
          @click.stop="openMembersDialog(inst)"
        >
          Участники
        </v-btn>
        <v-spacer />
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click.stop="openEditDialog(inst)"
        />
        <v-btn
          color="error"
          icon="mdi-delete"
          size="small"
          variant="text"
          @click.stop="confirmDelete(inst)"
        />
      </v-card-actions>
    </v-card>

    <!-- Создание/редактирование института -->
    <v-dialog
      v-model="formDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>{{ editingInstitute ? 'Редактировать' : 'Новый институт' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="formName"
            :error-messages="formError"
            label="Название"
            variant="outlined"
          />
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
            {{ editingInstitute ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Удаление -->
    <v-dialog
      v-model="deleteDialog"
      max-width="360"
    >
      <v-card>
        <v-card-title>Удалить институт?</v-card-title>
        <v-card-text>Удалить «{{ deletingInstitute?.name }}»?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            variant="flat"
            @click="performDelete"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Участники -->
    <v-dialog
      v-model="membersDialog"
      max-width="500"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>{{ selectedInstitute?.name }}</span>
          <v-spacer />
          <v-btn
            icon="mdi-account-plus"
            size="small"
            variant="text"
            @click="openCreateUserDialog"
          />
        </v-card-title>
        <v-card-text
          class="members-scroll"
          @scroll="onMembersScroll"
        >
          <v-list
            v-if="members.length > 0"
            density="compact"
          >
            <v-list-item
              v-for="user in members"
              :key="user.guid"
              @click="openEditUserDialog(user)"
            >
              <template #prepend>
                <v-avatar
                  color="primary"
                  size="32"
                >
                  <span class="text-caption">{{ user.firstName[0] }}{{ user.lastName[0] }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ user.firstName }} {{ user.lastName }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.group }} · {{ user.role }}</v-list-item-subtitle>
              <template #append>
                <v-btn
                  v-if="!user.xamId"
                  icon="mdi-qrcode"
                  size="small"
                  variant="text"
                  @click.stop="openQrDialog(user)"
                />
              </template>
            </v-list-item>
          </v-list>
          <div
            v-if="membersLoading"
            class="d-flex justify-center py-4"
          >
            <v-progress-circular
              indeterminate
              size="24"
            />
          </div>
          <div
            v-if="!membersLoading && members.length === 0"
            class="text-center py-8"
          >
            <v-icon
              class="mb-2"
              color="grey"
              size="48"
            >
              mdi-account-group
            </v-icon>
            <div class="text-body-2 text-medium-emphasis">Нет участников</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <span class="text-caption text-medium-emphasis ml-2">Всего: {{ membersTotal }}</span>
          <v-spacer />
          <v-btn
            variant="text"
            @click="membersDialog = false"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Создание пользователя -->
    <v-dialog
      v-model="createUserDialog"
      max-width="420"
    >
      <v-card>
        <v-card-title>{{ editingUser ? 'Редактировать участника' : 'Новый участник' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="userForm.firstName"
            class="mb-2"
            :error-messages="userFormErrors.firstName"
            label="Имя"
            variant="outlined"
          />
          <v-text-field
            v-model="userForm.lastName"
            class="mb-2"
            :error-messages="userFormErrors.lastName"
            label="Фамилия"
            variant="outlined"
          />
          <v-text-field
            v-model="userForm.group"
            class="mb-2"
            :error-messages="userFormErrors.group"
            label="Группа"
            variant="outlined"
          />
          <v-select
            v-model="userForm.role"
            :items="['user', 'organizer', 'admin']"
            label="Роль"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="createUserDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :loading="userFormLoading"
            variant="flat"
            @click="submitUserForm"
          >
            {{ editingUser ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- QR-код -->
    <v-dialog
      v-model="qrDialog"
      max-width="320"
    >
      <v-card class="text-center">
        <v-card-title>QR-код</v-card-title>
        <v-card-text>
          <div class="text-body-2 mb-3">{{ qrUser?.firstName }} {{ qrUser?.lastName }}</div>
          <QRCodeVue3
            :key="qrUser?.guid"
            :background-options="{ color: 'transparent' }"
            :corners-dot-options="{ type: 'dot', color: '#FFFFFF' }"
            :corners-square-options="{ type: 'extra-rounded', color: '#FFFFFF' }"
            :dots-options="{ type: 'rounded', color: '#FFFFFF' }"
            :height="200"
            :value="qrUser?.guid ?? ''"
            :width="200"
          />
          <div class="text-caption text-medium-emphasis mt-2">{{ qrUser?.guid }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="qrDialog = false"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type { InstituteResponse, UserResponse } from '@/api/types'

  import QRCodeVue3 from 'qrcode-vue3'
  import { computed, onMounted, ref } from 'vue'
  import { institutesApi, isApiError, usersApi } from '@/api'

  const search = ref('')
  const loading = ref(false)
  const institutes = ref<InstituteResponse[]>([])

  const filtered = computed(() => {
    const q = search.value.toLowerCase()
    if (!q) return institutes.value
    return institutes.value.filter(i => i.name.toLowerCase().includes(q))
  })

  async function fetchInstitutes () {
    loading.value = true
    const result = await institutesApi.getAll()
    loading.value = false
    if (isApiError(result)) return
    institutes.value = result.data
  }

  onMounted(fetchInstitutes)

  // --- Институт: создание/редактирование ---
  const formDialog = ref(false)
  const formName = ref('')
  const formError = ref('')
  const formLoading = ref(false)
  const editingInstitute = ref<InstituteResponse | null>(null)

  function openCreateDialog () {
    editingInstitute.value = null
    formName.value = ''
    formError.value = ''
    formDialog.value = true
  }

  function openEditDialog (inst: InstituteResponse) {
    editingInstitute.value = inst
    formName.value = inst.name
    formError.value = ''
    formDialog.value = true
  }

  async function submitForm () {
    if (!formName.value.trim()) {
      formError.value = 'Введите название'
      return
    }
    formLoading.value = true
    const result = editingInstitute.value
      ? await institutesApi.update({ guid: editingInstitute.value.guid, name: formName.value.trim() })
      : await institutesApi.create({ name: formName.value.trim() })
    formLoading.value = false
    if (isApiError(result)) {
      formError.value = result.message
      return
    }
    formDialog.value = false
    await fetchInstitutes()
  }

  // --- Удаление ---
  const deleteDialog = ref(false)
  const deleteLoading = ref(false)
  const deletingInstitute = ref<InstituteResponse | null>(null)

  function confirmDelete (inst: InstituteResponse) {
    deletingInstitute.value = inst
    deleteDialog.value = true
  }

  async function performDelete () {
    if (!deletingInstitute.value) return
    deleteLoading.value = true
    const result = await institutesApi.remove({ guid: deletingInstitute.value.guid })
    deleteLoading.value = false
    if (isApiError(result)) return
    deleteDialog.value = false
    await fetchInstitutes()
  }

  // --- Участники с пагинацией скроллом ---
  const membersDialog = ref(false)
  const selectedInstitute = ref<InstituteResponse | null>(null)
  const members = ref<UserResponse[]>([])
  const membersTotal = ref(0)
  const membersLoading = ref(false)
  const membersOffset = ref(0)
  const MEMBERS_LIMIT = 20

  function openMembersDialog (inst: InstituteResponse) {
    selectedInstitute.value = inst
    members.value = []
    membersTotal.value = 0
    membersOffset.value = 0
    membersDialog.value = true
    loadMembers()
  }

  async function loadMembers () {
    if (!selectedInstitute.value || membersLoading.value) return
    if (membersOffset.value > 0 && members.value.length >= membersTotal.value) return
    membersLoading.value = true
    const result = await institutesApi.getUsers({
      guid: selectedInstitute.value.guid,
      limit: MEMBERS_LIMIT,
      offset: membersOffset.value,
    })
    membersLoading.value = false
    if (isApiError(result)) return
    members.value.push(...result.data.users)
    membersTotal.value = result.data.total
    membersOffset.value += result.data.users.length
  }

  function onMembersScroll (e: Event) {
    const el = e.target as HTMLElement
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      loadMembers()
    }
  }

  // --- Создание / редактирование пользователя ---
  const createUserDialog = ref(false)
  const userFormLoading = ref(false)
  const editingUser = ref<UserResponse | null>(null)
  const userForm = ref({ firstName: '', lastName: '', group: '', role: 'user' })
  const userFormErrors = ref({ firstName: '', lastName: '', group: '' })

  function openCreateUserDialog () {
    editingUser.value = null
    userForm.value = { firstName: '', lastName: '', group: '', role: 'user' }
    userFormErrors.value = { firstName: '', lastName: '', group: '' }
    createUserDialog.value = true
  }

  function openEditUserDialog (user: UserResponse) {
    editingUser.value = user
    userForm.value = {
      firstName: user.firstName,
      lastName: user.lastName,
      group: user.group,
      role: user.role,
    }
    userFormErrors.value = { firstName: '', lastName: '', group: '' }
    createUserDialog.value = true
  }

  async function submitUserForm () {
    const errs = { firstName: '', lastName: '', group: '' }
    if (!userForm.value.firstName.trim()) errs.firstName = 'Введите имя'
    if (!userForm.value.lastName.trim()) errs.lastName = 'Введите фамилию'
    if (!userForm.value.group.trim()) errs.group = 'Введите группу'
    userFormErrors.value = errs
    if (errs.firstName || errs.lastName || errs.group) return
    if (!selectedInstitute.value) return

    userFormLoading.value = true

    if (editingUser.value) {
      const result = await usersApi.update({
        guid: editingUser.value.guid,
        firstName: userForm.value.firstName.trim(),
        lastName: userForm.value.lastName.trim(),
        group: userForm.value.group.trim(),
        role: userForm.value.role,
      })
      userFormLoading.value = false
      if (isApiError(result)) return

      createUserDialog.value = false
    } else {
      const result = await usersApi.create({
        firstName: userForm.value.firstName.trim(),
        lastName: userForm.value.lastName.trim(),
        group: userForm.value.group.trim(),
        institute: selectedInstitute.value.guid,
        role: userForm.value.role,
      })
      userFormLoading.value = false
      if (isApiError(result)) return

      // Показываем QR сразу после создания (у нового пользователя нет xamId)
      const createdUser = result.data as UserResponse
      createUserDialog.value = false
      openQrDialog(createdUser)
    }

    members.value = []
    membersOffset.value = 0
    await loadMembers()
  }

  // --- QR-код ---
  const qrDialog = ref(false)
  const qrUser = ref<UserResponse | null>(null)

  function openQrDialog (user: UserResponse) {
    qrUser.value = user
    qrDialog.value = true
  }
</script>

<style scoped>
.members-scroll {
  max-height: 400px;
  overflow-y: auto;
}
</style>
