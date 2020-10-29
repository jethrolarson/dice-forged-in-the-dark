import React, { FC, useEffect } from 'react'
import { initialGameState, PersistedState } from './GameModel'
import fireApp from 'firebase/app'
import { useFirestore } from './useFirestore'
import { style } from 'typestyle'
import useFunState, { FunState } from 'fun-state'

type GameState = PersistedState & { id: string }

interface HomeState {
  games: GameState[]
  gameName: string
  creating: boolean
}

const createGame = (
  title: string,
  gamesDoc: fireApp.firestore.CollectionReference,
  state: FunState<HomeState>,
) => (): void => {
  state.prop('creating').set(true)
  gamesDoc
    .add({ ...initialGameState, title })
    .then((value) => {
      window.location.hash = `#/game/${value.id}`
      state.prop('creating').set(false)
    })
    .catch((e) => {
      console.error(e)
      alert('failed to create game')
    })
}

// FIXME Copied from Game.tsx
type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
const pipeVal = (f: (value: string) => unknown) => ({
  currentTarget: { value },
}: React.FormEvent<FormElement>): unknown => f(value)

export const Home: FC<{}> = () => {
  const state = useFunState<HomeState>({
    games: [],
    gameName: '',
    creating: false,
  })
  const firestore = useFirestore()

  useEffect(() => {
    if (firestore) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const gameIds: string[] = JSON.parse(localStorage.getItem('games') ?? '[]')
      Promise.all(
        gameIds.map(
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
          alert('failed to load games')
        })
    }
    return undefined
  }, [firestore])
  const { gameName, creating, games } = state.get()
  return firestore ? (
    <div className={style({ margin: '30px auto', padding: '0 30px', maxWidth: 800 })}>
      <h1>Dice Forged in the Dark</h1>
      <p>A standalone dice app for Forged-in-the-Dark games</p>
      <h2>Active Games</h2>
      <ul className={style({ listStyle: 'none', padding: 0 })}>
        {games.map((game) => (
          <li key={game.id}>
            <a href={`#/game/${game.id}`}>{game.title || 'untitled'}</a>
          </li>
        ))}
      </ul>
      <div className={style({ display: 'flex', justifyContent: 'flex-start' })}>
        <input
          placeholder="Game name"
          disabled={creating}
          type="text"
          name="game_name"
          value={gameName}
          onChange={pipeVal(state.prop('gameName').set)}
        />{' '}
        <button
          disabled={creating}
          className={style({ flexShrink: 0 })}
          onClick={createGame(gameName, firestore.collection('games'), state)}>
          Create Game
        </button>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  )
}
