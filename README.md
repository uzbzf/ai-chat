# AI Chat Widget

Виджет чата ИИ-агента в стиле Jivo (плавающая кнопка + панель).

## Запуск

```bash
npm install
VITE_USE_MOCKS=true npm run dev
```

На Windows (PowerShell): `$env:VITE_USE_MOCKS="true"; npm run dev`

Моки включены по умолчанию через файл `.env`.

## Сборка

```bash
npm run build
npm run preview
```

## Dev: загрузка диалога из моков

Откройте `?seed=conv-2` в URL, чтобы подставить сообщения из мок-диалога.
