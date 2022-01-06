import React, { FC } from 'react'
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@firebase/auth'

export const Login: FC = () => {
  const signin = (): void => {
    signInWithPopup(getAuth(), new GoogleAuthProvider()).catch((err) => {
      console.error(err)
      alert('failed to signin')
    })
  }
  return <button onClick={signin}>Sign in with Google</button>
}
