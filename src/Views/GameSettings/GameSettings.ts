import { DocumentReference, getDoc, deleteDoc, setDoc } from '@firebase/firestore'
import { classes } from '../../util'
import { styles } from './GameSettings.css'
import * as E from 'fp-ts/lib/Either'
import { getDocRef } from '../../services/getDoc'
import {
  PersistedState,
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
import {  Component, h, hx, renderWhen, bindView } from '@fun-land/fun-web'
import { getUser } from '../../services/getUser'
import { Login } from '../Login/Login'

const deleteGame = (gdoc: DocumentReference): void => {
  if (window.confirm('Are you sure you want to delete this game permanently?')) {
    deleteDoc(gdoc).catch((e) => {
      console.error(e)
      alert('delete failed')
    })
    window.location.href = 'index.html'
  }
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
            window.location.href = `game.html?id=${gameId}`
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
  const themeField = h('label', {}, [
    'Theme: ',
    hx(
      'select',
      {
        signal,
        props: { className: styles.loadPreset },
        bind: { value: state.prop('theme') },
        on: { change: ({ currentTarget: { value } }) => state.prop('theme').set(value) },
      },
      Object.values(Theme).map((theme) => h('option', {}, [theme])),
    ),
  ])
  const saveButton = hx(
    'button',
    { signal, props: { className: 'primary' }, on: { click: () => gdoc && saveSettings() } },
    ['Save Settings'],
  )
  state.watch(signal, ({ title, rollConfigText }) => (saveButton.disabled = !title || !rollConfigText))
  const gameSystemField = h('label', {}, [
    'Game system: ',
    hx(
      'select',
      {
        signal,
        props: {
          className: styles.loadPreset,
        },
        bind: { value: state.prop('system') },
        on: {
          change: ({ currentTarget: { value } }): void => {
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
      },
      presets.map((preset) => h('option', { value: preset.system }, [preset.system ?? 'Other'])),
    ),
  ])
  const rootEl = h('div', {}, [
    h('header', { className: styles.heading }, [h('h1', {}, ['Game Settings'])]),
    h('label', {}, [
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
    gameSystemField,
    renderWhen({
      component: (signal) =>
        hx(
          'div',
          { signal, props: { className: styles.error }, bind: { textContent: state.prop('rollConfigError') } },
          [],
        ),
      signal,
      state,
      predicate: (gs) => !!gs.rollConfigText,
      props: {},
    }),

    h('footer', { className: styles.footer }, [
      h('div', { className: styles.leftButtons }, [
        saveButton,
        hx('button', { signal, props: { type: 'button' }, on: { click: () => location.assign(`game.html?id=${gameId}`) } }, [
          'Cancel',
        ]),
      ]),
      hx(
        'button',
        { signal, props: { type: 'button', className: 'dangerous' }, on: { click: () => gdoc && deleteGame(gdoc) } },
        ['Delete Game'],
      ),
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

const GameSettingsWithAuth: Component<{ gameId: string }> = (signal, { gameId }) => {
  const gameState = funState<GameState>(initialGameState)
  const gdoc = getDocRef(`games/${gameId}`)

  getDoc(gdoc)
    .then((ss) => {
      const data = ss.data()
      window.document.title =
        (data && Reflect.has(data, 'title') && typeof data.title === 'string' ? data.title : 'Untitled') +
        ' - Dice Forged in the Dark'
      if (data) {
        gameState.set(initialLoadedGameState(data as PersistedState))
      }
    })
    .catch((err) => {
      console.error(err)
      gameState.set({ kind: 'ErrorGameState' })
    })

  return bindView(signal, gameState, (regionSignal, state) => {
    switch (state.kind) {
      case 'LoadedGameState':
        return LoadedGameSettings(regionSignal, { initialState: setRollConfig(state), gameId, gdoc })
      case 'MissingGameState':
        return h('h1', {}, ['Game not found. Check the url'])
      case 'LoadingGameState':
        return h('div', {}, ['Game Loading'])
      case 'ErrorGameState':
        return h('h1', {}, ['Error loading game. Try refreshing the page.'])
    }
  })
}

export const GameSettings: Component<{ gameId: string }> = (signal, { gameId }) => {
  const userState = getUser(signal)

  return bindView(signal, userState, (regionSignal, user) =>
    user ? GameSettingsWithAuth(regionSignal, { gameId }) : Login(regionSignal, {}),
  )
}
