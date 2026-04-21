# Модели данных

## Диаграмма базы данных

<ClientOnly>
  <Mermaid graph="erDiagram
    Institute ||--o{ User : has
    User ||--o{ EventRegistration : registers
    Event ||--o{ EventRegistration : has
    Event }o--o{ EventType : categorized
    Institute {
        int id PK
        string guid UK
        string name UK
        datetime createdAt
        datetime updatedAt
    }
    User {
        int id PK
        string guid UK
        int xamId UK
        string firstName
        string lastName
        string group
        string role
        string avatarUrl
        string theme
        boolean notifications
        datetime createdAt
        datetime updatedAt
    }
    Event {
        int id PK
        string guid UK
        string title
        string description
        datetime date
        string location
        int capacity
        string color
        datetime createdAt
        datetime updatedAt
    }
    EventType {
        int id PK
        string guid UK
        string name UK
        datetime createdAt
        datetime updatedAt
    }
    EventRegistration {
        int id PK
        string guid UK
        boolean attended
        datetime createdAt
        datetime updatedAt
    }" />
</ClientOnly>

---

## BaseEntity

Все сущности наследуются от `BaseEntity`, которая предоставляет общие поля:

```typescript
export abstract class BaseEntity<Optional extends string = never> {
  @PrimaryKey({ type: 'integer' })
  id!: number;                    // Автоинкрементный PK

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();   // Дата создания

  @Property({ type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();   // Дата последнего обновления
}
```

Каждая сущность также имеет поле `guid` (UUID v4) — публичный идентификатор, используемый в API вместо числового `id`.

---

## Institute

Институт СКФУ. Содержит пользователей.

**Таблица**: `institute`

| Поле | Тип | Описание |
|---|---|---|
| `id` | int, PK | Автоинкрементный идентификатор |
| `guid` | string(36), unique | Публичный UUID |
| `name` | string(255), unique | Название института |
| `createdAt` | datetime | Дата создания |
| `updatedAt` | datetime | Дата обновления |

**Связи**:
- `OneToMany` → `User` — институт содержит множество пользователей. При удалении института каскадно удаляются все его пользователи (`Cascade.REMOVE`, `orphanRemoval: true`)

```typescript
@Entity()
export class Institute extends BaseEntity<'guid'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @Property({ type: 'string', length: 255, unique: true })
  name!: string;

  @OneToMany(() => User, (u) => u.institute, {
    cascade: [Cascade.REMOVE],
    orphanRemoval: true
  })
  users = new Collection<User>(this);
}
```

---

## User

Пользователь системы — студент, организатор или администратор.

**Таблица**: `user`

| Поле | Тип | Описание |
|---|---|---|
| `id` | int, PK | Автоинкрементный идентификатор |
| `guid` | string(36), unique | Публичный UUID |
| `xamId` | int, unique | ID пользователя в мессенджере MAX |
| `firstName` | string(100) | Имя |
| `lastName` | string(100) | Фамилия |
| `institute` | FK → Institute | Институт |
| `group` | string(22) | Учебная группа |
| `role` | string(16), default `'user'` | Роль: `user`, `organizer`, `admin` |
| `avatarUrl` | string(500), nullable | URL аватара из MAX |
| `theme` | string(8), default `'dark'` | Тема интерфейса: `dark` / `light` |
| `notifications` | boolean, default `true` | Включены ли уведомления |
| `createdAt` | datetime | Дата создания |
| `updatedAt` | datetime | Дата обновления |

**Связи**:
- `ManyToOne` → `Institute` — пользователь принадлежит одному институту

**Процесс регистрации**:
1. Администратор создаёт пользователя через API (`xamId = 0`)
2. Пользователь сканирует QR-код с `guid` в приложении MAX
3. Система привязывает `xamId` из InitData к записи пользователя
4. После привязки пользователь авторизуется автоматически

---

## Event

Мероприятие с датой, местом проведения и ограничением по вместимости.

**Таблица**: `event`

| Поле | Тип | Описание |
|---|---|---|
| `id` | int, PK | Автоинкрементный идентификатор |
| `guid` | string(36), unique | Публичный UUID |
| `title` | string(255) | Название мероприятия |
| `description` | string(2000) | Описание |
| `date` | datetime | Дата и время проведения |
| `location` | string(255) | Место проведения |
| `capacity` | int | Максимальное количество участников |
| `color` | string(7) | HEX-цвет для отображения в UI |
| `createdAt` | datetime | Дата создания |
| `updatedAt` | datetime | Дата обновления |

**Связи**:
- `ManyToMany` → `EventType` — мероприятие может иметь несколько типов/категорий
- `OneToMany` → `EventRegistration` — регистрации участников. Каскадное удаление при удалении мероприятия

---

## EventType

Тип/категория мероприятия (например: «Лекция», «Конференция», «Спорт»).

**Таблица**: `event_type`

| Поле | Тип | Описание |
|---|---|---|
| `id` | int, PK | Автоинкрементный идентификатор |
| `guid` | string(36), unique | Публичный UUID |
| `name` | string(100), unique | Название типа |
| `createdAt` | datetime | Дата создания |
| `updatedAt` | datetime | Дата обновления |

Используется для фильтрации мероприятий на фронтенде и в API.

---

## EventRegistration

Регистрация пользователя на мероприятие и отметка посещаемости.

**Таблица**: `event_registration`

| Поле | Тип | Описание |
|---|---|---|
| `id` | int, PK | Автоинкрементный идентификатор |
| `guid` | string(36), unique | Публичный UUID |
| `event` | FK → Event | Мероприятие |
| `user` | FK → User | Пользователь |
| `attended` | boolean, default `false` | Отметка о посещении |
| `createdAt` | datetime | Дата регистрации |
| `updatedAt` | datetime | Дата обновления |

**Ограничения**:
- `Unique(event, user)` — пользователь может зарегистрироваться на мероприятие только один раз

**Бизнес-логика**:
- При регистрации проверяется, не превышена ли вместимость мероприятия (`capacity`)
- Отметка посещаемости (`attended = true`) ставится организатором через QR-сканер
- Статистика посещаемости рассчитывается на основе соотношения `attended = true` к общему числу регистраций
