import React, { FC, useEffect } from 'react'
import type { User as FSUser } from '@firebase/auth'
import { defaultTheme, PersistedState } from '../Models/GameModel'
import { getDoc, collection, doc, addDoc, getFirestore } from '@firebase/firestore'
import { style } from 'typestyle'
import { TextInput } from '../components/TextInput'
import { Login } from './Login/Login'
import { useUser } from '../hooks/useAuthState'
import { presets } from '../Models/rollConfigPresets'
import { useDoc } from '../hooks/useDoc'
import { User } from '../Models/User'
import { getAuth } from '@firebase/auth'
import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'

type GameState = PersistedState & { id: string }

interface HomeState {
  games: GameState[]
  gameName: string
  creating: boolean
}

const createGame = (uid: string, title: string, state: FunState<HomeState>) => (): void => {
  state.prop('creating').set(true)
  const gameState: PersistedState = {
    owners: [uid],
    players: [],
    rollConfig: presets[0],
    rolls: [],
    miroId: '',
    title,
    theme: defaultTheme,
  }
  addDoc(collection(getFirestore(), 'games'), gameState)
    .then((value) => {
      window.location.hash = `#/game-settings/${value.id}`
      state.prop('creating').set(false)
    })
    .catch((e) => {
      console.error(e)
      alert('failed to create game')
    })
}

export const UserHome: FC<{ user: FSUser }> = ({ user }) => {
  const state = useFunState<HomeState>({
    games: [],
    gameName: '',
    creating: false,
  })
  const firestore = getFirestore()
  const userDoc = useDoc(`users/${user.uid}`)
  useEffect(() => {
    getDoc(userDoc)
      .then((ss) => {
        const userData = ss.data() as User | undefined
        if (userData?.games.length) {
          Promise.all(
            userData.games.map(
              (id): Promise<GameState> =>
                getDoc(doc(firestore, `games/${id}`)).then((game) => ({
                  id: game.id,
                  ...(game.data() as PersistedState),
                })),
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
    return undefined
  }, [firestore, user])

  const logout = (): Promise<void> => getAuth().signOut()
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
          onClick={createGame(user.uid, gameName, state)}>
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
  const user = useUser()
  return (
    <div className={style({ margin: '30px auto', padding: '0 30px', maxWidth: 800 })}>
      <h1>Dice Forged in the Dark</h1>
      <p>A standalone dice app for Forged-in-the-Dark games</p>
      {user ? <UserHome user={user} /> : <Login />}
    </div>
  )
}
