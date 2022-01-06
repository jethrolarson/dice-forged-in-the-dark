import { DocumentReference, doc, getFirestore } from '@firebase/firestore'
import { useMemo } from 'react'

export const useDoc = (path: string): DocumentReference => useMemo(() => doc(getFirestore(), path), [path])
