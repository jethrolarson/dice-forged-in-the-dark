import React, { FC, useEffect, useState } from 'react'
import * as O from 'fp-ts/lib/Option'
import {
  GameState,
  GameView,
  initialGameState,
  initialLoadedGameState,
  missingGameState,
  PersistedState,
} from '../../Models/GameModel'
import { useDoc } from '../../hooks/useDoc'
import { DocumentReference, getDoc, setDoc } from '@firebase/firestore'
import { LoadedGame } from './LoadedGame'
import { useUser } from '../../hooks/useAuthState'
import { User } from '../../Models/User'
import { Login } from '../Login/Login'

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

export const GameWithUID: FC<{ gameId: string; uid: string }> = ({ gameId, uid }) => {
  const gdoc = useDoc(`games/${gameId}`)
  const userDoc = useDoc(`users/${uid}`)
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  useEffect(() => {
    getDoc(gdoc)
      .then((snapshot) => {
        if (!snapshot.exists) {
          setGameState(missingGameState)
        }
        const data = snapshot.data()
        data && setGameState(initialLoadedGameState(data as PersistedState))
        saveGameToUser(userDoc, snapshot.id)
      })
      .catch((e) => {
        console.error(e)
        alert('failed to load game')
      })
  }, [gdoc])
  switch (gameState.kind) {
    case 'LoadedGameState':
      return <LoadedGame initialState={gameState} gameId={gameId} gdoc={gdoc} uid={uid} />
    case 'MissingGameState':
      return <h1>Game not found. Check the url</h1>
    case 'LoadingGameState':
      return <div>Game Loading</div>
  }
  return <div>Doc Loading</div>
}

export const Game: FC<{ gameId: string }> = ({ gameId }) => {
  const user = useUser()
  return user ? (
    <GameWithUID gameId={gameId} uid={user.uid} />
  ) : (
    <div>
      <Login />
    </div>
  )
}
