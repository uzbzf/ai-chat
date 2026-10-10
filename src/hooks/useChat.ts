import { useCallback, useMemo, useState } from 'react'
import { fetchAssistantReply } from '../api/chatClient'
import { mockAgent } from '../mocks/agent.mock'
import { getConversationById } from '../mocks/conversations.mock'
import type { Message } from '../types/chat'

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createGreetingMessage(): Message {
  return {
    id: 'greeting',
    role: 'assistant',
    content: mockAgent.greeting,
    createdAt: new Date().toISOString(),
    status: 'sent',
  }
}

function getInitialMessages(): Message[] {
  const params = new URLSearchParams(window.location.search)
  const seed = params.get('seed')
  if (seed) {
    const conv = getConversationById(seed)
    if (conv?.messages.length) {
      return [...conv.messages]
    }
  }
  return [createGreetingMessage()]
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages())
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const hasUserMessages = useMemo(
    () => messages.some((m) => m.role === 'user'),
    [messages],
  )

  const openChat = useCallback(() => {
    setIsOpen(true)
    setUnreadCount(0)
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleChat = useCallback(() => {
    setIsOpen((open) => {
      if (!open) setUnreadCount(0)
      return !open
    })
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      const userMessage: Message = {
        id: createId('user'),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
        status: 'sent',
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      try {
        const replyText = await fetchAssistantReply(trimmed)
        const assistantMessage: Message = {
          id: createId('assistant'),
          role: 'assistant',
          content: replyText,
          createdAt: new Date().toISOString(),
          status: 'sent',
        }
        setMessages((prev) => [...prev, assistantMessage])
        if (!isOpen) {
          setUnreadCount((c) => c + 1)
        }
      } finally {
        setIsTyping(false)
      }
    },
    [isTyping, isOpen],
  )

  return {
    messages,
    isOpen,
    isTyping,
    unreadCount,
    hasUserMessages,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    agent: mockAgent,
  }
}
