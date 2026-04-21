# Архитектура

## Общая схема

Проект состоит из трёх основных компонентов:

<ClientOnly>
  <Mermaid graph="flowchart TB
    MAX[Мессенджер MAX] -->|WebApp InitData| Front[Frontend - Vue 3 + Vuetify 4]
    Front -->|REST API + Authorization header| Back[Backend - Fastify]
    Back -->|MikroORM| DB[(MariaDB)]
    Back -->|InitData validation| Auth[Авторизация через MAX]" />
</ClientOnly>

- **Frontend** — SPA на Vue 3, встроенное в мессенджер MAX как WebApp
- **Backend** — REST API на Fastify с модульной архитектурой и кастомными декораторами
- **MariaDB** — реляционная БД, управляемая через MikroORM

---

## Backend

### Структура проекта

```
back/src/
├── config.ts                    # Конфигурация из .env
├── index.ts                     # Точка входа, инициализация Fastify
├── core/
│   ├── app-error.ts             # Кастомный класс ошибок
│   ├── validate-init-data.ts    # Валидация InitData от MAX
│   ├── examples.ts              # Шаблоны ответов API
│   ├── decorators/
│   │   ├── index.ts             # Декораторы контроллеров и маршрутов
│   │   └── module.ts            # Декоратор модулей
│   └── hooks/
│       └── handler.ts           # preHandler (auth, roles, validation)
├── database/
│   ├── base.entity.ts           # Базовая сущность
│   ├── index.ts                 # Инициализация MikroORM
│   ├── mikro-orm.config.ts      # Конфигурация ORM
│   └── migrations/              # Файлы миграций
└── modules/
    ├── base/                    # Базовые эндпоинты (health check)
    ├── token.service.ts         # Сервис токенов
    └── v1/
        ├── index.ts             # V1Module
        ├── event/               # Мероприятия
        ├── user/                # Пользователи
        └── institute/           # Институты
```


### Модульная система

Backend использует кастомную модульную систему, вдохновлённую NestJS, но реализованную через ES Stage 3 декораторы.

#### Декоратор `@Module`

Группирует контроллеры под общим префиксом и версией:

```typescript
@Module({
  prefix: 'webapp',
  version: 'v1',
  controllers: [EventController, InstituteController, UserController]
})
export class V1Module {}
```

Все маршруты V1Module доступны по пути `/webapp/v1/...`.

#### Декораторы маршрутов

```typescript
@Controller('/events')
export class EventController {
  @Get('/')           // GET /webapp/v1/events
  @Post('/create')    // POST /webapp/v1/events/create
  @Delete('/')        // DELETE /webapp/v1/events
}
```

#### Декораторы авторизации и валидации

```typescript
@Get('/')
@Public()                              // Публичный эндпоинт
async getAll() { ... }

@Post('/register')
@InitDataOnly()                        // Только проверка InitData, без поиска User
async register() { ... }

@Post('/create')
@Roles('organizer', 'admin')           // Только для указанных ролей
@ValidateBody(createEventSchema)       // Валидация тела через Zod
async create() { ... }
```

### Жизненный цикл запроса

<ClientOnly>
  <Mermaid graph="sequenceDiagram
    participant C as Client
    participant F as Fastify
    participant H as preHandler
    participant Ctrl as Controller
    participant S as Service
    participant DB as MariaDB
    C->>F: HTTP Request
    F->>H: Route matching
    H->>H: Auth (InitData validation)
    H->>H: Roles check
    H->>H: Zod validation
    H->>Ctrl: Handler call
    Ctrl->>S: Business logic
    S->>DB: MikroORM query
    DB-->>S: Result
    S-->>Ctrl: Data
    Ctrl-->>F: Presenter format
    F-->>C: JSON Response" />
</ClientOnly>

Все запросы проходят через единый `preHandler` хук:

1. **Route matching** — поиск маршрута по URL и HTTP-методу
2. **Авторизация** — валидация InitData от MAX через HMAC-SHA256, поиск пользователя в БД. Результат кешируется в памяти на 5 минут
3. **Проверка ролей** — если маршрут помечен `@Roles(...)`, проверяется роль пользователя
4. **Валидация** — если маршрут помечен `@ValidateBody` / `@ValidateQuery`, данные валидируются через Zod-схему

### Авторизация через MAX

Приложение работает внутри мессенджера MAX. Авторизация через механизм InitData:

1. MAX передаёт в WebApp строку InitData с подписью
2. Backend валидирует подпись через HMAC-SHA256 с использованием токена бота
3. Из InitData извлекается `user.id` (xamId)
4. По `xamId` находится пользователь в базе данных
5. Данные пользователя кешируются в памяти (TTL 5 минут)

