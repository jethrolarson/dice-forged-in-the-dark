import { FC, useEffect, useState } from 'react'
import { DocumentReference, getDoc, deleteDoc, setDoc } from '@firebase/firestore'
import { classes, stylesheet } from 'typestyle'
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
import { validateTitle } from './validate'
import { funState, merge } from '@fun-land/fun-state'
import { bindProperty, Component, enhance, h, on, renderWhen } from '@fun-land/fun-web'

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

const noop = (): void => undefined

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

export const LoadedGameSettings: Component<{
  gameId: string
  initialState: GameSettingsState
  gdoc: DocumentReference
}> = (signal, { gameId, initialState, gdoc }) => {
  const state = funState<GameSettingsState>(initialState)

  const saveSettings = (): void => {
    const { rollConfigText, title, miroId, theme, system } = state.get()
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
  }
  const themeField = h('label', { key: 'themelabel' }, [
    'Theme: ',
    enhance(
      h(
        'select',
        {
          key: 'themeselect',
          className: styles.loadPreset,
        },
        Object.values(Theme).map((theme) => h('option', { key: theme }, [theme])),
      ),
      bindProperty('value', state.prop('theme'), signal),
      on('change', ({ currentTarget: { value } }) => state.prop('theme').set(value), signal),
    ),
  ])
  const saveButton = h(
    'button',
    {
      key: 'save',
      onClick: gdoc ? saveSettings : noop,
      className: 'primary',
    },
    ['Save Settings'],
  )
  state.watch(signal, ({ title, rollConfigText }) => (saveButton.disabled = !title || !rollConfigText))
  const rootEl = h('div', {}, [
    h('header', { key: 'heading', className: styles.heading }, [h('h1', { key: 'title' }, ['Game Settings'])]),
    h('label', { key: 'nameLabel' }, [
      'Game Name',
      TextInput(signal, {
        passThroughProps: { 'aria-label': 'Game Name', required: true },
        $: state.prop('title'),
      }),
    ]),
    h('label', {}, [
      'Miro Id (optional)',
      TextInput(signal, { passThroughProps: { 'aria-label': 'Miro Id' }, $: state.prop('miroId') }),
    ]),
    themeField,
    h('label', { key: 'presetLabel' }, [
      'Game system: ',
      h(
        'select',
        {
          key: 'presetSelect',
          className: styles.loadPreset,
          value: state.prop('system').get(),
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
    renderWhen({
      component: (signal) =>
        enhance(
          h('div', { key: 'error', className: styles.error }, []),
          bindProperty('textContent', state.prop('rollConfigError'), signal),
        ),
      signal,
      state,
      predicate: (gs) => !!gs.rollConfigText,
      props: {},
    }),

    h('footer', { className: styles.footer }, [
      h('div', { key: 'left', className: styles.leftButtons }, [
        saveButton,
        h('button', { onClick: () => location.assign(`#/game/${gameId}`) }, ['Cancel']),
      ]),
      h('button', { key: 'delete', className: 'dangerous', onClick: gdoc ? deleteGame(gdoc) : noop }, ['Delete Game']),
    ]),
  ])
  state.watch(signal, ({ theme }) => {
    rootEl.className = classes(styles.GameSettings, theme)
  })
  return rootEl
}

const setRollConfig = (gs: LoadedGameState): GameSettingsState => {
  const rollConfigText = JSON.stringify(gs.rollConfig || presets[0], null, 2)
  return { ...gs, rollConfigText, rollConfigError: '' }
}

export const GameSettings: Component<{ gameId: string }> = (signal, { gameId }) => {
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
      return LoadedGameSettings(signal, { initialState: setRollConfig(gameState), gameId, gdoc })
    case 'MissingGameState':
      return h('h1', null, ['Game not found. Check the url'])
    case 'LoadingGameState':
      return h('div', null, ['Game Loading'])
    case 'ErrorGameState':
      return h('h1', null, ['Error loading game. Try refreshing the page.'])
  }
}
