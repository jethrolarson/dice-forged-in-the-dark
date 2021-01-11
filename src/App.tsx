import React, { FC, useEffect } from 'react'
import useFunState from 'fun-state'
import { AppState, initialState, View } from './Models/Model'
import { Game } from './Views/Game/Game'
import { route } from './Router'
import { Home } from './Views/Home'
import { Login } from './Views/Login/Login'
import { GameSettings } from './Views/GameSettings/GameSettings'
import '@firebase/firestore'

const updateView = (): View => route(window.location.hash.slice(1))

/** App components should be the only things that instantiate state */
// eslint-disable-next-line complexity
export const App: FC<{}> = () => {
  const state = useFunState<AppState>(initialState(updateView()))

  useEffect(() => {
    const onHashChange = (): void => {
      state.prop('view').set(updateView())
    }
    window.addEventListener('hashchange', onHashChange)
    return (): void => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const { view } = state.get()
  console.log(view)
  switch (view.kind) {
    case 'DefaultView':
      return <Home />
    case 'GameView':
      return <Game gameId={view.id} />
    case 'GameSettingsView':
      return <GameSettings gameId={view.id} />
    case 'LoginView':
      return <Login />
    case 'Error404View':
      return <p>Error 404</p>
  }
}
