import { funState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { AppState, initialState, View } from './Models/Model'
import { Game } from './Views/Game/Game'
import { route } from './Router'
import { Home } from './Views/Home'
import { Login } from './Views/Login/Login'
import { GameSettings } from './Views/GameSettings/GameSettings'
import '@firebase/firestore'

const updateView = (): View => route(window.location.hash.slice(1))

/** App components should be the only things that instantiate state */

export const App: Component<{}> = (signal) => {
  const state = funState<AppState>(initialState(updateView()))

  const onHashChange = (): void => {
    state.prop('view').set(updateView())
  }

  window.addEventListener('hashchange', onHashChange, { signal })

  const container = h('div', {}, [])

  state.prop('view').watch(signal, (view) => {
    switch (view.kind) {
      case 'DefaultView':
        container.replaceChildren(Home(signal, {}))
        break
      case 'GameView':
        container.replaceChildren(Game(signal, { gameId: view.id }))
        break
      case 'GameSettingsView':
        container.replaceChildren(GameSettings(signal, { gameId: view.id }))
        break
      case 'LoginView':
        container.replaceChildren(Login(signal, {}))
        break
      case 'Error404View':
        container.replaceChildren(h('p', {}, ['Error 404']))
        break
    }
  })

  return container
}
