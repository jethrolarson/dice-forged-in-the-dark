import React, { FC, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { stylesheet } from 'typestyle'
import useFunState from 'fun-state'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { DocRef, useDoc } from '../../hooks/useDoc'
import {
  PersistedState,
  GameSettingsView,
  LoadedGameState,
  initialGameState,
  GameState,
  initialLoadedGameState,
} from '../../Models/GameModel'
import { parseRollConfig, RollConfig } from '../../Models/RollConfig'
import { pipe } from 'fp-ts/lib/function'
import { PathReporter } from 'io-ts/PathReporter'
import { bladesInTheDarkConfig, presets } from '../../Models/rollConfigPresets'
import { TextInput } from '../../components/TextInput'
import { Textarea } from '../../components/Textarea'

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
  rollConfigLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    $nest: {
      button: {
        marginLeft: 5,
      },
    },
  },
  rollConfig: {
    height: 600,
  },
  error: { color: 'red' },
  footer: { display: 'flex', justifyContent: 'space-between' },
})

const noop = (): void => {}

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

export const LoadedGameSettings: FC<{ gameId: string; initialState: GameSettingsState; gdoc: DocRef }> = ({
  gameId,
  initialState,
  gdoc,
}) => {
  const state = useFunState<GameSettingsState>(initialState)
  const { rollConfigText, rollConfigError, title } = state.get()

  const saveSettings = (): void =>
    pipe(
      parseRollConfig(rollConfigText),
      E.map((rollConfig: RollConfig) => {
        state.prop('rollConfigError').set('')
        gdoc
          .set({ rollConfig, title }, { merge: true })
          .then(() => {
            document.location.hash = `#/game/${gameId}`
          })
          .catch((e) => {
            console.error(e)
            alert('save failed')
          })
        return rollConfig
      }),
      (result) => state.prop('rollConfigError').set(PathReporter.report(result).join('')),
    )

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
        <TextInput passThroughProps={{ 'aria-label': 'Game Name' }} state={state.prop('title')} />
      </label>
      <label>
        {' '}
        <div className={styles.rollConfigLabel}>
          Roll Config
          <span>
            Load Preset:
            {presets.map((preset) => (
              <button
                key={preset.system}
                onClick={(): void => {
                  confirm(`Replace your config with ${preset.system ?? 'default'}? This can not be undone.`) &&
                    state.prop('rollConfigText').set(JSON.stringify(preset, null, 2))
                }}>
                {preset.system ?? 'Other'}
              </button>
            ))}
          </span>
        </div>
        <Textarea passThroughProps={{ className: styles.rollConfig }} state={state.prop('rollConfigText')} />
        {rollConfigError && <div className={styles.error}>{rollConfigError}</div>}
      </label>
      <div className={styles.footer}>
        <button onClick={gdoc ? saveSettings : noop}>Save Settings</button>
        <button className="dangerous" onClick={gdoc ? deleteGame(gdoc) : noop}>
          Delete Game
        </button>
      </div>
    </div>
  )
}

const setRollConfig = (gs: LoadedGameState): GameSettingsState => {
  const rollConfigText = JSON.stringify(gs.rollConfig || bladesInTheDarkConfig, null, 2)
  return { ...gs, rollConfigText, rollConfigError: '' }
}

export const GameSettings: FC<{ gameId: string }> = ({ gameId }) => {
  const gdoc = useDoc(`games/${gameId}`)
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  useEffect(() => {
    if (gdoc) {
      gdoc
        .get()
        .then((ss) => {
          const data = ss.data()
          window.document.title =
            (data && Reflect.has(data, 'title') && typeof data.title === 'string' ? data.title : 'Untitled') +
            ' - Dice Forged in the Dark'
          if (data) {
            setGameState(initialLoadedGameState(data as PersistedState))
          }
        })
        .catch((err) => {
          console.error(err)
          setGameState({ kind: 'ErrorGameState' })
        })
    }
  }, [gdoc])

  if (gdoc) {
    switch (gameState.kind) {
      case 'LoadedGameState':
        return <LoadedGameSettings initialState={setRollConfig(gameState)} gameId={gameId} gdoc={gdoc} />
      case 'MissingGameState':
        return <h1>Game not found. Check the url</h1>
      case 'LoadingGameState':
        return <div>Game Loading</div>
      case 'ErrorGameState':
        return <h1>Error loading game. Try refreshing the page. Check console if you care why.</h1>
    }
  } else {
    return <div>Doc Loading</div>
  }
}
