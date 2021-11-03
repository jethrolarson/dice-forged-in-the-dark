import { DocumentReference, doc, getFirestore } from '@firebase/firestore'

export const useDoc = (path: string): DocumentReference => doc(getFirestore(), path)
