import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  runTransaction,
  getDocs,
} from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { Game, NightAction, RoleId } from '../types/game'
import { runNightResolution } from '../engine/gameEngine'

export async function submitNightAction(
  gameId: string,
  night: number,
  uid: string,
  targetUid: string,
  role: RoleId
): Promise<void> {
  const db = getFirebaseDb()
  const gameRef = doc(db, `games/${gameId}`)
  const actionRef = doc(db, `games/${gameId}/nightActions/${night}_${uid}`)
  const playerRef = doc(db, `games/${gameId}/players/${uid}`)

  let shouldResolve = false

  await runTransaction(db, async (tx) => {
    const [actionSnap, gameSnap] = await Promise.all([
      tx.get(actionRef),
      tx.get(gameRef),
    ])

    if (actionSnap.exists()) return

    const game = gameSnap.data() as Game
    if (game.phase !== 'night' || game.resolving) return

    tx.set(actionRef, { uid, targetUid, role, night, submittedAt: Date.now() })
    tx.update(playerRef, { hasSubmittedAction: true })

    const newCount = game.submittedActionCount + 1

    if (newCount >= game.requiredActionCount) {
      tx.update(gameRef, {
        resolving: true,
        phase: 'night_resolution',
        submittedActionCount: newCount,
      })
      shouldResolve = true
    } else {
      tx.update(gameRef, { submittedActionCount: newCount })
    }
  })

  if (shouldResolve) {
    await runNightResolution(gameId, night)
  }
}

export async function getNightActions(gameId: string, night: number): Promise<NightAction[]> {
  const db = getFirebaseDb()
  const q = query(
    collection(db, `games/${gameId}/nightActions`),
    where('night', '==', night)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as NightAction)
}

export function subscribeToNightActions(
  gameId: string,
  night: number,
  callback: (actions: NightAction[]) => void
): () => void {
  const db = getFirebaseDb()
  const q = query(
    collection(db, `games/${gameId}/nightActions`),
    where('night', '==', night)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as NightAction))
  })
}
