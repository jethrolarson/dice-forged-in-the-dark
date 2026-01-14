import { DocumentReference, doc, getFirestore } from '@firebase/firestore'

export const getDocRef = (path: string): DocumentReference => doc(getFirestore(), path)
