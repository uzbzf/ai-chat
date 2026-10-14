import { generateReply, generateVoiceReply } from '../server/gemini.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { message, history, audio } = req.body ?? {}
    const prior = Array.isArray(history) ? history : []

    if (audio?.data && audio?.mimeType) {
      const { transcript, reply } = await generateVoiceReply(
        { base64: audio.data, mimeType: audio.mimeType },
        prior,
      )
      res.status(200).json({ transcript, reply })
      return
    }

    if (typeof message !== 'string') {
      res.status(400).json({ error: 'Нужен текст или голосовое сообщение' })
      return
    }

    const reply = await generateReply(message, prior)
    res.status(200).json({ reply })
  } catch (err) {
    const text = err instanceof Error ? err.message : 'Ошибка сервера'
    console.error('[api/chat]', err)
    res.status(500).json({ error: text })
  }
}
