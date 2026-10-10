import type { AgentProfile, Message } from '../../types/chat'
import type { Theme } from '../../hooks/useTheme'
import styles from '../../styles/widget.module.css'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { MessageList } from './MessageList'
import { QuickReplies } from './QuickReplies'

type Props = {
  agent: AgentProfile
  messages: Message[]
  isTyping: boolean
  hasUserMessages: boolean
  theme: Theme
  onToggleTheme: () => void
  onMinimize: () => void
  onClose: () => void
  onSend: (text: string) => void
}

export function ChatPanel({
  agent,
  messages,
  isTyping,
  hasUserMessages,
  theme,
  onToggleTheme,
  onMinimize,
  onClose,
  onSend,
}: Props) {
  return (
    <div className={styles.panel} role="dialog" aria-label="Чат с ассистентом">
      <ChatHeader
        agent={agent}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onMinimize={onMinimize}
        onClose={onClose}
      />
      <MessageList messages={messages} agent={agent} isTyping={isTyping} />
      <QuickReplies
        visible={!hasUserMessages}
        onSelect={onSend}
        disabled={isTyping}
      />
      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  )
}
