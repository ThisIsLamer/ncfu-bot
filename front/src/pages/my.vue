<template>
  <v-container>
    <v-tabs v-model="tab" grow>
      <v-tab value="upcoming">Предстоящие</v-tab>
      <v-tab value="past">Прошедшие</v-tab>
    </v-tabs>

    <div class="my-4">
      <p class="text-body-2 text-medium-emphasis">Здесь будут мои регистрации</p>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const tab = ref('upcoming')
</script>
