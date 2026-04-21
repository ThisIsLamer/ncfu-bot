import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NCFU Events',
  description: 'Веб-приложение для мессенджера MAX — учёт мероприятий и посещаемости в СКФУ',

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },

  themeConfig: {
    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Руководство', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/overview' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Руководство',
          items: [
            { text: 'Начало работы', link: '/guide/getting-started' },
            { text: 'Архитектура', link: '/guide/architecture' },
            { text: 'Модели данных', link: '/guide/models' },
            { text: 'Развертывание', link: '/guide/deployment' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Обзор', link: '/api/overview' },
          ],
        },
      ],
    },

    footer: {
      message: 'NCFU Events Documentation',
      copyright: 'Copyright © 2026',
    },

    search: {
      provider: 'local',
    },
  },
})
