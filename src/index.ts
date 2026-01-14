import { App } from './App'
import './index.css'
import initFirebase from './initFirebase'

initFirebase()
const rootEl = document.getElementById('root')!
const ctrl = new AbortController()
rootEl.appendChild(App(ctrl.signal, {}))
