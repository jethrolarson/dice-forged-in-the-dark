import React, { FC, useEffect } from 'react'
import firebase from 'firebase/app'
import debounce from 'lodash.debounce'
import { stylesheet } from 'typestyle'
import useFunState, { merge } from 'fun-state'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import * as O from 'fp-ts/lib/Option'
import { useDoc } from './useDoc'
import { PersistedState, initialPersistedState, GameSettingsView } from './GameModel'

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
})

const noop = (): void => {}
const saveEffectOptions = debounce((gdoc: firebase.firestore.DocumentReference, value: string): void => {
  if (gdoc)
    gdoc.set({ effectOptions: value }, { merge: true }).catch((e) => {
      console.error(e)
      alert('save failed')
    })
}, 2000)
const savePositionOptions = debounce((gdoc: firebase.firestore.DocumentReference, value: string): void => {
  if (gdoc)
    gdoc.set({ positionOptions: value }, { merge: true }).catch((e) => {
      console.error(e)
      alert('save failed')
    })
}, 2000)

const saveRollTypeOptions = debounce((gdoc: firebase.firestore.DocumentReference, value: string): void => {
  if (gdoc)
    gdoc.set({ rollTypeOptions: value }, { merge: true }).catch((e) => {
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

export const GameSettings: FC<{ gameId: string }> = ({ gameId }) => {
  const gdoc = useDoc(`games/${gameId}`)
  const state = useFunState<PersistedState>({ ...initialPersistedState })
  const { positionOptions, effectOptions, rollTypeOptions, title } = state.get()
  useEffect(() => {
    if (gdoc) {
      gdoc.onSnapshot((ss) => {
        const data = ss.data()
        window.document.title =
          (data && Reflect.has(data, 'title') && typeof data.title === 'string' ? data.title : 'Untitled') +
          ' - Dice Forged in the Dark'
        data && merge(state)(data)
      })
    }
  }, [gdoc])
  const onPositionOptionsChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    state.prop('positionOptions').set(value)
    if (gdoc) savePositionOptions(gdoc, value)
  }
  const onEffectOptionsChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    state.prop('effectOptions').set(value)
    if (gdoc) saveEffectOptions(gdoc, value)
  }
  const onRollTypeOptionsChange: React.ChangeEventHandler<HTMLTextAreaElement> = ({ currentTarget: { value } }) => {
    state.prop('rollTypeOptions').set(value)
    if (gdoc) saveRollTypeOptions(gdoc, value)
  }
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
        Role Type Options
        <br />
        <textarea value={rollTypeOptions} onChange={onRollTypeOptionsChange} />
      </label>
      <label>
        {' '}
        Position Options
        <br />
        <input type="text" value={positionOptions} onChange={onPositionOptionsChange} width={300} />
      </label>
      <label>
        {' '}
        Effect Options
        <br />
        <input type="text" value={effectOptions} onChange={onEffectOptionsChange} width={200} />
      </label>
      <div>
        <button className="dangerous" onClick={gdoc ? deleteGame(gdoc) : noop}>
          Delete Game
        </button>
      </div>
    </div>
  )
}
