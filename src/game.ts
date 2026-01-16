import { Game } from './Views/Game/Game'
import './index.css'
import initFirebase from './initFirebase'
import { mount } from '@fun-land/fun-web'
import '@firebase/firestore'

initFirebase()

const urlParams = new URLSearchParams(window.location.search)
const gameId = urlParams.get('id') || ''

if (!gameId) {
  document.getElementById('root')!.innerHTML = '<p>Error: Game ID required. Use ?id=...</p>'
} else {
  mount((signal) => Game(signal, { gameId }), {}, document.getElementById('root')!)
}
