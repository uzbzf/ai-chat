import { useCallback, useMemo, useState } from 'react'
import { fetchAssistantReply, fetchAssistantReplyFromVoice } from '../api/chatClient'
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
        const replyText = await fetchAssistantReply(trimmed, messages)
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
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : 'Не удалось получить ответ'
        const assistantMessage: Message = {
          id: createId('assistant'),
          role: 'assistant',
          content: `Извините, сейчас не могу ответить: ${detail}`,
          createdAt: new Date().toISOString(),
          status: 'sent',
        }
        setMessages((prev) => [...prev, assistantMessage])
      } finally {
        setIsTyping(false)
      }
    },
    [isTyping, isOpen, messages],
  )

  const sendVoice = useCallback(
    async (blob: Blob) => {
      if (isTyping || blob.size < 800) return

      const userId = createId('user')
      const userMessage: Message = {
        id: userId,
        role: 'user',
        content: 'Голосовое сообщение…',
        createdAt: new Date().toISOString(),
        status: 'sending',
        source: 'voice',
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      try {
        const { transcript, reply } = await fetchAssistantReplyFromVoice(
          blob,
          messages,
        )
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userId
              ? {
                  ...m,
                  content: transcript || 'Голосовое сообщение',
                  status: 'sent',
                }
              : m,
          ),
        )
        setMessages((prev) => [
          ...prev,
          {
            id: createId('assistant'),
            role: 'assistant',
            content: reply,
            createdAt: new Date().toISOString(),
            status: 'sent',
          },
        ])
        if (!isOpen) {
          setUnreadCount((c) => c + 1)
        }
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : 'Не удалось распознать голос'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userId
              ? { ...m, content: 'Голосовое не отправлено', status: 'sent' }
              : m,
          ),
        )
        setMessages((prev) => [
          ...prev,
          {
            id: createId('assistant'),
            role: 'assistant',
            content: `Извините, не получилось обработать голосовое: ${detail}`,
            createdAt: new Date().toISOString(),
            status: 'sent',
          },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [isTyping, isOpen, messages],
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
    sendVoice,
    agent: mockAgent,
  }
}
