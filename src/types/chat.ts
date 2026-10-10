export type MessageRole = 'user' | 'assistant'

export type MessageStatus = 'sending' | 'sent'

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  status?: MessageStatus
}

export interface Conversation {
  id: string
  title: string
  updatedAt: string
  messages: Message[]
}

export type AgentStatus = 'online' | 'away' | 'offline'

export interface AgentProfile {
  id: string
  name: string
  title: string
  initials: string
  accentColor: string
  status: AgentStatus
  greeting: string
  /** Кастомная картинка на кнопке; если не задано — встроенная минималистичная иконка */
  launcherAvatarUrl?: string
}
