import { initializeApp } from 'firebase/app'
import '@firebase/firestore'

export default () => {
  initializeApp({
    appId: 'forged-in-the-dice',
    apiKey: 'AIzaSyB8UlvItF7MjSxWcTY65sVSwQLNsgBykjU',
    projectId: 'forged-in-the-dice',
    authDomain: 'forged-in-the-dice.web.app',
  })
}
