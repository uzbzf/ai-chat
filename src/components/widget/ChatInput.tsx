import { useCallback, useState, type KeyboardEvent } from 'react'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import styles from '../../styles/widget.module.css'
import { MicIcon, SendIcon, StopIcon } from './Icons'

type Props = {
  onSend: (text: string) => void
  onSendVoice: (blob: Blob) => void
  disabled?: boolean
}

function formatClock(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ChatInput({ onSend, onSendVoice, disabled }: Props) {
  const [value, setValue] = useState('')
  const [micError, setMicError] = useState<string | null>(null)
  const voice = useVoiceRecorder({
    onComplete: (blob) => {
      if (blob.size > 800) {
        onSendVoice(blob)
      } else {
        setMicError('Слишком короткое сообщение. Запишите ещё раз.')
      }
    },
  })

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled || voice.isRecording) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend, voice.isRecording])

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const toggleVoice = async () => {
    setMicError(null)
    if (voice.isRecording) {
      voice.stop()
      return
    }

    try {
      await voice.start()
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicError('Разрешите доступ к микрофону в браузере.')
      } else if (err instanceof Error) {
        setMicError(err.message)
      } else {
        setMicError('Не удалось включить микрофон.')
      }
    }
  }

  return (
    <div className={styles.inputArea}>
      {voice.isRecording ? (
        <div className={styles.recordingBar} role="status">
          <span className={styles.recordingDot} />
          <span>Идёт запись {formatClock(voice.seconds)}</span>
          <span className={styles.recordingHint}>Нажмите ещё раз, чтобы отправить</span>
        </div>
      ) : null}
      {micError ? <p className={styles.micError}>{micError}</p> : null}
      <div className={styles.inputWrap}>
        <button
          type="button"
          className={`${styles.micBtn} ${voice.isRecording ? styles.micBtnActive : ''}`}
          onClick={() => void toggleVoice()}
          disabled={disabled}
          aria-label={voice.isRecording ? 'Остановить запись и отправить' : 'Записать голосовое'}
          aria-pressed={voice.isRecording}
        >
          {voice.isRecording ? <StopIcon /> : <MicIcon />}
        </button>
        <textarea
          className={styles.textarea}
          rows={1}
          placeholder={
            voice.isRecording ? 'Говорите…' : 'Напишите или запишите голосовое…'
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled || voice.isRecording}
          aria-label="Сообщение"
        />
        <button
          type="button"
          className={styles.sendBtn}
          onClick={submit}
          disabled={disabled || voice.isRecording || !value.trim()}
          aria-label="Отправить"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
