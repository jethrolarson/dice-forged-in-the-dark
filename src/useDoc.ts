import firebase from 'firebase/app'
import { useEffect, useState } from 'react'
import { useFirestore } from './useFirestore'

export type DocRef = firebase.firestore.DocumentReference<firebase.firestore.DocumentData>

export const useDoc = (path: string): DocRef | null => {
  const fs = useFirestore()
  const [doc, setDoc] = useState<DocRef | null>(null)
  useEffect(() => {
    fs && setDoc(fs.doc(path))
  }, [fs])

  return doc
}
