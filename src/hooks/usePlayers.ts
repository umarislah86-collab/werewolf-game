import { useState, useEffect } from 'react'
import { subscribeToPlayers } from '../services/playerService'
import type { Player } from '../types/game'

export function usePlayers(gameId: string | undefined): {
  players: Player[]
  loading: boolean
} {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) {
      setLoading(false)
      return
    }
    const unsub = subscribeToPlayers(gameId, (p) => {
      setPlayers(p)
      setLoading(false)
    })
    return unsub
  }, [gameId])

  return { players, loading }
}
