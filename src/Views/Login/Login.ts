import { getAuth, GoogleAuthProvider, signInWithPopup } from '@firebase/auth'
import { Component,  hx } from '@fun-land/fun-web'

export const Login: Component = (signal) => {
  const signin = (): void => {
    signInWithPopup(getAuth(), new GoogleAuthProvider()).catch((err) => {
      console.error(err)
      alert('failed to signin')
    })
  }
  return hx('button', { signal, props: { type: 'button' }, on: { click: signin } }, ['Sign in with Google'])
}
