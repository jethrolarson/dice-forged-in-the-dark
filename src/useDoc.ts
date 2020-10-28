import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import firebase from 'firebase/app'
import { useEffect, useState } from 'react'
import { useFirestore } from './useFirestore'

export const useDoc = (path: string) => {
  const fs = useFirestore()
  const [doc, setDoc] = useState<firebase.firestore.DocumentReference<firebase.firestore.DocumentData> | null>(null)
  useEffect(() => {
    fs && setDoc(fs.doc(path))
  }, [fs])

  return doc
}
