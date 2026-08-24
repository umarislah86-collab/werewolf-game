import { useState, useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '../firebase'

export interface AuthState {
  uid: string | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        setLoading(false)
      } else {
        try {
          const cred = await signInAnonymously(auth)
          setUid(cred.user.uid)
        } catch (err) {
          console.error('Auth error:', err)
        } finally {
          setLoading(false)
        }
      }
    })
    return unsub
  }, [])

  return { uid, loading }
}
