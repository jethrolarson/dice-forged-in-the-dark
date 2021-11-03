import React from 'react'
import { render } from 'react-dom'

import { App } from './App'
import initFirebase from './initFirebase'

initFirebase()

render(<App />, document.getElementById('root'))
