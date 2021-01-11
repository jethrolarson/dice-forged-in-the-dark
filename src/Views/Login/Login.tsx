import { FC } from 'react'
import { initAuth } from '../../initFirebase'
import firebase from 'firebase/app'

export const Login: FC = () => {
  const signin = (): void => {
    const provider = new firebase.auth.GoogleAuthProvider()
    initAuth()
      .signInWithPopup(provider)
      .catch((err) => {
        console.error(err)
        alert('failed to signin')
      })
  }
  return <button onClick={signin}>Sign in with Google</button>
}
