import { useChat } from '../../hooks/useChat'
import { useTheme } from '../../hooks/useTheme'
import styles from '../../styles/widget.module.css'
import { ChatLauncher } from './ChatLauncher'
import { ChatPanel } from './ChatPanel'

export function ChatWidget() {
  const { theme, toggleTheme } = useTheme()
  const chat = useChat()

  return (
    <div
      className={styles.root}
      style={{ ['--chat-accent' as string]: chat.agent.accentColor }}
    >
      {chat.isOpen && (
        <ChatPanel
          agent={chat.agent}
          messages={chat.messages}
          isTyping={chat.isTyping}
          hasUserMessages={chat.hasUserMessages}
          theme={theme}
          onToggleTheme={toggleTheme}
          onMinimize={chat.closeChat}
          onClose={chat.closeChat}
          onSend={chat.sendMessage}
          onSendVoice={chat.sendVoice}
        />
      )}
      <ChatLauncher
        agent={chat.agent}
        onClick={chat.isOpen ? chat.closeChat : chat.openChat}
        hidden={chat.isOpen}
        unreadCount={chat.unreadCount}
      />
    </div>
  )
}
