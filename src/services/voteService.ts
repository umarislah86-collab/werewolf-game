import {
  doc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  updateDoc,
} from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { Game, Vote, VoteResult } from '../types/game'
import { runVoteResolution } from '../engine/gameEngine'

export async function submitVote(
  gameId: string,
  round: number,
  uid: string,
  targetUid: string
): Promise<void> {
  const db = getFirebaseDb()
  const gameRef = doc(db, `games/${gameId}`)
  const voteRef = doc(db, `games/${gameId}/votes/${round}_${uid}`)

  let shouldResolve = false

  await runTransaction(db, async (tx) => {
    const [voteSnap, gameSnap] = await Promise.all([
      tx.get(voteRef),
      tx.get(gameRef),
    ])

    if (voteSnap.exists()) return

    const game = gameSnap.data() as Game
    if (game.phase !== 'voting' || game.resolving) return

    tx.set(voteRef, { uid, targetUid, round, submittedAt: Date.now() })

    const newCount = game.submittedActionCount + 1

    if (newCount >= game.livingPlayerCount) {
      tx.update(gameRef, { resolving: true, submittedActionCount: newCount })
      shouldResolve = true
    } else {
      tx.update(gameRef, { submittedActionCount: newCount })
    }
  })

  if (shouldResolve) {
    const gameSnap = await getDoc(gameRef)
    const game = gameSnap.data() as Game
    await runVoteResolution(gameId, round, game.night)
  }
}

export async function forceVoteResolution(gameId: string, round: number): Promise<void> {
  const db = getFirebaseDb()
  const gameRef = doc(db, `games/${gameId}`)
  const gameSnap = await getDoc(gameRef)
  const game = gameSnap.data() as Game
  if (game.phase !== 'voting' || game.resolving) return
  await updateDoc(gameRef, { resolving: true })
  await runVoteResolution(gameId, round, game.night)
}

export async function getVotes(gameId: string, round: number): Promise<Vote[]> {
  const db = getFirebaseDb()
  const q = query(
    collection(db, `games/${gameId}/votes`),
    where('round', '==', round)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Vote)
}

export function subscribeToVotes(
  gameId: string,
  round: number,
  callback: (votes: Vote[]) => void
): () => void {
  const db = getFirebaseDb()
  const q = query(
    collection(db, `games/${gameId}/votes`),
    where('round', '==', round)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as Vote))
  })
}

export function subscribeToVoteResult(
  gameId: string,
  round: number,
  callback: (result: VoteResult | null) => void
): () => void {
  const db = getFirebaseDb()
  return onSnapshot(doc(db, `games/${gameId}/voteResult/${round}`), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as VoteResult)
    } else {
      callback(null)
    }
  })
}