### Паттерн Presenter

Каждый модуль имеет Presenter-класс, который форматирует данные сущности для API-ответа:

```typescript
export class EventPresenter {
  static present(event: Event): EventPresented {
    return {
      guid: event.guid,
      title: event.title,
      types: event.types.getItems().map(t => t.name),
      // ... только нужные поля
    };
  }
}
```

### Обработка ошибок

Кастомный класс `AppError` позволяет выбрасывать ошибки с HTTP-кодом:

```typescript
throw new AppError(409, 'Мероприятие заполнено');
```

Fastify `errorHandler` перехватывает `AppError` и возвращает структурированный JSON. Все остальные ошибки возвращают 500.

---

## Frontend

### Структура проекта

```
front/src/
├── App.vue                      # Корневой компонент (auth state machine)
├── main.ts                      # Точка входа
├── api/                         # HTTP-клиент и API-модули
│   ├── client.ts                # Axios instance
│   ├── events.ts, users.ts, institutes.ts
│   └── types/                   # TypeScript типы ответов
├── components/                  # Переиспользуемые компоненты
├── composables/                 # Vue composables (useSwipe, useThemeTransition)
├── layouts/
│   └── DefaultLayout.vue        # Основной layout с навигацией
├── pages/                       # Файловая маршрутизация
│   ├── index.vue                # Главная — список мероприятий
│   ├── my.vue                   # Мои мероприятия
│   ├── profile.vue              # Профиль
│   ├── events/[guid].vue        # Детальная страница мероприятия
│   ├── organizer/               # Панель организатора
│   │   ├── events.vue, scanner.vue, reports.vue
│   └── admin/                   # Панель администратора
│       ├── index.vue, institutes.vue, reports.vue
├── plugins/                     # Vuetify, i18n
├── stores/                      # Pinia stores
│   ├── account.ts               # Авторизация и пользователь
│   ├── app.ts                   # Общее состояние
│   └── snackbar.ts              # Уведомления
└── types/
    └── max-web-app.d.ts         # Типы MAX WebApp SDK
```

### Файловая маршрутизация

Vue Router настроен через плагин `vue-router/vite`, который автоматически генерирует маршруты из файловой структуры `src/pages/`:

| Файл | Маршрут | Описание |
|---|---|---|
| `pages/index.vue` | `/` | Список мероприятий |
| `pages/my.vue` | `/my` | Мои мероприятия |
| `pages/profile.vue` | `/profile` | Профиль пользователя |
| `pages/events/[guid].vue` | `/events/:guid` | Детали мероприятия |
| `pages/organizer/events.vue` | `/organizer/events` | Управление мероприятиями |
| `pages/organizer/scanner.vue` | `/organizer/scanner` | QR-сканер |
| `pages/organizer/reports.vue` | `/organizer/reports` | Отчёты организатора |
| `pages/admin/index.vue` | `/admin` | Управление пользователями |
| `pages/admin/institutes.vue` | `/admin/institutes` | Управление институтами |
| `pages/admin/reports.vue` | `/admin/reports` | Отчёты администратора |

### Состояние авторизации

`App.vue` реализует state machine с четырьмя состояниями:

<ClientOnly>
  <Mermaid graph="stateDiagram-v2
    [*] --> loading: Запуск приложения
    loading --> authenticated: Пользователь найден
    loading --> not_registered: 401 от API
    loading --> error: Ошибка сети
    not_registered --> authenticated: QR-код отсканирован
    error --> loading: Повторить" />
</ClientOnly>

- **loading** — запрос `/users/account`, показывается лоадер
- **authenticated** — пользователь авторизован, показывается приложение
- **not-registered** — пользователь не найден, предлагается сканировать QR-код
- **error** — ошибка подключения, кнопка «Повторить»

### Ролевая модель на фронтенде

Интерфейс адаптируется под роль пользователя:

| Роль | Доступные разделы |
|---|---|
| `user` / `student` | Главная, Мои мероприятия, Профиль |
| `organizer` | + Панель организатора (события, сканер, отчёты) |
| `admin` | + Панель администратора (пользователи, институты, отчёты) |

### API-слой

Фронтенд общается с бэкендом через Axios. API разделён на модули:

- `usersApi` — авторизация, профиль, регистрация
- `eventsApi` — мероприятия, регистрация, типы
- `institutesApi` — институты

Каждый запрос передаёт InitData от MAX в заголовке `Authorization`.
