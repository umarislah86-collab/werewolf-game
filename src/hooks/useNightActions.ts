import { useState, useEffect } from 'react'
import { subscribeToNightActions } from '../services/nightService'
import type { NightAction } from '../types/game'

export function useNightActions(
  gameId: string | undefined,
  night: number
): { actions: NightAction[]; count: number } {
  const [actions, setActions] = useState<NightAction[]>([])

  useEffect(() => {
    if (!gameId) return
    const unsub = subscribeToNightActions(gameId, night, (a) => {
      setActions(a)
    })
    return unsub
  }, [gameId, night])

  return { actions, count: actions.length }
}
