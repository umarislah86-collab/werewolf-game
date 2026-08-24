import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { Player } from '../types/game'

export function subscribeToPlayers(
  gameId: string,
  callback: (players: Player[]) => void
): () => void {
  const db = getFirebaseDb()
  return onSnapshot(collection(db, `games/${gameId}/players`), (snap) => {
    const players = snap.docs.map((d) => d.data() as Player)
    players.sort((a, b) => a.joinedAt - b.joinedAt)
    callback(players)
  })
}

export async function updatePlayer(
  gameId: string,
  uid: string,
  data: Partial<Player>
): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, `games/${gameId}/players/${uid}`), data)
}
