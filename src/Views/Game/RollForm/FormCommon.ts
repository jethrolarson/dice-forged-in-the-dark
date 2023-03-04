import { RollResult } from '../../../Models/GameModel'
import { DocumentReference, addDoc, collection } from '@firebase/firestore'

export type NewRoll = Omit<RollResult, 'id'>

export const sendRoll = (gdoc: DocumentReference, userDisplayName: string | undefined, roll: NewRoll) => {
  addDoc(collection(gdoc, 'rolls'), { ...roll, user: userDisplayName }).catch((e) => {
    console.error(e)
    alert('failed to add roll')
  })
}
