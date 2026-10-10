import { useCallback, useState, type KeyboardEvent } from 'react'
import styles from '../../styles/widget.module.css'
import { SendIcon } from './Icons'

type Props = {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend])

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={styles.inputArea}>
      <div className={styles.inputWrap}>
        <textarea
          className={styles.textarea}
          rows={1}
          placeholder="Напишите сообщение…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          aria-label="Сообщение"
        />
        <button
          type="button"
          className={styles.sendBtn}
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Отправить"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
