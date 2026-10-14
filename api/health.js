import { getModelCandidates } from '../server/gemini.js'
import { getWorkshopPhone } from '../server/systemPrompt.js'

export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    models: getModelCandidates(),
    workshopPhone: getWorkshopPhone(),
  })
}
