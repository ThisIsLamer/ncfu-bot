---
layout: home

hero:
  name: NCFU Events
  text: Учёт мероприятий и посещаемости СКФУ
  tagline: Веб-приложение для мессенджера MAX — создание событий, регистрация участников и контроль посещаемости в СКФУ
  actions:
    - theme: brand
      text: Начать работу
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/overview

features:
  - icon: 📅
    title: Управление мероприятиями
    details: Создание событий с типами, локацией, вместимостью и цветовой маркировкой. Поиск и фильтрация по категориям
  - icon: 📊
    title: Контроль посещаемости
    details: Регистрация участников на события и отметка присутствия через QR-сканер организатора
  - icon: 🏛️
    title: Институты университета
    details: Привязка пользователей к институтам и учебным группам. Управление структурой через админ-панель
  - icon: 👥
    title: Ролевая модель
    details: Три роли — студент, организатор, администратор. Каждая с отдельным интерфейсом и правами доступа
  - icon: 📱
    title: MAX Messenger
    details: Работает как встроенное веб-приложение внутри мессенджера MAX с авторизацией через InitData
  - icon: 🤖
    title: Бот и уведомления
    details: Бот в MAX отвечает на команды и отправляет уведомления о мероприятиях по расписанию через cron
---

## О проекте

NCFU Events — система учёта мероприятий и посещаемости для институтов Северо-Кавказского федерального университета. Приложение встроено в мессенджер MAX и предоставляет инструменты для организаторов, студентов и администрации.

- **Студенты** — просматривают события, регистрируются и отслеживают свою посещаемость
- **Организаторы** — создают мероприятия, сканируют QR-коды участников, формируют отчёты
- **Администраторы** — управляют пользователями, институтами и общей конфигурацией

## Технологии

<div class="tech-stack">
  <div class="tech-item">
    <span class="tech-icon">⚡</span>
    <div class="tech-content">
      <strong>Fastify</strong>
      <span>Backend-фреймворк</span>
    </div>
  </div>
  <div class="tech-item">
    <span class="tech-icon">💚</span>
    <div class="tech-content">
      <strong>Vue 3 + Vuetify 4</strong>
      <span>Frontend</span>
    </div>
  </div>
  <div class="tech-item">
    <span class="tech-icon">📘</span>
    <div class="tech-content">
      <strong>TypeScript</strong>
      <span>Язык</span>
    </div>
  </div>
  <div class="tech-item">
    <span class="tech-icon">🗄️</span>
    <div class="tech-content">
      <strong>MariaDB + MikroORM</strong>
      <span>База данных</span>
    </div>
  </div>
  <div class="tech-item">
    <span class="tech-icon">✅</span>
    <div class="tech-content">
      <strong>Zod</strong>
      <span>Валидация данных</span>
    </div>
  </div>
</div>

<style>
.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.3s;
}

.tech-item:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tech-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tech-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tech-content strong {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.tech-content span {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
</style>
