<template>
  <v-container>
    <div
      v-if="!account.user"
      class="d-flex justify-center py-8"
    >
      <v-progress-circular indeterminate />
    </div>

    <template v-else>
      <div class="d-flex flex-column align-center my-4">
        <v-avatar
          color="primary"
          size="80"
        >
          <v-img
            v-if="account.user.avatarUrl"
            :src="account.user.avatarUrl"
          />
          <span
            v-else
            class="text-h5"
          >
            {{ account.user.firstName[0] }}{{ account.user.lastName[0] }}
          </span>
        </v-avatar>
        <div class="text-h6 mt-2">{{ account.fullName }}</div>
        <v-chip
          class="mt-1"
          size="small"
          variant="tonal"
        >
          {{ roleLabel }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <v-list>
        <v-list-item prepend-icon="mdi-domain">
          <v-list-item-title>Институт</v-list-item-title>
          <v-list-item-subtitle>{{ instituteName }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-account-group">
          <v-list-item-title>Группа</v-list-item-title>
          <v-list-item-subtitle>{{ account.user.group || '—' }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-chart-box">
          <v-list-item-title>Посещено мероприятий</v-list-item-title>
          <template #append>
            <span class="text-body-2">{{ attendedCount }}</span>
          </template>
        </v-list-item>
        <v-list-item prepend-icon="mdi-calendar-clock">
          <v-list-item-title>Дата регистрации</v-list-item-title>
          <v-list-item-subtitle>{{ registrationDate }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-bell">
          <v-list-item-title>Уведомления</v-list-item-title>
          <template #append>
            <v-switch
              v-model="notifications"
              density="compact"
              hide-details
              @update:model-value="onNotificationsChange"
            />
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
  import type { InstituteResponse } from '@/api/types'
  import { computed, onMounted, ref } from 'vue'
  import { institutesApi, isApiError, usersApi } from '@/api'
  import { useAccountStore } from '@/stores/account'

  const account = useAccountStore()
  const institutes = ref<InstituteResponse[]>([])
  const attendedCount = ref(0)
  const notifications = ref(true)

  onMounted(async () => {
    const [instResult, statsResult] = await Promise.all([
      institutesApi.getAll(),
      usersApi.getStats(),
    ])
    if (!isApiError(instResult)) institutes.value = instResult.data
    if (!isApiError(statsResult)) attendedCount.value = statsResult.data.attended
    if (account.user) notifications.value = account.user.notifications
  })

  const roleLabel = computed(() => {
    const roles: Record<string, string> = {
      user: 'Студент',
      student: 'Студент',
      organizer: 'Организатор',
      admin: 'Администратор',
    }
    return roles[account.user?.role ?? ''] ?? account.user?.role
  })

  const instituteName = computed(() => {
    if (!account.user?.institute) return '—'
    const inst = institutes.value.find(i => i.guid === account.user!.institute)
    return inst?.name ?? '—'
  })

  const registrationDate = computed(() => {
    if (!account.user?.createdAt) return '—'
    const d = new Date(account.user.createdAt)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  })

  async function onNotificationsChange (val: boolean | null) {
    if (val === null) return
    const result = await usersApi.updateNotifications(val)
    if (!isApiError(result) && account.user) {
      account.user.notifications = result.data.notifications
    }
  }
</script>
