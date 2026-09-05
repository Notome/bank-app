# bank-app

Fullstack банковское приложение (дипломный проект): FastAPI backend + Next.js frontend + nginx, в docker-compose.

## Структура
- `backend/` — FastAPI (auth, аккаунты, карты, переводы), SQLAlchemy (async)
- `frontend/` — Next.js (App Router, TypeScript, Tailwind)
- `nginx/` — конфиг реверс-прокси
- `docs/` — отчёт по дипломной работе
- `archive/` — более ранние версии этого же проекта, сохранены для истории:
  - `diploma1-backend/`, `diploma2-backend/`, `diploma3-backend/` — эволюция backend'а
  - `vite-frontend-v1/` — более ранний фронтенд на Vite+React (до перехода на Next.js)

