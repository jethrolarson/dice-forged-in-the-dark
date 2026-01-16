import type { User as FSUser } from '@firebase/auth'
import { getAuth } from '@firebase/auth'
import { addDoc, collection, getFirestore } from '@firebase/firestore'
import { funState, FunState } from '@fun-land/fun-state'
import { defaultTheme, PersistedState } from '../Models/GameModel'
import { presets } from '../Models/rollConfigPresets'
import { Component, h, hx } from '@fun-land/fun-web'
import { styles } from './ActiveGames.css'

type GameState = PersistedState & { id: string }

const createGame = (uid: string, title: string, state: FunState<boolean>) => (): void => {
  state.set(true)
  const gameState: PersistedState = {
    owners: [uid],
    system: '',
    players: [],
    rollConfig: presets[0],
    rolls: [],
    miroId: '',
    title,
    theme: defaultTheme,
  }
  addDoc(collection(getFirestore(), 'games'), gameState)
    .then((value) => {
      window.location.href = `settings.html?id=${value.id}`
      state.set(false)
    })
    .catch((e) => {
      console.error(e)
      alert('failed to create game')
    })
}

const logout = (): Promise<void> => getAuth().signOut()

export const ActiveGames: Component<{ games: GameState[]; user: FSUser }> = (signal, { games, user }) => {
  const state = funState(false)
  const newGameButton = hx(
    'button',
    { signal, props: { className: 'primary' }, on: { click: () => createGame(user.uid, 'New Game', state) } },
    ['New Game'],
  )
  const logoutButton = hx('button', { signal, props: { className: 'primary' }, on: { click: () => logout() } }, [
    'Logout',
  ])
  return h('div', {}, [
    h('div', { className: styles.actions }, [newGameButton, logoutButton]),
    h('h2', {}, ['Active Games']),
    h(
      'ul',
      { className: styles.list },
      games.map((game) => h('li', {}, [h('a', { href: `game.html?id=${game.id}` }, [game.title || 'untitled'])])),
    ),
  ])
}
