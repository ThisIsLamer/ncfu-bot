<div align="center">

# 📅 NCFU Events

Система учёта мероприятий и посещаемости для университета СКФУ.

Веб-приложение для мессенджера MAX — создание событий, регистрация участников через QR-коды и контроль посещаемости.

![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.6-000000?logo=fastify&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-4.0-1867C0?logo=vuetify&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-10.6-003545?logo=mariadb&logoColor=white)
![MikroORM](https://img.shields.io/badge/MikroORM-7.0-E83524)
![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859)
![Zod](https://img.shields.io/badge/Zod-4.3-3E67B1?logo=zod&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-alpine-009639?logo=nginx&logoColor=white)

[Документация](https://docs.ncfu.lmrsc.su) · [Приложение](https://ncfu.lmrsc.su) · [API](https://api.ncfu.lmrsc.su/echo)

</div>

---

## Доступные адреса

| Сервис | URL |
|---|---|
| Документация | https://docs.ncfu.lmrsc.su |
| Приложение | https://ncfu.lmrsc.su |
| API | https://api.ncfu.lmrsc.su |

---

## Возможности

- 📅 **Управление мероприятиями** — создание событий с типами, локацией, вместимостью и цветовой маркировкой
- 📊 **Контроль посещаемости** — регистрация участников и отметка присутствия через QR-сканер
- 🏛️ **Институты** — привязка пользователей к институтам и учебным группам
- 👥 **Ролевая модель** — студент, организатор, администратор с отдельными интерфейсами
- 🤖 **Бот MAX** — команды и cron-уведомления о мероприятиях
- 📱 **MAX WebApp** — работает как встроенное приложение внутри мессенджера

## Стек технологий

**Backend:** Node.js 24, TypeScript, Fastify, MikroORM, MariaDB, Zod, @maxhub/max-bot-api, node-cron

**Frontend:** Vue 3, Vuetify 4, Vite 8, Pinia, Vue Router, Axios, QRCode Vue3

**Инфраструктура:** Docker, Nginx, Traefik, VitePress

## Структура проекта

```
├── back/                # Backend (Fastify + Bot)
│   ├── src/
│   │   ├── bot/         # Бот MAX + планировщик уведомлений
│   │   ├── core/        # Декораторы, хуки, авторизация
│   │   ├── database/    # MikroORM конфиг и миграции
│   │   └── modules/     # REST API модули (events, users, institutes)
│   ├── Dockerfile
│   └── package.json
├── front/               # Frontend (Vue 3 + Vuetify)
│   ├── src/
│   │   ├── pages/       # Файловая маршрутизация
│   │   ├── api/         # HTTP-клиент
│   │   ├── stores/      # Pinia stores
│   │   └── plugins/     # Vuetify, i18n
│   ├── Dockerfile
│   └── package.json
├── docs/                # VitePress документация
└── docker-compose.example.yml
```

## Быстрый старт

### Docker Compose

```bash
# Клонируйте репозиторий
git clone <repo-url>
cd ncfu-bot

# Скопируйте конфигурацию
cp docker-compose.example.yml docker-compose.yml
cp back/.env.example back/.env

# Отредактируйте back/.env — укажите BOT_TOKEN и DATABASE_SQL_URL

# Запустите
docker compose up -d --build
```

Сервисы:
- **Frontend** — `http://localhost:8080`
- **Backend** — `http://localhost:3000`
- **MariaDB** — `localhost:26670`

### Локальная разработка

```bash
# База данных
docker run -d --name mariadb-ncfu -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=QazWsx123 \
  -e MYSQL_DATABASE=ncfu mariadb:latest

# Backend
cd back
npm install
cp .env.example .env  # отредактируйте
npm run db:schema:update
npm run dev

# Frontend (в отдельном терминале)
cd front
npm install
npm run dev
```

## Переменные окружения

### Backend (`back/.env`)

| Переменная | Описание |
|---|---|
| `DATABASE_SQL_URL` | URL подключения к MariaDB |
| `BOT_TOKEN` | Токен бота MAX |
| `APP_PORT` | Порт сервера (по умолчанию 3000) |
| `CORS_ORIGINS` | Разрешённые origins |
| `WEBAPP_URL` | URL фронтенда |

### Frontend (`front/.env`)

| Переменная | Описание |
|---|---|
| `VITE_API_BASE_URL` | URL backend API |

## Документация

Полная документация доступна в папке `docs/` и разворачивается через VitePress:

```bash
cd docs
npm install
npm run docs:dev
```

