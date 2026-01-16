import { Home } from './Views/Home'
import './index.css'
import initFirebase from './initFirebase'
import { mount } from '@fun-land/fun-web'

initFirebase()
mount((signal) => Home(signal, {}), {}, document.getElementById('root')!)
