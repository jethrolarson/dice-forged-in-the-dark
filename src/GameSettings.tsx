import React, { FC, useEffect } from 'react'
import firebase from 'firebase/app'
import debounce from 'lodash.debounce'
import { stylesheet } from 'typestyle'
import useFunState, { merge } from 'fun-state'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { useDoc } from './useDoc'
import { PersistedState, initialPersistedState, GameSettingsView } from './Models/GameModel'
import { initialRollConfig, nocturneRollConfig, parseRollConfig, RollConfig } from './Models/RollConfig'
import { pipe } from 'fp-ts/lib/function'
import { PathReporter } from 'io-ts/PathReporter'

const styles = stylesheet({
  GameSettings: {
    background: 'radial-gradient(hsl(170, 80%, 15%), hsl(200, 60%, 8%))',
    padding: '10px 34px 34px',
    flex: 1,
    display: 'grid',
    gridGap: 10,
    alignContent: 'start',
  },
  heading: {
    marginLeft: -32,
    display: 'flex',
    alignItems: 'center',
    $nest: {
      h1: {
        margin: 0,
        marginLeft: 4,
        fontWeight: 'normal',
      },
    },
  },
  rollConfig: {
    height: 600,
  },
  error: { color: 'red' },
})

const noop = (): void => {}

const saveRollConfig = debounce((gdoc: firebase.firestore.DocumentReference, rollConfig: RollConfig): void => {
  if (gdoc)
    gdoc.set({ rollConfig }, { merge: true }).catch((e) => {
      console.error(e)
      alert('save failed')
    })
}, 2000)

const saveTitle = debounce((gdoc: firebase.firestore.DocumentReference, value: string): void => {
  if (gdoc)
    gdoc.set({ title: value }, { merge: true }).catch((e) => {
      console.error(e)
      alert('save failed')
    })
}, 2000)

const deleteGame = (gdoc: firebase.firestore.DocumentReference) => (): void => {
  if (gdoc && window.confirm('Are you sure you want to delete this game permanently?')) {
    gdoc.delete().catch((e) => {
      console.error(e)
      alert('delete failed')
    })
    document.location.hash = '#'
  }
}

export const gameSettingsPath = (path: string): O.Option<GameSettingsView> => {
  const m = /^\/game-settings\/([^/?]+)/.exec(path)
  return m && m.length > 0 && m[1] ? O.some({ kind: 'GameSettingsView', id: m[1] }) : O.none
}

type GameSettingsState = PersistedState & { rollConfigText: string; rollConfigError: string }

export const GameSettings: FC<{ gameId: string }> = ({ gameId }) => {
  const gdoc = useDoc(`games/${gameId}`)
  const state = useFunState<GameSettingsState>({
    ...initialPersistedState,
    rollConfigText: '',
    rollConfigError: '',
  })
  const { rollConfigText, title, rollConfigError } = state.get()
  useEffect(() => {
    if (gdoc) {
      gdoc.onSnapshot((ss) => {
        const data = ss.data()
        window.document.title =
          (data && Reflect.has(data, 'title') && typeof data.title === 'string' ? data.title : 'Untitled') +
          ' - Dice Forged in the Dark'
        if (data) {
          data.rollConfigText = JSON.stringify(data?.rollConfig || initialRollConfig, null, 2)
          merge(state)(data)
        }
      })
    }
  }, [gdoc])
  const updateConfig = (value: string): void => {
    state.prop('rollConfigText').set(value)
    if (gdoc)
      pipe(
        parseRollConfig(value),
        E.map((config: RollConfig) => {
          state.prop('rollConfigError').set('')
          saveRollConfig(gdoc, config)
          return config
        }),
        (result) => state.prop('rollConfigError').set(PathReporter.report(result).join('')),
      )
  }
  const onRollConfigChange: React.ChangeEventHandler<HTMLTextAreaElement> = ({ currentTarget: { value } }) =>
    updateConfig(value)
  const onTitleChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    state.prop('title').set(value)
    if (gdoc) saveTitle(gdoc, value)
  }

  return (
    <div className={styles.GameSettings}>
      <div className={styles.heading}>
        <a href={`#/game/${gameId}`}>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Icon icon={chevronLeft} size={28} />
        </a>
        <h1>Game Settings</h1>
      </div>
      <label>
        Game Name <br />
        <input type="text" aria-label="Game Name" value={title} onChange={onTitleChange} />
      </label>
      <label>
        {' '}
        Role Config
        <br />
        <textarea value={rollConfigText} onChange={onRollConfigChange} className={styles.rollConfig} />
        {rollConfigError && <div className={styles.error}>{rollConfigError}</div>}
        <button
          onClick={(): void => {
            confirm('reset your roll config to defaults?') && updateConfig(JSON.stringify(initialRollConfig, null, 2))
          }}>
          Blades in the Dark
        </button>
        <button
          onClick={(): void => {
            confirm('reset your roll config to A Nocturne?') &&
              updateConfig(JSON.stringify(nocturneRollConfig, null, 2))
          }}>
          A Nocturne
        </button>
      </label>
      <div>
        <button className="dangerous" onClick={gdoc ? deleteGame(gdoc) : noop}>
          Delete Game
        </button>
      </div>
    </div>
  )
}
