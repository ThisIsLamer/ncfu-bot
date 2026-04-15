<template>
  <v-container>
    <div class="d-flex flex-column align-center my-4">
      <v-avatar color="primary" size="80">
        <v-icon size="40">mdi-account</v-icon>
      </v-avatar>
      <div class="text-h6 mt-2">{{ account.fullName }}</div>
      <div class="text-body-2 text-medium-emphasis">{{ account.user.institute }}</div>
      <div v-if="account.user.course" class="text-body-2 text-medium-emphasis">
        {{ account.user.course }} курс
      </div>
    </div>

    <v-divider class="my-2" />

    <v-list>
      <v-list-item prepend-icon="mdi-chart-box">
        <v-list-item-title>Посещено мероприятий</v-list-item-title>
        <template #append>12</template>
      </v-list-item>
      <v-list-item prepend-icon="mdi-bell">
        <v-list-item-title>Уведомления</v-list-item-title>
        <template #append>
          <v-switch v-model="notifications" density="compact" hide-details />
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useAccountStore } from '@/stores/account'

  const account = useAccountStore()
  const notifications = ref(true)
</script>
