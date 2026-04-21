# Развёртывание

## Docker-образы

Проект содержит Dockerfile для каждого сервиса. Оба используют multi-stage сборку на базе Node.js 24 Alpine.

### Backend Dockerfile

```dockerfile
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY types ./types
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY types ./types
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Этап builder**: устанавливает все зависимости, компилирует TypeScript в JavaScript.

**Этап production**: устанавливает только production-зависимости, копирует скомпилированный код. Итоговый образ не содержит исходников и dev-зависимостей.

### Frontend Dockerfile

```dockerfile
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.mts ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json env.d.ts ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Этап builder**: собирает Vue-приложение через Vite. На выходе — статические файлы в `dist/`.

**Этап production**: Nginx Alpine раздаёт статику. Конфигурация включает SPA fallback (`try_files $uri $uri/ /index.html`) и кеширование ассетов на 1 год.

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

- `try_files` — все маршруты Vue Router обрабатываются через `index.html`
- `/assets/` — Vite генерирует файлы с хешами в именах, поэтому безопасно кешировать на год

---

## Docker Compose

### Полный стек (корень репозитория)

Файл `docker-compose.example.yml` в корне проекта поднимает все три сервиса:

```yaml
services:
  front:
    build: ./front
    container_name: ncfu-front
    restart: unless-stopped
    ports:
      - '${FRONT_PORT:-8080}:80'
    depends_on:
      - back

  back:
    build: ./back
    container_name: ncfu-back
    restart: unless-stopped
    ports:
      - '${APP_PORT:-3000}:3000'
    env_file:
      - ./back/.env
    depends_on:
      mariadb:
        condition: service_healthy

  mariadb:
    image: mariadb:latest
    container_name: mariadb-ncfu
    restart: unless-stopped
    ports:
      - '26670:3306'
    environment:
      MYSQL_ROOT_PASSWORD: ${DATABASE_PASSWORD:-QazWsx123}
      MYSQL_DATABASE: ${DATABASE_NAME:-ncfu}
    volumes:
      - ./mariadb:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 5s
      timeout: 5s
      retries: 10
```

#### Порядок запуска

1. Скопируйте конфигурацию:

```bash
cp docker-compose.example.yml docker-compose.yml
```

2. Настройте `back/.env`. Для Docker-окружения хост БД — имя сервиса:

```dotenv
DATABASE_SQL_URL=mysql://root:QazWsx123@mariadb:3306/ncfu
APP_PORT=3000
APP_HOST=0.0.0.0
BOT_TOKEN=your_bot_token
CORS_ORIGINS=http://localhost:*
```

3. Запустите:

```bash
docker compose up -d --build
```

4. Проверьте:

```bash
docker compose ps
docker compose logs -f back
```

#### Сервисы и порты

| Сервис | Контейнер | Внутренний порт | Внешний порт |
|---|---|---|---|
| Frontend (Nginx) | `ncfu-front` | 80 | 8080 |
| Backend (Node.js) | `ncfu-back` | 3000 | 3000 |
| MariaDB | `mariadb-ncfu` | 3306 | 26670 |

#### Зависимости между сервисами

<ClientOnly>
  <Mermaid graph="flowchart LR
    front[ncfu-front :8080] -->|depends_on| back[ncfu-back :3000]
    back -->|depends_on service_healthy| db[mariadb-ncfu :26670]" />
</ClientOnly>

- `mariadb` запускается первым, backend ждёт healthcheck
- `back` запускается после готовности БД
- `front` запускается после backend

#### Volumes

- `./mariadb:/var/lib/mysql` — данные MariaDB сохраняются на хосте. При `docker compose down` данные не теряются. Для полной очистки: `docker compose down -v` и удалите папку `./mariadb`

---

### Только backend (папка back/)

```bash
cd back
docker compose up -d --build
```

Поднимает `ncfu-back` (порт 3000) и `mariadb` (порт 27006).

---

## Обновление

### Пересборка после изменений

```bash
docker compose up -d --build
```

Docker пересоберёт только изменённые образы благодаря кешированию слоёв.

### Обновление только одного сервиса

```bash
docker compose up -d --build back    # Только backend
docker compose up -d --build front   # Только frontend
```

### Просмотр логов

```bash
docker compose logs -f              # Все сервисы
docker compose logs -f back         # Только backend
docker compose logs -f mariadb      # Только БД
```

---

## Миграции базы данных

При запуске backend автоматически применяет все pending-миграции:

```typescript
const migrator = orm.migrator;
await migrator.up();
```

Для ручного управления миграциями (в dev-окружении):

```bash
# Создать новую миграцию
npm run db:migration:create

# Применить миграции
npm run db:migration:up

# Откатить последнюю миграцию
npm run db:migration:down

# Обновить схему напрямую (без миграций, только для разработки)
npm run db:schema:update
```

---

## Переменные окружения

### Backend (`back/.env`)

| Переменная | Обязательная | По умолчанию | Описание |
|---|---|---|---|
| `NODE_ENV` | Нет | `development` | Окружение |
| `DATABASE_SQL_URL` | Да | — | URL подключения к MariaDB |
| `APP_PORT` | Нет | `3000` | Порт сервера |
| `APP_HOST` | Нет | `0.0.0.0` | Хост сервера |
| `BOT_TOKEN` | Да | — | Токен бота MAX для валидации InitData |
| `CORS_ORIGINS` | Нет | `http://localhost:*` | Разрешённые origins (через запятую, поддерживает wildcard) |
| `DATABASE_LOGGING` | Нет | `false` | Логирование SQL-запросов |

### Frontend (`front/.env`)

| Переменная | Обязательная | По умолчанию | Описание |
|---|---|---|---|
| `VITE_API_BASE_URL` | Да | — | URL backend API |
