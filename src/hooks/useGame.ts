import { useState, useEffect } from 'react'
import { subscribeToGame } from '../services/gameService'
import type { Game } from '../types/game'

export function useGame(gameId: string | undefined): {
  game: Game | null
  loading: boolean
} {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = subscribeToGame(gameId, (g) => {
      setGame(g)
      setLoading(false)
    })
    return unsub
  }, [gameId])

  return { game, loading }
}
