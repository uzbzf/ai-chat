const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

const assistantPool = [
  'Поняла ваш вопрос. Сейчас уточню детали и предложу вариант.',
  'Спасибо за сообщение! Кратко: это можно настроить в разделе «Интеграции».',
  'Хороший вопрос. Рекомендую начать с бесплатного тарифа и протестировать виджет на staging.',
  'Могу прислать пошаговую инструкцию на почту, если оставите email в чате.',
  'Обычно это занимает до 5 минут после сохранения настроек. Обновите страницу с кэшем (Ctrl+F5).',
  'Да, такая опция доступна на тарифе «Про» и выше.',
  'Если нужно, могу передать диалог менеджеру — он ответит в рабочие часы.',
  'Проверьте, что скрипт виджета загружается без ошибок в консоли браузера.',
  'Для вашего сценария подойдёт автоматическое приветствие и 3 быстрых ответа.',
]

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchAssistantReply(userText: string): Promise<string> {
  const latency = 800 + Math.floor(Math.random() * 700)
  await delay(latency)

  if (!useMocks) {
    throw new Error('API не подключён. Установите VITE_USE_MOCKS=true для демо.')
  }

  const trimmed = userText.trim()
  if (trimmed.length < 80) {
    return `Вы спросили: «${trimmed}». ${pickRandom(assistantPool)}`
  }
  return pickRandom(assistantPool)
}
