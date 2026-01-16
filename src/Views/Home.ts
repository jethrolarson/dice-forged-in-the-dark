import type { User as FSUser } from '@firebase/auth'
import { defaultTheme, PersistedState } from '../Models/GameModel'
import { funState } from '@fun-land/fun-state'
import { getDoc, getFirestore } from '@firebase/firestore'
import { stylesheet } from 'typestyle'
import { Login } from './Login/Login'
import { getUser } from '../services/getUser'
import { getDocRef } from '../services/getDoc'
import { User } from '../Models/User'
import { ActiveGames } from './ActiveGames'
import { Component, h } from '@fun-land/fun-web'

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

  const container = h('div', {}, [h('div', {}, ['Loading...'])])

  state.watch(signal, (games) => {
    container.replaceChildren(firestore ? ActiveGames(signal, { games, user }) : h('div', {}, ['Loading...']))
  })

  return container
}

const styles = stylesheet({
  Home: {
    margin: '30px auto',
    padding: '0 30px',
    maxWidth: 800,
  },
})

export const Home: Component = (signal) => {
  const userState = getUser(signal)
  const contentContainer = h('div', {}, [])

  userState.watch(signal, (user) => {
    contentContainer.replaceChildren(user ? UserHome(signal, { user }) : Login(signal, {}))
  })

  return h('div', { className: styles.Home }, [
    h('h1', {}, ['Dice Forged in the Dark']),
    h('p', {}, ['A standalone dice app for Forged-in-the-Dark games']),
    h('p', {}, [`After starting a new game, share the url with other players to see each other's rolls.`]),
    contentContainer,
  ])
}
