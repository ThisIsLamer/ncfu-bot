<template>
  <v-container>
    <v-btn block class="mb-4" color="primary" prepend-icon="mdi-plus">
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

    <v-card v-for="inst in institutes" :key="inst.id" class="mb-3" variant="tonal">
      <v-card-title class="text-body-1">
        <v-icon start>mdi-domain</v-icon>
        {{ inst.name }}
      </v-card-title>
      <v-card-subtitle>
        Студентов: {{ inst.studentsCount }}
      </v-card-subtitle>
      <v-card-actions>
        <v-btn prepend-icon="mdi-account-multiple" size="small" variant="text">
          Студенты
        </v-btn>
        <v-btn prepend-icon="mdi-account-plus" size="small" variant="text">
          Добавить
        </v-btn>
        <v-spacer />
        <v-btn icon="mdi-pencil" size="small" variant="text" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const search = ref('')

  // Моковые данные
  const institutes = ref([
    { id: '1', name: 'Институт информационных технологий', studentsCount: 1240 },
    { id: '2', name: 'Институт экономики и управления', studentsCount: 980 },
    { id: '3', name: 'Юридический институт', studentsCount: 760 },
    { id: '4', name: 'Институт живых систем', studentsCount: 540 },
    { id: '5', name: 'Гуманитарный институт', studentsCount: 890 },
  ])
</script>
