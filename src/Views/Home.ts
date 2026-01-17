import type { User as FSUser } from '@firebase/auth'
import { defaultTheme, PersistedState } from '../Models/GameModel'
import { funState } from '@fun-land/fun-state'
import { getDoc, getFirestore } from '@firebase/firestore'
import { Login } from './Login/Login'
import { getUser } from '../services/getUser'
import { getDocRef } from '../services/getDoc'
import { User } from '../Models/User'
import { ActiveGames } from './ActiveGames'
import { Component, h, bindView } from '@fun-land/fun-web'
import { styles } from './Home.css'

type GameState = PersistedState & { id: string }

type HomeState = GameState[]

export const UserHome: Component<{ user: FSUser }> = (signal, { user }) => {
  const state = funState<HomeState>([])
  const firestore = getFirestore()
  const userDoc = getDocRef(`users/${user.uid}`)

  document.documentElement.className = defaultTheme

  // Load user games
  getDoc(userDoc)
    .then((ss) => {
      const userData = ss.data() as User | undefined
      if (userData?.games.length) {
        Promise.all(
          userData.games.map(
            (id): Promise<GameState> =>
              getDoc(getDocRef(`games/${id}`)).then((game) => ({
                id: game.id,
                ...(game.data() as PersistedState),
              })),
          ),
        )
          .then(state.set)
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

  return bindView(signal, state, (regionSignal, games) =>
    firestore ? ActiveGames(regionSignal, { games, user }) : h('div', {}, ['Loading...']),
  )
}

export const Home: Component = (signal) => {
  const userState = getUser(signal)

  const contentContainer = bindView(signal, userState, (regionSignal, user) =>
    user ? UserHome(regionSignal, { user }) : Login(regionSignal, {}),
  )

  return h('div', { className: styles.Home }, [
    h('h1', {}, ['Dice Forged in the Dark']),
    h('p', {}, ['A standalone dice app for Forged-in-the-Dark games']),
    h('p', {}, [`After starting a new game, share the url with other players to see each other's rolls.`]),
    contentContainer,
  ])
}
