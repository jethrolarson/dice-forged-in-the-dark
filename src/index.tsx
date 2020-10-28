import React from 'react'
import { render } from 'react-dom'

import { App } from './App'
const state = JSON.parse(localStorage.getItem('state') || '{}')
render(<App storedState={state} />, document.getElementById('root'))
