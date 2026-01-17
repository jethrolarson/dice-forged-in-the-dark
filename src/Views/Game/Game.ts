import { Component, h, bindView } from '@fun-land/fun-web'
import { funState } from '@fun-land/fun-state'
import {
  GameState,
  initialGameState,
  initialLoadedGameState,
  missingGameState,
  PersistedState,
} from '../../Models/GameModel'
import { getDocRef } from '../../services/getDoc'
import { DocumentReference, setDoc, getDoc } from '@firebase/firestore'
import { LoadedGame } from './LoadedGame'
import { getUser } from '../../services/getUser'
import { User } from '../../Models/User'
import { Login } from '../Login/Login'

const saveGameToUser = (userDoc: DocumentReference, gameId: string): void => {
  getDoc(userDoc)
    .then((ss) => {
      const user = ss.data() as Partial<User> | undefined
      const games: string[] = user?.games ?? []
      if (!games.includes(gameId)) {
        setDoc(userDoc, { games: games.concat([gameId]) }).catch((err) => {
          alert('failed to add game to your user')
          console.error(err)
        })
      }
    })
    .catch((err) => {
      alert('failed to find your data')
      console.error(err)
    })
}

export const GameWithUID: Component<{ gameId: string; uid: string; userDisplayName: string }> = (
  signal,
  { gameId, uid, userDisplayName },
) => {
  const gdoc = getDocRef(`games/${gameId}`)
  const userDoc = getDocRef(`users/${uid}`)
  const gameState = funState<GameState>(initialGameState)

  getDoc(gdoc)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        gameState.set(missingGameState)
        return
      }
      const data = snapshot.data()
      if (data) {
        gameState.set(initialLoadedGameState(data as PersistedState))
        saveGameToUser(userDoc, snapshot.id)
      }
    })
    .catch((e) => {
      console.error(e)
      alert('failed to load game')
    })

  return bindView(signal, gameState, (regionSignal, state) => {
    switch (state.kind) {
      case 'LoadedGameState':
        return LoadedGame(regionSignal, { initialState: state, gameId, gdoc, uid, userDisplayName })
      case 'MissingGameState':
        return h('h1', {}, ['Game not found. Check the url'])
      case 'LoadingGameState':
        return h('div', {}, ['Game Loading'])
      case 'ErrorGameState':
        return h('h1', {}, ['Error loading game. Try refreshing the page.'])
    }
  })
}

export const Game: Component<{ gameId: string }> = (signal, { gameId }) => {
  const userState = getUser(signal)

  return bindView(signal, userState, (regionSignal, user) =>
    user
      ? GameWithUID(regionSignal, { gameId, uid: user.uid, userDisplayName: user.displayName ?? '' })
      : Login(regionSignal, {}),
  )
}
