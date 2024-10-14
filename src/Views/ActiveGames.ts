import type { User as FSUser } from '@firebase/auth'
import { getAuth } from '@firebase/auth'
import { addDoc, collection, getFirestore } from '@firebase/firestore'
import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { defaultTheme, PersistedState } from '../Models/GameModel'
import { presets } from '../Models/rollConfigPresets'
import { button, div, h } from '../util'

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

export const ActiveGames = ({ games, user }: { games: GameState[]; user: FSUser }) => {
  const state = useFunState(false)
  return div(null, [
    div({ className: styles.actions }, [
      button(
        {
          className: 'primary',
          onClick: createGame(user.uid, 'New Game', state),
        },
        ['New Game'],
      ),

      button({ onClick: () => void logout() }, ['Logout']),
    ]),
    h('h2', null, ['Active Games']),
    h(
      'ul',
      { className: styles.list },
      games.map((game) =>
        h('li', { key: game.id }, [h('a', { href: `#/game/${game.id}` }, [game.title || 'untitled'])]),
      ),
    ),
  ])
}
