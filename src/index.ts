import React from 'react'
import { App } from './App'
import initFirebase from './initFirebase'
import { createRoot } from 'react-dom/client'
import 'react-widgets/styles.css'
import './index.css'
import { e } from './util'

initFirebase()
const root = createRoot(document.getElementById('root')!)
root.render(e(App))
