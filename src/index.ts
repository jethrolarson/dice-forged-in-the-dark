import { App } from './App'
import './index.css'
import initFirebase from './initFirebase'
import { mount } from '@fun-land/fun-web'

initFirebase()
mount(App, {}, document.getElementById('root')!)
