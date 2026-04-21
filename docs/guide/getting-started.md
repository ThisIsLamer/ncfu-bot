# Начать работу

## Требования

- **Node.js** v24+ (рекомендуется LTS)
- **npm** v10+
- **MariaDB** 10.6+ (или через Docker)
- **Docker** и **Docker Compose** (для контейнерного запуска)

---

## Технологический стек

### Backend

| Технология | Версия | Назначение |
|---|---|---|
| **Node.js** | 24+ | Среда выполнения |
| **TypeScript** | ~5.3 | Язык программирования |
| **Fastify** | ^5.6 | HTTP-фреймворк |
| **MikroORM** | ^7.0 | ORM для работы с базой данных |
| **MariaDB** | 10.6+ | Реляционная СУБД |
| **Zod** | ^4.3 | Валидация и типизация данных |

#### Основные зависимости

**Fastify** — высокопроизводительный HTTP-фреймворк для Node.js. Используется как основа REST API сервера. Поддерживает плагинную архитектуру, хуки жизненного цикла запросов и встроенное логирование через Pino.

**MikroORM** — TypeScript ORM с поддержкой Data Mapper паттерна. В проекте используется с драйвером `@mikro-orm/mariadb`. Сущности описываются через ES-декораторы. ORM управляет миграциями, связями между сущностями и Unit of Work паттерном.

Пакеты MikroORM:
- `@mikro-orm/core` — ядро ORM
- `@mikro-orm/decorators` — декораторы для описания сущностей
- `@mikro-orm/mariadb` — драйвер MariaDB
- `@mikro-orm/migrations` — система миграций
- `@mikro-orm/reflection` — рефлексия метаданных сущностей
- `@mikro-orm/cli` — CLI для управления миграциями и схемой

**MariaDB** — реляционная СУБД, форк MySQL. Используется как основное хранилище данных. Подключение через `mariadb` драйвер (^3.4.5). В Docker используется официальный образ `mariadb:latest`.

**Zod** — библиотека валидации схем данных с выводом TypeScript типов. Используется для валидации тел запросов, query-параметров и DTO на уровне контроллеров.

#### Безопасность и middleware

- `@fastify/cors` (^11.2.0) — настройка CORS-политик. Поддерживает wildcard-паттерны в origins
- `@fastify/helmet` (^13.0.2) — HTTP security headers (Content-Security-Policy, X-Frame-Options и др.)
- `@fastify/rate-limit` (^10.3.0) — ограничение частоты запросов для защиты от DDoS
- `argon2` (^0.44.0) — хеширование паролей по алгоритму Argon2id

#### Утилиты

- `axios` (^1.13.2) — HTTP-клиент для внешних запросов
- `dotenv` (^17.2.3) — загрузка переменных окружения из `.env` файлов
- `ping` (^1.0.0) — проверка доступности сетевых хостов

#### Инструменты разработки

- `tsx` (^4.21.0) — запуск TypeScript файлов напрямую, используется для dev-сервера с hot-reload (`tsx watch`)
- `eslint` (^9.39) + `prettier` (^3.7) — линтинг и форматирование кода
- `jest` (^30.2) + `ts-jest` — тестирование

#### Архитектура backend

Backend построен на модульной архитектуре с кастомными декораторами:

- **Декораторы контроллеров**: `@Controller`, `@Get`, `@Post`, `@Delete` — маршрутизация
- **Декораторы авторизации**: `@Roles`, `@Public`, `@InitDataOnly` — контроль доступа
- **Декораторы валидации**: `@ValidateBody`, `@ValidateQuery` — валидация через Zod-схемы
- **Модульная система**: `@Module` — группировка контроллеров в модули

Импорты используют Node.js subpath imports (`#src/*`, `#types/*`, `#providers/*`, `#services/*`) с условным маппингом `development` → `src/`, `default` → `dist/`.

---

### Frontend

| Технология | Версия | Назначение |
|---|---|---|
| **Vue 3** | ^3.5 | UI-фреймворк |
| **Vuetify** | ^4.0 | Компонентная библиотека Material Design |
| **Vite** | ^8.0 | Сборщик и dev-сервер |
| **TypeScript** | ~5.9 | Язык программирования |
| **Pinia** | ^3.0 | Управление состоянием |
| **Vue Router** | ^5.0 | Маршрутизация |
| **Vue I18n** | ^11.3 | Интернационализация |

#### Основные зависимости

**Vue 3** — прогрессивный JavaScript-фреймворк. Используется с Composition API и `<script setup>` синтаксисом. Сборка через Vite с плагином `@vitejs/plugin-vue`.

**Vuetify 4** — UI-библиотека на основе Material Design 3. Предоставляет готовые компоненты (кнопки, карточки, таблицы, диалоги, навигация и др.). Настроен автоимпорт компонентов через `vite-plugin-vuetify`. Кастомная тема NCFU с двумя вариантами — светлая и тёмная.

**Vite 8** — сборщик нового поколения. Конфигурация включает:
- `@vitejs/plugin-vue` — поддержка `.vue` файлов
- `vite-plugin-vuetify` — автоимпорт компонентов Vuetify и tree-shaking
- `vue-router/vite` — файловая маршрутизация (автогенерация роутов из `src/pages/`)
- `unplugin-fonts` — автоматическая загрузка шрифтов (Roboto)

**Pinia 3** — стейт-менеджер для Vue 3. Используется для хранения состояния авторизации, данных пользователя и настроек приложения. Сторы определяются через Options API стиль.

