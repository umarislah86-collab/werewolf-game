import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { PrivateData } from '../types/game'

export function usePrivateData(
  gameId: string | undefined,
  uid: string | null
): { privateData: PrivateData | null; loading: boolean } {
  const [privateData, setPrivateData] = useState<PrivateData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId || !uid) {
      setLoading(false)
      return
    }
    const db = getFirebaseDb()
    const unsub = onSnapshot(doc(db, `games/${gameId}/private/${uid}`), (snap) => {
      if (snap.exists()) {
        setPrivateData(snap.data() as PrivateData)
      } else {
        setPrivateData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [gameId, uid])

  return { privateData, loading }
}
