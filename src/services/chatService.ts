import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { ChatMessage } from '../types/game'

export async function sendMessage(
  gameId: string,
  senderUid: string,
  senderName: string,
  message: string,
  isSystem = false
): Promise<void> {
  const db = getFirebaseDb()
  const ref = collection(db, `games/${gameId}/chat`)
  const msgData: Omit<ChatMessage, 'id'> = {
    senderUid,
    senderName,
    message,
    timestamp: Date.now(),
    isSystem,
  }
  await addDoc(ref, msgData)
}

export function subscribeToChat(
  gameId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const db = getFirebaseDb()
  const q = query(
    collection(db, `games/${gameId}/chat`),
    orderBy('timestamp', 'asc'),
    limit(200)
  )
  return onSnapshot(q, (snap) => {
    const messages: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatMessage, 'id'>),
    }))
    callback(messages)
  })
}
