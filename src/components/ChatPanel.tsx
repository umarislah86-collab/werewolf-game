import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import { sendMessage } from '../services/chatService'
import type { ChatMessage } from '../types/game'

interface ChatPanelProps {
  gameId: string
  uid: string
  displayName: string
  collapsed?: boolean
}

export default function ChatPanel({
  gameId,
  uid,
  displayName,
  collapsed = false,
}: ChatPanelProps) {
  const { messages } = useChat(gameId)
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(!collapsed)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await sendMessage(gameId, uid, displayName, text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col border border-[#3a3020] rounded bg-[#1a1612]">
      {/* Header */}
      <button
        className="flex items-center justify-between px-4 py-2 text-[#d97706] font-[Cinzel,serif] text-sm border-b border-[#3a3020]"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Village Chat</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          {/* Messages */}
          <div className="h-48 overflow-y-auto p-3 flex flex-col gap-1">
            {messages.length === 0 && (
              <p className="text-[#5a5040] text-xs text-center mt-4">
                No messages yet...
              </p>
            )}
            {messages.map((msg) => (
              <ChatMessageRow key={msg.id} message={msg} myUid={uid} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-2 border-t border-[#3a3020]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              maxLength={300}
              className="flex-1 bg-[#0f0d0a] border border-[#3a3020] rounded px-3 py-2 text-sm text-[#e8e0d0] placeholder-[#5a5040] outline-none focus:border-[#5a4a30] font-[Cinzel,serif]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-3 py-2 bg-[#991b1b] text-white rounded text-sm disabled:opacity-40 font-[Cinzel,serif]"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ChatMessageRow({
  message,
  myUid,
}: {
  message: ChatMessage
  myUid: string
}) {
  const isMe = message.senderUid === myUid
  const isSystem = message.isSystem

  if (isSystem) {
    return (
      <div className="text-center text-xs text-[#8a7f6e] italic py-0.5">
        — {message.message} —
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <span className="text-[#5a5040] text-xs font-[Cinzel,serif]">
        {message.senderName}
      </span>
      <span
        className={`text-sm px-2 py-1 rounded max-w-[85%] break-words ${
          isMe
            ? 'bg-[#991b1b] text-white'
            : 'bg-[#221e18] border border-[#3a3020] text-[#e8e0d0]'
        }`}
      >
        {message.message}
      </span>
    </div>
  )
}
