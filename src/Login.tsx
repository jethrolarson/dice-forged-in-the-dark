import React, { FC, useEffect } from 'react'
import { initFirebase } from './initFirebase'
import * as firebaseui from 'firebaseui'
import firebase from 'firebase/app'

export const Login: FC = () => {
  useEffect(() => {
    const fireApp = initFirebase()
    const ui = new firebaseui.auth.AuthUI(fireApp.auth())
    ui.start('#firebaseui-auth-container', {
      signInOptions: [
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        //   firebase.auth.GithubAuthProvider.PROVIDER_ID
      ],
      // Other config options...
    })
  }, [])
  return (
    <div>
      <div id="firebaseui-auth-container"></div>
      <div id="loader">Loading...</div>
    </div>
  )
}
