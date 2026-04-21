# API Reference

## Общие сведения

Базовый URL: `http://localhost:3000`

Все эндпоинты модуля V1 имеют префикс `/webapp/v1`.

### Авторизация

Большинство эндпоинтов требуют авторизацию. InitData от мессенджера MAX передаётся в заголовке:

```
Authorization: <InitData string>
```

Эндпоинты, помеченные как **Public**, не требуют авторизации.

### Формат ошибок

```json
{
  "method": "GET",
  "message": "Описание ошибки",
  "statusCode": 400
}
```

### Валидация

Ошибки валидации (Zod) возвращают 400 с массивом issues:

```json
{
  "error": [
    { "code": "too_big", "maximum": 255, "path": ["title"], "message": "String must contain at most 255 character(s)" }
  ]
}
```

---

## Base

### `GET /echo`

**Public** — проверка работоспособности сервера.

**Ответ:**

```json
{
  "status": "active",
  "version": "1.0.0",
  "message": "This NCFU backend service v1.0.0"
}
```

---

## Events — `/webapp/v1/events`

### `GET /webapp/v1/events`

Получить список мероприятий с возможностью поиска и фильтрации.

**Query параметры:**

| Параметр | Тип | Обязательный | Описание |
|---|---|---|---|
| `search` | string | Нет | Поиск по названию и описанию |
| `filter` | string[] | Нет | Фильтр по названиям типов мероприятий |

**Ответ:** массив `EventPresented[]`

```json
[
  {
    "guid": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Научная конференция",
    "description": "Ежегодная конференция СКФУ",
    "date": "2026-05-15T10:00:00.000Z",
    "location": "Главный корпус, ауд. 301",
    "capacity": 100,
    "registered": 45,
    "color": "#1B3A5C",
    "types": ["Конференция", "Наука"],
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-10T15:30:00.000Z"
  }
]
```

### `GET /webapp/v1/events/one`

Получить одно мероприятие по GUID.

**Query параметры:**

| Параметр | Тип | Обязательный | Описание |
|---|---|---|---|
| `guid` | string(36) | Да | GUID мероприятия |

**Ответ:** `EventPresented` (см. выше)

---

### `GET /webapp/v1/events/my`

Получить мероприятия, на которые зарегистрирован текущий пользователь.

**Ответ:** массив `EventPresented[]`

---

### `GET /webapp/v1/events/registration`

Проверить, зарегистрирован ли текущий пользователь на мероприятие.

**Query параметры:**

| Параметр | Тип | Обязательный | Описание |
|---|---|---|---|
| `guidEvent` | string(36) | Да | GUID мероприятия |

**Ответ:**

Если зарегистрирован:
```json
{ "guid": "registration-guid-here" }
```

Если не зарегистрирован:
```json
null
```

---

### `POST /webapp/v1/events/register`

Зарегистрироваться на мероприятие.

**Body:**

```json
{
  "guidEvent": "string (max 36)"
}
```

**Ответ:**

```json
{ "guid": "registration-guid-here" }
```

**Ошибки:**
- `409` — «Мероприятие заполнено» (превышена вместимость)
- `409` — «Вы уже зарегистрированы»

---

### `POST /webapp/v1/events/attend`

Отметить посещение участника. **Роли: organizer, admin.**

**Body:**

```json
{
  "registrationGuid": "string (max 36)"
}
```

**Ответ:**

```json
{ "success": true }
```

---

### `POST /webapp/v1/events/create`

Создать мероприятие. **Роли: organizer, admin.**

**Body:**

| Поле | Тип | Обязательный | Описание |
|---|---|---|---|
| `title` | string(255) | Да | Название |
| `description` | string(2000) | Да | Описание |
| `date` | date (ISO 8601) | Да | Дата и время проведения |
| `location` | string(255) | Да | Место проведения |
| `capacity` | number | Да | Максимальное количество участников |
| `colors` | string(7) | Да | HEX-цвет (например `#1B3A5C`) |
| `types` | string[] | Да | Массив названий типов мероприятий |

```json
{
  "title": "Научная конференция",
  "description": "Ежегодная конференция СКФУ",
  "date": "2026-05-15T10:00:00.000Z",
  "location": "Главный корпус, ауд. 301",
  "capacity": 100,
  "colors": "#1B3A5C",
  "types": ["Конференция", "Наука"]
}
```

**Ответ:** созданная сущность Event

---

### `POST /webapp/v1/events/update`

Обновить мероприятие. **Роли: organizer, admin.**

**Body:**

| Поле | Тип | Обязательный | Описание |
|---|---|---|---|
| `guid` | string(36) | Да | GUID мероприятия |
| `title` | string(255) | Нет | Название |
| `description` | string(2000) | Нет | Описание |
| `date` | date (ISO 8601) | Нет | Дата и время |
| `location` | string(255) | Нет | Место проведения |
| `capacity` | number | Нет | Вместимость |
| `colors` | string(7) | Нет | HEX-цвет |
| `types` | string[] | Нет | Типы мероприятий |

Передаются только изменяемые поля.

---

### `DELETE /webapp/v1/events`

Удалить мероприятие. **Роли: organizer, admin.**

**Body:**

```json
{
  "guid": "string (max 36)"
}
```

---

### `GET /webapp/v1/events/stats`

Получить статистику по мероприятиям. **Роли: organizer, admin.**

**Ответ:**

