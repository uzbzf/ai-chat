import type { Message } from '../types/chat'
import { workshopPhone } from '../config/shop'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 45_000
const VOICE_TIMEOUT_MS = 70_000

const assistantPool = [
  'Уточните, пожалуйста, марку, модель и год авто — подберу подходящий товар из каталога.',
  'Для этого масла обычно указывают допуск API и вязкость по SAE — напишите, какой двигатель у вас.',
  'Такой аккумулятор бывает в линейке 60–75 А·ч; важны габариты и полярность под вашу модель.',
  'Доставка автотоваров по городу обычно 1–2 дня; точные сроки зависят от наличия на складе.',
  'По установке и ремонту лучше проконсультироваться в автомастерской: ' + workshopPhone,
  'Этот вопрос не про товары из каталога — позвоните в мастерскую: ' + workshopPhone,
]

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function readJson(res: Response): Promise<{
  reply?: string
  transcript?: string
  error?: string
}> {
  const raw = await res.text()
  if (!raw) return {}
  try {
    return JSON.parse(raw) as {
      reply?: string
      transcript?: string
      error?: string
    }
  } catch {
    return { error: `Ошибка API (${res.status})` }
  }
}

async function fetchFromGeminiApi(
  userText: string,
  priorMessages: Message[],
): Promise<string> {
  const url = `${apiBase}/api/chat`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userText,
      history: priorMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const data = await readJson(res)

  if (!res.ok) {
    throw new Error(data.error || `Ошибка API (${res.status})`)
  }

  if (!data.reply?.trim()) {
    throw new Error('Пустой ответ от сервера')
  }

  return data.reply.trim()
}

async function fetchMockReply(userText: string): Promise<string> {
  const latency = 800 + Math.floor(Math.random() * 700)
  await delay(latency)

  const trimmed = userText.trim()
  if (trimmed.length < 80) {
    return `Вы спросили: «${trimmed}». ${pickRandom(assistantPool)}`
  }
  return pickRandom(assistantPool)
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Не удалось прочитать аудио'))
    reader.readAsDataURL(blob)
  })
}

export async function fetchAssistantReply(
  userText: string,
  priorMessages: Message[] = [],
): Promise<string> {
  if (useMocks) {
    return fetchMockReply(userText)
  }
  try {
    return await fetchFromGeminiApi(userText, priorMessages)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new Error('Сервер слишком долго отвечает. Попробуйте ещё раз.')
    }
    throw err
  }
}

export async function fetchAssistantReplyFromVoice(
  blob: Blob,
  priorMessages: Message[] = [],
): Promise<{ transcript: string; reply: string }> {
  if (useMocks) {
    await delay(900)
    return {
      transcript: 'Подберите масло 5W-30 для Kia Rio 2017',
      reply: pickRandom(assistantPool),
    }
  }

  try {
    const data = await blobToBase64(blob)
    const url = `${apiBase}/api/chat`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio: {
          data,
          mimeType: blob.type || 'audio/webm',
        },
        history: priorMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal: AbortSignal.timeout(VOICE_TIMEOUT_MS),
    })

    const payload = await readJson(res)

    if (!res.ok) {
      throw new Error(payload.error || `Ошибка API (${res.status})`)
    }
    if (!payload.reply?.trim()) {
      throw new Error('Пустой ответ от сервера')
    }

    return {
      transcript: payload.transcript?.trim() || 'Голосовое сообщение',
      reply: payload.reply.trim(),
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new Error('Сервер слишком долго отвечает. Попробуйте ещё раз.')
    }
    throw err
  }
}
