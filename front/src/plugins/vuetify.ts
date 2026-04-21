/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
import { VDateInput } from 'vuetify/labs/VDateInput'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const ncfuLight = {
  dark: false,
  colors: {
    'background': '#EDF1F5',
    'surface': '#FFFFFF',
    'surface-variant': '#DAE2EB',
    'primary': '#1B3A5C',
    'primary-darken-1': '#122843',
    'secondary': '#3A6EA5',
    'secondary-darken-1': '#2C5580',
    'accent': '#5B9BD5',
    'error': '#D32F2F',
    'info': '#3A6EA5',
    'success': '#2E7D32',
    'warning': '#F9A825',
    'on-background': '#1B3A5C',
    'on-surface': '#1B3A5C',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
  },
}

const ncfuDark = {
  dark: true,
  colors: {
    'background': '#0D1B2A',
    'surface': '#152238',
    'surface-variant': '#1C2E45',
    'primary': '#5B9BD5',
    'primary-darken-1': '#3A6EA5',
    'secondary': '#7BB8E8',
    'secondary-darken-1': '#5B9BD5',
    'accent': '#A3D1F5',
    'error': '#EF5350',
    'info': '#5B9BD5',
    'success': '#66BB6A',
    'warning': '#FFD54F',
    'on-background': '#DAE2EB',
    'on-surface': '#DAE2EB',
    'on-primary': '#0D1B2A',
    'on-secondary': '#0D1B2A',
  },
}

export default createVuetify({
  components: {
    VDateInput,
  },
  theme: {
    defaultTheme: 'ncfuDark',
    themes: {
      ncfuLight,
      ncfuDark,
    },
  },
})
