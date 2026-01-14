import type { User as FSUser } from '@firebase/auth'
import { getAuth } from '@firebase/auth'
import { addDoc, collection, getFirestore } from '@firebase/firestore'
import { funState, FunState } from '@fun-land/fun-state'
import { stylesheet } from 'typestyle'
import { defaultTheme, PersistedState } from '../Models/GameModel'
import { presets } from '../Models/rollConfigPresets'
import { Component, enhance, h, on } from '@fun-land/fun-web'

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
      window.location.hash = `#/game-settings/${value.id}`
      state.set(false)
    })
    .catch((e) => {
      console.error(e)
      alert('failed to create game')
    })
}

const logout = (): Promise<void> => getAuth().signOut()

const styles = stylesheet({
  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 30,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    $nest: {
      li: {
        margin: '4px 0',
      },
    },
  },
})

export const ActiveGames: Component<{ games: GameState[]; user: FSUser }> = (signal, { games, user }) => {
  const state = funState(false)
  return h('div', {}, [
    h('div', { className: styles.actions }, [
      enhance(
        h('button', { className: 'primary' }, ['New Game']),
        on('click', createGame(user.uid, 'New Game', state), signal),
      ),
      enhance(
        h('button', {}, ['Logout']),
        on('click', () => void logout(), signal),
      ),
    ]),
    h('h2', {}, ['Active Games']),
    h(
      'ul',
      { className: styles.list },
      games.map((game) => h('li', {}, [h('a', { href: `#/game/${game.id}` }, [game.title || 'untitled'])])),
    ),
  ])
}
