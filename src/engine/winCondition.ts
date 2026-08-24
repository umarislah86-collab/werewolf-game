import type { Player } from '../types/game'
import type { Team } from '../types/game'

export interface WinCheckResult {
  hasWinner: boolean
  winner: Team | null
}

export function checkWinCondition(_players: Player[]): WinCheckResult {
  // Use checkWinConditionWithRoles for actual checks
  return { hasWinner: false, winner: null }
}

export function checkWinConditionWithRoles(
  players: Player[],
  roleMap: Record<string, string>
): WinCheckResult {
  const living = players.filter((p) => p.isAlive)
  const livingWW = living.filter((p) => roleMap[p.uid] === 'werewolf')
  const livingNonWW = living.filter((p) => roleMap[p.uid] !== 'werewolf')

  if (livingWW.length === 0) {
    return { hasWinner: true, winner: 'village' }
  }

  if (livingWW.length >= livingNonWW.length) {
    return { hasWinner: true, winner: 'werewolf' }
  }

  return { hasWinner: false, winner: null }
}
