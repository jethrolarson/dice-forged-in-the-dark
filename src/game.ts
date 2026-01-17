import { Game } from './Views/Game/Game'
import './index.css'
import initFirebase from './initFirebase'
import { mount, h } from '@fun-land/fun-web'
import '@firebase/firestore'

initFirebase()

const urlParams = new URLSearchParams(window.location.search)
const gameId = urlParams.get('id') || ''
const root = document.getElementById('root')!;
if (!gameId) {
  root.appendChild(h('p', {}, ['Error: Game ID required. Use ?id=...']))
} else {
  mount((signal) => Game(signal, { gameId }), {}, root)
}