```json
{
  "totalEvents": 12,
  "totalUsers": 150,
  "totalRegistrations": 340,
  "totalAttended": 280,
  "attendanceRate": 82,
  "events": [
    {
      "guid": "...",
      "title": "Научная конференция",
      "date": "2026-05-15T10:00:00.000Z",
      "capacity": 100,
      "registered": 45,
      "attended": 38,
      "fillRate": 45,
      "attendRate": 84,
      "types": ["Конференция"]
    }
  ],
  "byType": [
    { "name": "Конференция", "count": 3 },
    { "name": "Спорт", "count": 5 }
  ]
}
```

---

## Event Types — `/webapp/v1/events/types`

### `GET /webapp/v1/events/types`

Получить все типы мероприятий.

**Ответ:**

```json
[
  {
    "id": 1,
    "guid": "...",
    "name": "Конференция",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-01T12:00:00.000Z"
  }
]
```

---

### `POST /webapp/v1/events/types/create`

Создать тип мероприятия. **Роль: admin.**

**Body:**

```json
{
  "name": "string (max 100)"
}
```

---

### `POST /webapp/v1/events/types/update`

Обновить тип мероприятия. **Роль: admin.**

**Body:**

```json
{
  "guid": "string (max 36)",
  "name": "string (max 100)"
}
```

---

### `DELETE /webapp/v1/events/types`

Удалить тип мероприятия. **Роль: admin.**

**Body:**

```json
{
  "guid": "string (max 36)"
}
```

---

## Users — `/webapp/v1/users`

### `GET /webapp/v1/users/account`

Получить данные текущего авторизованного пользователя.

**Ответ:** `UserPresented`

```json
{
  "guid": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Иван",
  "lastName": "Иванов",
  "institute": "institute-guid-here",
  "group": "КБ-б-о-22-1",
  "role": "user",
  "avatarUrl": "https://example.com/photo.jpg",
  "theme": "dark",
  "notifications": true,
  "createdAt": "2026-04-01T12:00:00.000Z",
  "updatedAt": "2026-04-10T15:30:00.000Z"
}
```

---

### `GET /webapp/v1/users/stats`

Получить статистику посещаемости текущего пользователя.

**Ответ:**

```json
{
  "attended": 12
}
```

---

### `POST /webapp/v1/users/notifications`

Обновить настройку уведомлений.

**Body:**

```json
{
  "enabled": true
}
```

**Ответ:**

```json
{
  "notifications": true
}
```

---

### `POST /webapp/v1/users/register`

Привязать аккаунт MAX к пользователю по QR-коду. **InitDataOnly** — не требует существующего пользователя, только валидный InitData.

**Body:**

```json
{
  "guid": "string (max 36)"
}
```

`guid` — идентификатор пользователя из QR-кода, созданного администратором.

**Ответ:** сущность User

**Ошибки:**
- `409` — «Пользователь уже зарегистрирован» (xamId уже привязан)
- `409` — «Этот Telegram-аккаунт уже привязан к другому пользователю»

---

### `POST /webapp/v1/users/create`

Создать пользователя. **Роль: admin.**

**Body:**

| Поле | Тип | Обязательный | Описание |
|---|---|---|---|
| `firstName` | string(100) | Да | Имя |
| `lastName` | string(100) | Да | Фамилия |
| `group` | string(22) | Да | Учебная группа |
| `institute` | string(36) | Да | GUID института |
| `role` | string(16) | Нет | Роль (по умолчанию `user`) |
| `avatarUrl` | string(500) | Нет | URL аватара |

```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "group": "КБ-б-о-22-1",
  "institute": "institute-guid-here",
  "role": "user"
}
```

Пользователь создаётся с `xamId = 0`. После сканирования QR-кода через `/users/register` привязывается аккаунт MAX.

---

### `POST /webapp/v1/users/update`

Обновить пользователя. **Роль: admin.**

**Body:**

| Поле | Тип | Обязательный | Описание |
|---|---|---|---|
| `guid` | string(36) | Да | GUID пользователя |
| `firstName` | string(100) | Нет | Имя |
| `lastName` | string(100) | Нет | Фамилия |
| `group` | string(22) | Нет | Учебная группа |
| `institute` | string(36) | Нет | GUID института |
| `role` | string(16) | Нет | Роль |
| `avatarUrl` | string(500) | Нет | URL аватара |

Передаются только изменяемые поля.

---

### `DELETE /webapp/v1/users`

Удалить пользователя. **Роль: admin.**

**Body:**

```json
{
  "guid": "string (max 36)"
}
```

---

## Institutes — `/webapp/v1/institutes`

### `GET /webapp/v1/institutes`

**Public** — получить список всех институтов.

**Ответ:** массив `InstitutePresented[]`

```json
[
  {
    "guid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Институт информационных технологий и телекоммуникаций",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-01T12:00:00.000Z"
  }
]
```

---

### `GET /webapp/v1/institutes/users`

Получить пользователей института с пагинацией. **Роль: admin.**

**Query параметры:**

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|---|---|---|---|---|
| `guid` | string(36) | Да | — | GUID института |
| `limit` | number (1-100) | Нет | 20 | Количество записей |
| `offset` | number (≥0) | Нет | 0 | Смещение |

**Ответ:**

```json
{
  "users": [ ... ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

### `POST /webapp/v1/institutes/create`

Создать институт. **Роль: admin.**

**Body:**

```json
{
  "name": "string (max 255)"
}
```

---

### `POST /webapp/v1/institutes/update`

Обновить институт. **Роль: admin.**

**Body:**

```json
{
  "guid": "string (max 36)",
  "name": "string (max 255)"
}
```

`name` — опциональное поле.

---

### `DELETE /webapp/v1/institutes`

Удалить институт. **Роль: admin.** Каскадно удаляет всех пользователей института.

**Body:**

```json
{
  "guid": "string (max 36)"
}
```
