import { getAuth, GoogleAuthProvider, signInWithPopup } from '@firebase/auth'
import { Component, enhance, h, on } from '@fun-land/fun-web'

export const Login: Component<{}> = (signal) => {
  const signin = (): void => {
    signInWithPopup(getAuth(), new GoogleAuthProvider()).catch((err) => {
      console.error(err)
      alert('failed to signin')
    })
  }
  return enhance(h('button', {}, ['Sign in with Google']), on('click', signin, signal))
}
