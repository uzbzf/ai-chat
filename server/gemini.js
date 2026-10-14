import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildAgentSystemPrompt } from './systemPrompt.js'

const DEFAULT_MODEL_CANDIDATES = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
]

const MAX_HISTORY_TURNS = 24
const MAX_ATTEMPTS_PER_MODEL = 2
const ATTEMPT_TIMEOUT_MS = 12000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Таймаут ${label} (${ms}мс)`)), ms)
    }),
  ])
}

function getModelCandidates() {
  const primary = process.env.GEMINI_MODEL?.trim()
  const fromEnv = process.env.GEMINI_MODEL_FALLBACKS
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const fallbacks = fromEnv?.length ? fromEnv : DEFAULT_MODEL_CANDIDATES

  const ordered = primary
    ? [primary, ...fallbacks.filter((m) => m !== primary)]
    : fallbacks

  return [...new Set(ordered)]
}

function errorText(err) {
  return err instanceof Error ? err.message : String(err)
}

function isRetryableError(err) {
  return /503|429|UNAVAILABLE|high demand|overloaded|Resource exhausted|try again later|Таймаут/i.test(
    errorText(err),
  )
}

function isAuthError(err) {
  return /API key|API_KEY|403|401|PERMISSION_DENIED/i.test(errorText(err))
}

function toUserFacingError(err) {
  if (isRetryableError(err)) {
    return 'Сервис Gemini временно перегружен. Подождите минуту и отправьте сообщение снова.'
  }
  if (isAuthError(err)) {
    return 'Проверьте GEMINI_API_KEY в файле .env.'
  }
  if (/404|not found|no longer available/i.test(errorText(err))) {
    return 'Доступные модели Gemini сейчас недоступны. Попробуйте позже.'
  }
  return 'Не удалось получить ответ от Gemini. Попробуйте позже.'
}

function toGeminiHistory(messages) {
  const mapped = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

  while (mapped.length > 0 && mapped[0].role === 'model') {
    mapped.shift()
  }

  return mapped
}

async function runWithFallbacks(run) {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY не задан. Добавьте ключ в файл .env')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const systemInstruction = buildAgentSystemPrompt()
  const candidates = getModelCandidates()
  let lastError = null

  for (const modelName of candidates) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const value = await run({ genAI, modelName, systemInstruction })
        if (modelName !== candidates[0]) {
          console.warn(`[gemini] ответ через запасную модель: ${modelName}`)
        }
        return value
      } catch (err) {
        lastError = err
        console.warn(
          `[gemini] ${modelName} попытка ${attempt}/${MAX_ATTEMPTS_PER_MODEL}:`,
          errorText(err).slice(0, 240),
        )

        if (isAuthError(err)) {
          throw new Error(toUserFacingError(err))
        }

        if (isRetryableError(err) && attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(500 * attempt)
          continue
        }

        break
      }
    }
  }

  throw new Error(toUserFacingError(lastError))
}

async function generateWithModel(genAI, modelName, systemInstruction, history, text) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  })
  const chat = model.startChat({ history })
  const result = await withTimeout(
    chat.sendMessage(text),
    ATTEMPT_TIMEOUT_MS,
    modelName,
  )
  let reply = ''
  try {
    reply = result.response.text()?.trim() || ''
  } catch (err) {
    throw new Error(errorText(err) || 'Модель не вернула текст')
  }
  if (!reply) throw new Error('Пустой ответ от модели')
  return reply
}

function parseVoicePayload(raw) {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    const parsed = JSON.parse(cleaned)
    const transcript = String(parsed.transcript ?? '').trim()
    const reply = String(parsed.reply ?? '').trim()
    if (reply) return { transcript, reply }
  } catch {
    /* plain text fallback */
  }
  return { transcript: '', reply: raw }
}

async function generateVoiceWithModel(
  genAI,
  modelName,
  systemInstruction,
  history,
  audio,
) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  })
  const chat = model.startChat({ history })
  const result = await withTimeout(
    chat.sendMessage([
      {
        inlineData: {
          mimeType: normalizeAudioMime(audio.mimeType),
          data: audio.base64,
        },
      },
      {
        text: `Это голосовое сообщение клиента на русском. Распознай речь и ответь по правилам системного промпта.
Верни ТОЛЬКО JSON вида {"transcript":"текст того, что сказал клиент","reply":"твой ответ"}.
Если речь неразборчива, transcript пустой, а в reply вежливо попроси повторить.`,
      },
    ]),
    25000,
    modelName,
  )
  let raw = ''
  try {
    raw = result.response.text()?.trim() || ''
  } catch (err) {
    throw new Error(errorText(err) || 'Модель не вернула текст')
  }
  if (!raw) throw new Error('Пустой ответ от модели')
  return parseVoicePayload(raw)
}

export async function generateReply(userMessage, priorMessages = []) {
  const text = userMessage?.trim()
  if (!text) {
    throw new Error('Пустое сообщение')
  }

  const history = toGeminiHistory(priorMessages)
  return runWithFallbacks(({ genAI, modelName, systemInstruction }) =>
    generateWithModel(genAI, modelName, systemInstruction, history, text),
  )
}

const ALLOWED_AUDIO = /^(audio\/(webm|ogg|mp4|mpeg|wav|x-wav|x-m4a|aac|opus)|video\/webm)/i

function normalizeAudioMime(raw) {
  const base = String(raw || '')
    .split(';')[0]
    .trim()
    .toLowerCase()
  if (base === 'video/webm' || base === 'audio/opus') return 'audio/webm'
  if (base === 'audio/x-m4a') return 'audio/mp4'
  if (base === 'audio/x-wav') return 'audio/wav'
  return base || 'audio/webm'
}

export async function generateVoiceReply(audio, priorMessages = []) {
  if (!audio?.base64 || !audio?.mimeType) {
    throw new Error('Не передано голосовое сообщение')
  }
  const mimeType = normalizeAudioMime(audio.mimeType)
  if (!ALLOWED_AUDIO.test(mimeType)) {
    throw new Error('Неподдерживаемый формат аудио')
  }
  if (audio.base64.length > 8_000_000) {
    throw new Error('Голосовое слишком длинное. Запишите короче.')
  }

  const history = toGeminiHistory(priorMessages)
  return runWithFallbacks(({ genAI, modelName, systemInstruction }) =>
    generateVoiceWithModel(genAI, modelName, systemInstruction, history, {
      ...audio,
      mimeType,
    }),
  )
}

export { getModelCandidates }
