import { useEffect, useState } from 'react'

interface TimerProps {
  endsAt: number | null
  onExpire?: () => void
  className?: string
}

export default function Timer({ endsAt, onExpire, className = '' }: TimerProps) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    if (!endsAt) {
      setRemaining(0)
      return
    }

    const update = () => {
      const now = Date.now()
      const diff = Math.max(0, Math.ceil((endsAt - now) / 1000))
      setRemaining(diff)
      if (diff === 0 && onExpire) {
        onExpire()
      }
    }

    update()
    const interval = setInterval(update, 500)
    return () => clearInterval(interval)
  }, [endsAt, onExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isUrgent = remaining <= 30 && remaining > 0

  return (
    <span
      className={`font-mono text-2xl font-bold tabular-nums ${
        isUrgent ? 'text-[#dc2626] animate-pulse' : 'text-[#d97706]'
      } ${className}`}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  )
}
