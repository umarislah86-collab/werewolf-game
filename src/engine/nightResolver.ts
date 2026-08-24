import type { Player, NightAction, Game, PrivateData } from '../types/game'

export interface NightResolutionResult {
  killedUid: string | null
  werewolfPunished: boolean
  punishedWerewolfUid: string | null
  seerResults: Record<string, { targetUid: string; result: 'werewolf' | 'not_werewolf' }>
}

export function resolveNight(
  game: Game,
  players: Player[],
  actions: NightAction[],
  privateDataMap: Record<string, PrivateData>
): NightResolutionResult {
  const livingPlayers = players.filter((p) => p.isAlive)
  const result: NightResolutionResult = {
    killedUid: null,
    werewolfPunished: false,
    punishedWerewolfUid: null,
    seerResults: {},
  }

  // --- Seer / Drunk Seer resolution (priority 10) ---
  const seerActions = actions.filter(
    (a) => a.role === 'seer' || a.role === 'drunk_seer'
  )
  for (const action of seerActions) {
    const targetPlayer = players.find((p) => p.uid === action.targetUid)
    if (!targetPlayer) continue

    const targetPrivate = privateDataMap[action.targetUid]
    let trueAlignment: 'werewolf' | 'not_werewolf' = 'not_werewolf'
    if (targetPrivate?.role === 'werewolf') {
      trueAlignment = 'werewolf'
    }

    let resultAlignment = trueAlignment
    if (action.role === 'drunk_seer') {
      const accuracy = game.settings.drunkSeerAccuracy
      const roll = Math.random() * 100
      if (roll >= accuracy) {
        // Flip the result
        resultAlignment = trueAlignment === 'werewolf' ? 'not_werewolf' : 'werewolf'
      }
    }

    result.seerResults[action.uid] = {
      targetUid: action.targetUid,
      result: resultAlignment,
    }
  }

  // --- Knight protection (priority 20) ---
  const knightAction = actions.find((a) => a.role === 'knight')
  const protectedUid = knightAction?.targetUid ?? null

  // --- Werewolf kill (priority 40) ---
  const wwActions = actions.filter((a) => a.role === 'werewolf')
  if (wwActions.length > 0) {
    const targets = wwActions.map((a) => a.targetUid)
    const allAgree = targets.every((t) => t === targets[0])

    if (allAgree) {
      const targetUid = targets[0]
      // Check knight protection
      if (protectedUid === targetUid) {
        // Protected — nobody dies
        result.killedUid = null
      } else {
        result.killedUid = targetUid
      }
    } else {
      // Disagreement — random living WW dies
      const livingWws = wwActions
        .map((a) => livingPlayers.find((p) => p.uid === a.uid))
        .filter((p): p is Player => p !== undefined)

      if (livingWws.length > 0) {
        const randomWw = livingWws[Math.floor(Math.random() * livingWws.length)]
        result.killedUid = randomWw.uid
        result.werewolfPunished = true
        result.punishedWerewolfUid = randomWw.uid
      }
    }
  }

  return result
}
