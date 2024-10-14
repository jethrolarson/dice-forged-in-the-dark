import { createRoot } from 'react-dom/client'
import 'react-widgets/styles.css'
import { App } from './App'
import './index.css'
import initFirebase from './initFirebase'
import { e } from './util'

initFirebase()
const root = createRoot(document.getElementById('root')!)
root.render(e(App))
