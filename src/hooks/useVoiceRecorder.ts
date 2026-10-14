import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_MS = 45_000

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]
  return candidates.find((t) => MediaRecorder.isTypeSupported(t))
}

type Options = {
  onComplete?: (blob: Blob) => void
}

export function useVoiceRecorder(options: Options = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number>(0)
  const startedAtRef = useRef(0)
  const discardedRef = useRef(false)
  const onCompleteRef = useRef(options.onComplete)
  onCompleteRef.current = options.onComplete

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const stopInternal = useCallback(() => {
    window.clearInterval(timerRef.current)
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      rec.stop()
    } else {
      cleanupStream()
      setIsRecording(false)
    }
  }, [])

  useEffect(() => () => stopInternal(), [stopInternal])

  const start = useCallback(async () => {
    if (isRecording) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new Error('Браузер не поддерживает запись голоса')
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    chunksRef.current = []
    discardedRef.current = false

    const mimeType = pickMimeType()
    const rec = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)

    recorderRef.current = rec
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    rec.onstop = () => {
      cleanupStream()
      setIsRecording(false)
      const type = rec.mimeType || mimeType || 'audio/webm'
      const blob = chunksRef.current.length
        ? new Blob(chunksRef.current, { type })
        : null
      if (!discardedRef.current && blob) {
        onCompleteRef.current?.(blob)
      }
    }

    rec.start(250)
    startedAtRef.current = Date.now()
    setSeconds(0)
    setIsRecording(true)
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current
      setSeconds(Math.floor(elapsed / 1000))
      if (elapsed >= MAX_MS) stopInternal()
    }, 250)
  }, [isRecording, stopInternal])

  const stop = useCallback(() => {
    if (!isRecording) return
    discardedRef.current = false
    stopInternal()
  }, [isRecording, stopInternal])

  const cancel = useCallback(() => {
    discardedRef.current = true
    chunksRef.current = []
    stopInternal()
  }, [stopInternal])

  return { isRecording, seconds, start, stop, cancel }
}
