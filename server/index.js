import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import { generateReply, generateVoiceReply, getModelCandidates } from './gemini.js'
import { getWorkshopPhone } from './systemPrompt.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(rootDir, '.env') })

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors({ origin: true }))
app.use(express.json({ limit: '8mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    models: getModelCandidates(),
    workshopPhone: getWorkshopPhone(),
  })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, audio } = req.body ?? {}
    const prior = Array.isArray(history) ? history : []

    if (audio?.data && audio?.mimeType) {
      const { transcript, reply } = await generateVoiceReply(
        { base64: audio.data, mimeType: audio.mimeType },
        prior,
      )
      res.json({ transcript, reply })
      return
    }

    if (typeof message !== 'string') {
      res.status(400).json({ error: 'Нужен текст или голосовое сообщение' })
      return
    }

    const reply = await generateReply(message, prior)
    res.json({ reply })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка сервера'
    console.error('[api/chat]', err)
    res.status(500).json({ error: message })
  }
})

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Голосовое слишком большое. Запишите короче (до 45 секунд).' })
    return
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'Некорректный запрос' })
    return
  }
  console.error('[api]', err)
  res.status(500).json({ error: err?.message || 'Ошибка сервера' })
})

app.listen(port, () => {
  console.log(`[api] http://localhost:${port}`)
})
