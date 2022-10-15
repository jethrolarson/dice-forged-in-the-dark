import { FC, useEffect } from 'react'
import type { User as FSUser } from '@firebase/auth'
import { defaultTheme, PersistedState } from '../Models/GameModel'
import useFunState from '@fun-land/use-fun-state'
import { getDoc, doc, getFirestore } from '@firebase/firestore'
import { stylesheet } from 'typestyle'
import { Login } from './Login/Login'
import { useUser } from '../hooks/useAuthState'
import { useDoc } from '../hooks/useDoc'
import { User } from '../Models/User'
import { ActiveGames } from './ActiveGames'
import { div, e, h1, p } from '../util'

type GameState = PersistedState & { id: string }

type HomeState = GameState[]

export const UserHome: FC<{ user: FSUser }> = ({ user }) => {
  const state = useFunState<HomeState>([])
  const firestore = getFirestore()
  const userDoc = useDoc(`users/${user.uid}`)

  useEffect(() => {
    document.documentElement.classList.add(defaultTheme)
    return () => document.documentElement.classList.remove(defaultTheme)
  }, [])
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
    return undefined
  }, [firestore, user])

  const games = state.get()
  return firestore ? e(ActiveGames, { games, user }) : div(null, ['Loading...'])
}

const styles = stylesheet({
  Home: {
    margin: '30px auto',
    padding: '0 30px',
    maxWidth: 800,
  },
})

export const Home: FC = () => {
  const user = useUser()
  return div({ className: styles.Home }, [
    h1(null, ['Dice Forged in the Dark']),
    p(null, ['A standalone dice app for Forged-in-the-Dark games']),
    p(null, [`After starting a new game, share the url with other players to see each other's rolls.`]),
    user ? e(UserHome, { user }) : e(Login),
  ])
}
