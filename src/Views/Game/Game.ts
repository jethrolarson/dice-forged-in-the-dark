import * as O from 'fp-ts/lib/Option'
import {
  GameState,
  GameView,
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
import { Component, funState, h } from '@fun-land/fun-web'

export const gamePath = (path: string): O.Option<GameView> => {
  const m = /^\/game\/([^/?]+)/.exec(path)
  return m && m.length > 0 && m[1] ? O.some({ kind: 'GameView', id: m[1] }) : O.none
}

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

  const container = h('div', {}, [])

  gameState.watch(signal, (state) => {
    switch (state.kind) {
      case 'LoadedGameState':
        container.replaceChildren(LoadedGame(signal, { initialState: state, gameId, gdoc, uid, userDisplayName }))
        break
      case 'MissingGameState':
        container.replaceChildren(h('h1', {}, ['Game not found. Check the url']))
        break
      case 'LoadingGameState':
        container.replaceChildren(h('div', {}, ['Game Loading']))
        break
    }
  })

  return container
}

export const Game: Component<{ gameId: string }> = (signal, { gameId }) => {
  const userState = getUser(signal)
  const container = h('div', {}, [])

  userState.watch(signal, (user) => {
    container.replaceChildren(
      user
        ? GameWithUID(signal, { gameId, uid: user.uid, userDisplayName: user.displayName ?? '' })
        : Login(signal, {}),
    )
  })

  return container
}
