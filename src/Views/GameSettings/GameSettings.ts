import React, { FC, useEffect, useState } from 'react'
import { DocumentReference, getDoc, deleteDoc, setDoc } from '@firebase/firestore'
import { classes, stylesheet } from 'typestyle'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { useDoc } from '../../hooks/useDoc'
import {
  PersistedState,
  GameSettingsView,
  LoadedGameState,
  initialGameState,
  GameState,
  initialLoadedGameState,
  Theme,
} from '../../Models/GameModel'
import { parseRollConfig, RollConfig } from '../../Models/RollConfig'
import { pipe } from 'fp-ts/lib/function'
import { PathReporter } from 'io-ts/PathReporter'
import { presets } from '../../Models/rollConfigPresets'
import { TextInput } from '../../components/TextInput'
import { Textarea } from '../../components/Textarea'
import useFunState from '@fun-land/use-fun-state'
import { validateTitle } from './validate'
import { merge } from '@fun-land/fun-state'
import { div, label, e, h, button } from '../../util'

const styles = stylesheet({
  GameSettings: {
    background: 'var(--bg-game)',
    color: 'var(--fc)',
    padding: '10px 34px 34px',
    flex: 1,
    display: 'grid',
    gridGap: 10,
    alignContent: 'start',
  },
  heading: {
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
  loadPreset: {
    display: 'inline-block',
    width: 'auto',
    marginBottom: 2,
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
  leftButtons: { display: 'flex', gap: 10 },
  footer: { display: 'flex', justifyContent: 'space-between' },
})

const noop = (): void => {}

const deleteGame = (gdoc: DocumentReference) => (): void => {
  if (window.confirm('Are you sure you want to delete this game permanently?')) {
    deleteDoc(gdoc).catch((e) => {
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

export const LoadedGameSettings: FC<{ gameId: string; initialState: GameSettingsState; gdoc: DocumentReference }> = ({
  gameId,
  initialState,
  gdoc,
}) => {
  const state = useFunState<GameSettingsState>(initialState)
  const { rollConfigText, rollConfigError, title, miroId, theme, system } = state.get()

  const saveSettings = (): void =>
    pipe(
      parseRollConfig(rollConfigText),
      validateTitle(title),
      E.map((rollConfig: RollConfig) => {
        state.prop('rollConfigError').set('')
        setDoc(gdoc, { rollConfig, title, miroId, theme, system }, { merge: true })
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

  return div({ className: classes(styles.GameSettings, theme) }, [
    h('header', { key: 'heading', className: styles.heading }, [h('h1', { key: 'title' }, ['Game Settings'])]),
    label({ key: 'nameLabel' }, [
      'Game Name',
      e(TextInput, {
        key: 'nameinput',
        passThroughProps: { 'aria-label': 'Game Name', required: true },
        state: state.prop('title'),
      }),
    ]),
    label({ key: 'miroLabel' }, [
      'Miro Id (optional)',
      e(TextInput, { key: 'miroinput', passThroughProps: { 'aria-label': 'Miro Id' }, state: state.prop('miroId') }),
    ]),
    label({ key: 'themelabel' }, [
      'Theme: ',
      h(
        'select',
        {
          key: 'themeselect',
          className: styles.loadPreset,
          onChange: ({ target: { value } }) => {
            state.prop('theme').set(value)
          },
          value: state.prop('theme').get(),
        },
        ...Object.values(Theme).map((theme) => h('option', { key: theme }, [theme])),
      ),
    ]),
    label({ key: 'presetLabel' }, [
      'Load Preset: ',
      h(
        'select',
        {
          key: 'presetSelect',
          className: styles.loadPreset,
          onChange: ({ target: { value } }): void => {
            merge(state)({
              rollConfigText: JSON.stringify(
                presets.find((preset) => preset.system === value),
                null,
                2,
              ),
              system: value,
            })
          },
        },
        presets.map((preset) => h('option', { key: preset.system, value: preset.system }, [preset.system ?? 'Other'])),
      ),
    ]),
    rollConfigError && div({ key: 'error', className: styles.error }, [rollConfigError]),

    h('footer', { className: styles.footer }, [
      div({ key: 'left', className: styles.leftButtons }, [
        button({ key: 'save', onClick: gdoc ? saveSettings : noop, disabled: !title || !rollConfigText }, [
          'Save Settings',
        ]),
        button({ onClick: () => location.assign(`#/game/${gameId}`) }, ['Cancel']),
      ]),
      button({ key: 'delete', className: 'dangerous', onClick: gdoc ? deleteGame(gdoc) : noop }, ['Delete Game']),
    ]),
  ])
}

const setRollConfig = (gs: LoadedGameState): GameSettingsState => {
  const rollConfigText = JSON.stringify(gs.rollConfig || presets[0], null, 2)
  return { ...gs, rollConfigText, rollConfigError: '' }
}

export const GameSettings: FC<{ gameId: string }> = ({ gameId }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const gdoc = useDoc(`games/${gameId}`)
  useEffect(() => {
    getDoc(gdoc)
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
  }, [gameId])

  switch (gameState.kind) {
    case 'LoadedGameState':
      return e(LoadedGameSettings, { initialState: setRollConfig(gameState), gameId, gdoc })
    case 'MissingGameState':
      return h('h1', null, ['Game not found. Check the url'])
    case 'LoadingGameState':
      return div(null, ['Game Loading'])
    case 'ErrorGameState':
      return h('h1', null, ['Error loading game. Try refreshing the page.'])
  }
}
