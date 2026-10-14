# AI Chat Widget

Виджет чата ИИ-агента в стиле Jivo (плавающая кнопка + панель). Ответы ассистента — через **backend + Google Gemini**.

## Быстрый старт (Gemini)

1. Скопируйте `.env.example` → `.env`
2. Укажите `GEMINI_API_KEY` ([Google AI Studio](https://aistudio.google.com/apikey))
3. Установите `VITE_USE_MOCKS=false`
4. Запуск:

```bash
npm install
npm run dev
```

Откроются **API** (`http://localhost:3001`) и **фронт** (`http://localhost:5173`). Vite проксирует `/api` на backend.

В чате можно **записать голосовое** (кнопка микрофона): браузер запросит доступ к микрофону, запись уходит на Gemini (распознавание + ответ). Нужен HTTPS или `localhost`.

PowerShell:

```powershell
npm install
npm run dev
```

## Только моки (без Gemini)

В `.env`: `VITE_USE_MOCKS=true`, затем `npm run dev:client`.

## Сборка фронта

```bash
npm run build
npm run preview
```

Backend для продакшена: `npm run start:server` (нужны переменные из `.env`).

## Dev: история из моков

`?seed=conv-2` в URL — подставить сообщения из мок-диалога.

## API

- `GET /api/health` — статус и наличие ключа
- `POST /api/chat` — текст `{ "message", "history" }` или голос `{ "audio": { "data": "<base64>", "mimeType": "audio/webm" }, "history" }`
