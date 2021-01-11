import { FC, useEffect, useState } from 'react'
import * as O from 'fp-ts/lib/Option'
import {
  GameState,
  GameView,
  initialGameState,
  initialLoadedGameState,
  missingGameState,
  PersistedState,
} from '../../Models/GameModel'
import { DocRef, useDoc } from '../../hooks/useDoc'
import { LoadedGame } from './LoadedGame'
import { useUser } from '../../hooks/useAuthState'
import { User } from '../../Models/User'
import { initFirebase } from '../../initFirebase'

export const gamePath = (path: string): O.Option<GameView> => {
  const m = /^\/game\/([^/?]+)/.exec(path)
  return m && m.length > 0 && m[1] ? O.some({ kind: 'GameView', id: m[1] }) : O.none
}

const saveGameToUser = (userDoc: DocRef, gameId: string): void => {
  userDoc
    .get()
    .then((ss) => {
      const user = ss.data() as Partial<User> | undefined
      const games: string[] = user?.games ?? []
      if (!games.includes(gameId)) {
        userDoc.set({ games: games.concat([gameId]) }).catch((err) => {
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
    if (gdoc && userDoc) {
      gdoc
        .get()
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
    }
  }, [gdoc])

  if (gdoc) {
    switch (gameState.kind) {
      case 'LoadedGameState':
        return <LoadedGame initialState={gameState} gameId={gameId} gdoc={gdoc} />
      case 'MissingGameState':
        return <h1>Game not found. Check the url</h1>
      case 'LoadingGameState':
        return <div>Game Loading</div>
    }
  }
  return <div>Doc Loading</div>
}

export const Game: FC<{ gameId: string }> = ({ gameId }) => {
  initFirebase()
  const user = useUser()
  return user ? <GameWithUID gameId={gameId} uid={user.uid} /> : <div>User Not Loaded</div>
}
