import { lazy, Suspense, useEffect, useRef } from 'react'
import type { AgentProfile, Message } from '../../types/chat'
import styles from '../../styles/widget.module.css'

const ChatBackground3D = lazy(() =>
  import('./ChatBackground3D').then((m) => ({ default: m.ChatBackground3D })),
)
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

type Props = {
  messages: Message[]
  agent: AgentProfile
  isTyping: boolean
}

export function MessageList({ messages, agent, isTyping }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className={styles.messages} role="log" aria-live="polite">
      <Suspense fallback={null}>
        <ChatBackground3D />
      </Suspense>
      <div className={styles.messagesForeground}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} agent={agent} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>
    </div>
  )
}
