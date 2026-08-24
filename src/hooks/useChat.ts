import { useState, useEffect } from 'react'
import { subscribeToChat } from '../services/chatService'
import type { ChatMessage } from '../types/game'

export function useChat(gameId: string | undefined): {
  messages: ChatMessage[]
  loading: boolean
} {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) {
      setLoading(false)
      return
    }
    const unsub = subscribeToChat(gameId, (msgs) => {
      setMessages(msgs)
      setLoading(false)
    })
    return unsub
  }, [gameId])

  return { messages, loading }
}
