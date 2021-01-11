import React, { FC, useEffect } from 'react'
import { PersistedState } from '../Models/GameModel'
import fireApp from 'firebase/app'
import { useFirestore } from '../hooks/useFirestore'
import { style } from 'typestyle'
import useFunState, { FunState } from 'fun-state'
import { TextInput } from '../components/TextInput'
import { Login } from './Login/Login'
import { useUser } from '../hooks/useAuthState'
import { initFirebase } from '../initFirebase'
import { bladesInTheDarkConfig } from '../Models/rollConfigPresets'
import { useDoc } from '../hooks/useDoc'
import { User } from '../Models/User'

type GameState = PersistedState & { id: string }

interface HomeState {
  games: GameState[]
  gameName: string
  creating: boolean
}

const createGame = (
  uid: string,
  title: string,
  gamesDoc: fireApp.firestore.CollectionReference,
  state: FunState<HomeState>,
) => (): void => {
  state.prop('creating').set(true)
  const gameState: PersistedState = {
    owners: [uid],
    players: [],
    rollConfig: bladesInTheDarkConfig,
    rolls: [],
    title,
  }
  gamesDoc
    .add(gameState)
    .then((value) => {
      window.location.hash = `#/game-settings/${value.id}`
      state.prop('creating').set(false)
    })
    .catch((e) => {
      console.error(e)
      alert('failed to create game')
    })
}

export const UserHome: FC<{ user: fireApp.User }> = ({ user }) => {
  const state = useFunState<HomeState>({
    games: [],
    gameName: '',
    creating: false,
  })
  const firestore = useFirestore()
  const userDoc = useDoc(`users/${user.uid}`)
  useEffect(() => {
    if (firestore && userDoc) {
      userDoc
        .get()
        .then((ss) => {
          const userData = ss.data() as User | undefined
          if (userData?.games.length) {
            Promise.all(
              userData.games.map(
                (id): Promise<GameState> =>
                  firestore
                    .doc(`games/${id}`)
                    .get()
                    .then((game) => ({ id: game.id, ...(game.data() as PersistedState) })),
              ),
            )
              .then(state.prop('games').set)
              .catch((e) => {
                console.error(e)
                alert('failed to load one or more games')
              })
          }
        })
        .catch((err) => {
          alert('failed to load user data')
          console.error(err)
        })
    }
    return undefined
  }, [firestore, userDoc, user])

  const logout = (): Promise<void> => fireApp.auth().signOut()
  const { gameName, creating, games } = state.get()
  return firestore ? (
    <>
      <h2>Active Games</h2>
      <ul className={style({ listStyle: 'none', padding: 0 })}>
        {games.map((game) => (
          <li key={game.id}>
            <a href={`#/game/${game.id}`}>{game.title || 'untitled'}</a>
          </li>
        ))}
      </ul>
      <div className={style({ display: 'flex', justifyContent: 'flex-start' })}>
        <TextInput
          passThroughProps={{
            placeholder: 'Game name',
            disabled: creating,
            type: 'text',
            name: 'game_name',
          }}
          state={state.prop('gameName')}
        />{' '}
        <button
          disabled={gameName.length === 0 || creating}
          className={style({ flexShrink: 0 })}
          onClick={createGame(user.uid, gameName, firestore.collection('games'), state)}>
          Create Game
        </button>
      </div>
      <button onClick={logout}>Logout</button>
    </>
  ) : (
    <div>Loading...</div>
  )
}

export const Home: FC = () => {
  initFirebase()
  const user = useUser()
  return (
    <div className={style({ margin: '30px auto', padding: '0 30px', maxWidth: 800 })}>
      <h1>Dice Forged in the Dark</h1>
      <p>A standalone dice app for Forged-in-the-Dark games</p>
      {user ? <UserHome user={user} /> : <Login />}
    </div>
  )
}
