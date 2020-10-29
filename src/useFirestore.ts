import { useEffect, useState } from 'react'
import type fireApp from 'firebase/app'
import { initFirebase } from './initFirebase'

export const useFirestore = (): null | fireApp.firestore.Firestore => {
  const [firestore, setFirestore] = useState<fireApp.firestore.Firestore | null>(null)
  useEffect(() => {
    setFirestore(initFirebase().firestore())
  }, [])
  return firestore
}
