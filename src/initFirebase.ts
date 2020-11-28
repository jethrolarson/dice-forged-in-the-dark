import fireApp from 'firebase/app'
import '@firebase/firestore'
import 'firebase/auth'
export const initFirebase = (): fireApp.app.App => {
  return (
    fireApp.apps[0] ??
    fireApp.initializeApp({
      appId: 'forged-in-the-dice',
      apiKey: 'AIzaSyB8UlvItF7MjSxWcTY65sVSwQLNsgBykjU',
      projectId: 'forged-in-the-dice',
      authDomain: 'localhost',
    })
  )
}
