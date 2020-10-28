import React, { FC, useEffect } from 'react'
import useFunState from 'fun-state'
import { AppState, initialState, View } from './Model'
import { Game } from './Game'
import { route } from './Router'
import { Home } from './Home'

require('@firebase/firestore')

const updateView = (): View => route(window.location.hash.slice(1))

/** App components should be the only things that instantiate state */
export const App: FC<{ storedState: Partial<AppState> }> = ({ storedState }) => {
  const state = useFunState<AppState>({ ...initialState(updateView()), ...storedState })

  useEffect(() => {
    const onHashChange = () => {
      state.prop('view').set(updateView())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const { view } = state.get()
  console.log(view)
  switch (view.kind) {
    case 'DefaultView':
      return <Home />
    case 'GameView':
      return <Game gameId={view.id} />
    case 'Error404View':
      return <p>Error 404</p>
  }
}