**Vue Router 5** — маршрутизация с файловой структурой. Роуты автоматически генерируются из файлов в `src/pages/`. Поддерживает динамические маршруты (`[guid].vue`), вложенные layout-ы.

**Vue I18n 11** — интернационализация интерфейса. Поддержка нескольких языков для текстов приложения.

#### Дополнительные библиотеки

- `axios` (^1.15.1) — HTTP-клиент для взаимодействия с backend API
- `qrcode-vue3` (^1.7.1) — генерация и сканирование QR-кодов для регистрации пользователей
- `@fontsource/roboto` (^5.2.10) — шрифт Roboto для Material Design
- `@mdi/font` (7.4.47) — Material Design Icons — набор иконок
- `sass-embedded` (^1.98.0) — компиляция SCSS стилей Vuetify

#### Инструменты разработки frontend

- `vue-tsc` (^3.2.5) — проверка типов Vue-компонентов
- `eslint` (^9.39) + `eslint-config-vuetify` — линтинг с правилами Vuetify
- `npm-run-all2` — параллельный запуск скриптов (type-check + build)

---

### База данных

**MariaDB** — основная СУБД проекта. Схема управляется через MikroORM миграции.

Сущности:
- `User` — пользователи (студенты, организаторы, администраторы)
- `Institute` — институты университета
- `Event` — мероприятия
- `EventType` — типы/категории мероприятий
- `EventRegistration` — регистрации пользователей на мероприятия и отметки посещаемости

Связи:
- `User` → `Institute` (ManyToOne) — пользователь принадлежит институту
- `Event` ↔ `EventType` (ManyToMany) — событие может иметь несколько типов
- `EventRegistration` → `Event` + `User` (ManyToOne) — уникальная пара событие-пользователь

---

## Запуск проекта

### Переменные окружения

Скопируйте файл примера и заполните значения:

```bash
cp back/.env.example back/.env
```

Основные переменные `back/.env`:

```dotenv
NODE_ENV=development

# Подключение к БД (MariaDB)
DATABASE_SQL_URL=mysql://root:QazWsx123@localhost:3306/ncfu

# Сервер
APP_PORT=3000
APP_HOST=0.0.0.0

# CORS
CORS_ORIGINS=http://localhost:*

# Токен бота MAX
BOT_TOKEN=your_bot_token_here
```

Переменные `front/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

---

### Docker Compose (продакшн)

Самый простой способ запустить весь проект — через Docker Compose из корня репозитория.

1. Скопируйте пример конфигурации:

```bash
cp docker-compose.example.yml docker-compose.yml
```

2. Настройте `back/.env` (см. выше). Для Docker-окружения `DATABASE_SQL_URL` должен указывать на имя сервиса:

```dotenv
DATABASE_SQL_URL=mysql://root:QazWsx123@mariadb:3306/ncfu
```

3. Запустите все сервисы:

```bash
docker compose up -d --build
```

Это поднимет три контейнера:
- `ncfu-front` — фронтенд (Nginx), порт **8080**
- `ncfu-back` — бэкенд (Node.js), порт **3000**
- `mariadb-ncfu` — база данных (MariaDB), порт **26670**

4. Проверьте статус:

```bash
docker compose ps
```

5. Остановка:

```bash
docker compose down
```

---

### Docker Compose (только backend)

Если нужен только бэкенд с базой данных:

```bash
cd back
docker compose up -d --build
```

Это поднимет `ncfu-back` (порт 3000) и `mariadb` (порт 27006).

---

### Без Docker (для разработки)

#### 1. База данных

Установите MariaDB локально или запустите через Docker отдельно:

```bash
docker run -d \
  --name mariadb-ncfu \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=QazWsx123 \
  -e MYSQL_DATABASE=ncfu \
  mariadb:latest
```

#### 2. Backend

```bash
cd back
npm install
cp .env.example .env
# Отредактируйте .env — укажите DATABASE_SQL_URL и BOT_TOKEN
```

Применение схемы БД:

```bash
npm run db:schema:update
```

Запуск dev-сервера с hot-reload:

```bash
npm run dev
```

Бэкенд запустится на `http://localhost:3000`. Используется `tsx watch` — при изменении файлов сервер автоматически перезапускается.

#### 3. Frontend

```bash
cd front
npm install
```

Убедитесь что `front/.env` содержит правильный URL бэкенда:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

Запуск dev-сервера:

```bash
npm run dev
```

Фронтенд запустится на `http://localhost:3000` (Vite dev server). Если порт занят бэкендом, Vite автоматически выберет следующий свободный порт.

---

### Полезные команды

#### Backend

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер с hot-reload |
| `npm run build` | Сборка TypeScript → JavaScript |
| `npm run start` | Запуск собранного проекта |
| `npm run lint` | Проверка линтером |
| `npm run lint:fix` | Автоисправление линтера |
| `npm run db:schema:update` | Обновить схему БД по сущностям |
| `npm run db:migration:create` | Создать новую миграцию |
| `npm run db:migration:up` | Применить миграции |
| `npm run db:migration:down` | Откатить последнюю миграцию |

#### Frontend

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Продакшн-сборка (type-check + build) |
| `npm run preview` | Превью продакшн-сборки |
| `npm run type-check` | Проверка типов (vue-tsc) |
| `npm run lint` | Проверка линтером |
| `npm run lint:fix` | Автоисправление линтера |
