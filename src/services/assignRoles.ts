import { doc, writeBatch } from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { RoleId, GameSettings, Player } from '../types/game'
import { ROLE_REGISTRY } from '../roles/registry'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function assignRoles(
  gameId: string,
  players: Player[],
  settings: GameSettings
): Promise<void> {
  const db = getFirebaseDb()

  // Build the role list
  const roleList: RoleId[] = []
  for (const [roleId, count] of Object.entries(settings.roleCounts) as [RoleId, number][]) {
    for (let i = 0; i < count; i++) {
      roleList.push(roleId)
    }
  }

  if (roleList.length !== players.length) {
    throw new Error(
      `Role count mismatch: ${roleList.length} roles for ${players.length} players`
    )
  }

  const shuffledRoles = shuffleArray(roleList)
  const shuffledPlayers = shuffleArray(players)

  // Count required night action roles
  const requiredActionCount = shuffledRoles.filter(
    (r) => ROLE_REGISTRY[r].hasNightAction
  ).length

  const batch = writeBatch(db)

  for (let i = 0; i < shuffledPlayers.length; i++) {
    const player = shuffledPlayers[i]
    const role = shuffledRoles[i]

    batch.set(doc(db, `games/${gameId}/private/${player.uid}`), {
      role,
      seerResults: {},
      knightLastTargetUid: null,
    })
  }

  // Update requiredActionCount on game
  batch.update(doc(db, `games/${gameId}`), {
    requiredActionCount,
    submittedActionCount: 0,
    livingPlayerCount: players.length,
  })

  await batch.commit()
}
