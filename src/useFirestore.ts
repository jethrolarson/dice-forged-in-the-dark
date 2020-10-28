import { useEffect, useState } from 'react'
import fireApp from 'firebase/app'
require('@firebase/firestore')

export const useFirestore = (): null | fireApp.firestore.Firestore => {
  let [firestore, setFirestore] = useState<fireApp.firestore.Firestore | null>(null)
  useEffect(() => {
    const fApp =
      fireApp.apps[0] ||
      fireApp.initializeApp({
        appId: 'forged-in-the-dice',
        apiKey: 'AIzaSyB8UlvItF7MjSxWcTY65sVSwQLNsgBykjU',
        projectId: 'forged-in-the-dice'
      })

    setFirestore(fireApp.firestore())
  }, [])
  return firestore
}
