import type { AgentProfile, Message } from '../../types/chat'
import styles from '../../styles/widget.module.css'

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

type Props = {
  message: Message
  agent: AgentProfile
}

export function MessageBubble({ message, agent }: Props) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : ''}`}
    >
      {!isUser ? (
        <div className={styles.messageAvatar} aria-hidden>
          {agent.initials}
        </div>
      ) : (
        <div className={styles.messageAvatarSpacer} />
      )}
      <div>
        <div
          className={`${styles.bubble} ${
            isUser ? styles.bubbleUser : styles.bubbleAssistant
          }`}
        >
          {message.content}
        </div>
        <div
          className={`${styles.messageTime} ${isUser ? styles.messageTimeUser : ''}`}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  )
}
