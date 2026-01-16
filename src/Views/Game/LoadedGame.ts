import {
  collection,
  DocumentData,
  DocumentReference,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
} from '@firebase/firestore'
import { funState, merge } from '@fun-land/fun-state'
import { Component, h, hx, bindListChildren } from '@fun-land/fun-web'
import { important } from 'csx'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { gears } from 'react-icons-kit/fa/gears'
import { classes, stylesheet } from 'typestyle'
import { Icon } from '../../components/Icon'
import { LoadedGameState, LogItem } from '../../Models/GameModel'
import { playCritSound, playMessageSound, playRollSound, playWarnSound, playWinSound } from '../../sounds'
import { AshworldForm } from './AshworldForm/AshworldForm'
import { MIForm } from './MIForm/MIForm'
import { RollForm } from './RollForm/RollForm'
import { RollLogItem } from './RollLog'
import { RollMessage } from './RollMessage'
import { valuateActionRoll } from './RollValuation'
import { prop } from '@fun-land/accessor'

const styles = stylesheet({
  Game: {},
  body: {
    display: 'flex',
  },
  left: {
    flexGrow: 1,
  },
  right: {
    display: 'flex',
    borderLeft: 'var(--border-game)',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    maxWidth: 400,
    background: 'var(--bg-game)',
    backgroundRepeat: 'no-repeat',
    color: 'var(--fc)',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    background: 'transparent',
    verticalAlign: 'bottom',
    fontSize: '2.2rem',
    margin: 0,
    appearance: 'none',
    border: '2px solid transparent',
    padding: '5px',
    flexGrow: 1,
    $nest: {
      '&:focus': {
        borderColor: '#fff',
        outline: 'none',
      },
    },
  },
  title_small: {
    fontSize: '1.5rem',
  },
  settingsButton: {
    border: 'none',
    padding: 10,
    background: 'transparent',
    textDecoration: 'none',
    color: important('var(--c-icon-button)'),
    transition: 'color 0.2s',
    $nest: {
      '&:hover': {
        color: important('var(--c-icon-button-hover)'),
        transition: 'color 0.2s',
      },
    },
  },
  log: {
    borderBottom: '1px solid var(--border-color)',
    borderWidth: '1px 0',
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    overflowY: 'scroll',
  },
  rolls: {
    marginTop: 'auto',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  tabs: {
    display: 'flex',
    $nest: {
      '&>*': {
        flex: '1 0',
        borderColor: 'transparent',
        borderWidth: '2px 0 0 ',
        background: important('transparent'),
        color: important('var(--border-color)'),
      },
    },
  },
  tabOn: {
    borderColor: 'var(--border-color)',
  },
  canvas: {
    width: '100%',
    height: '100vh',
    display: 'block',
  },
  showDiceCol: {
    display: 'flex',
    minWidth: 15,
    background: 'var(--bg-scrollbar)',
    $nest: {
      '&:hover span': {
        display: 'block',
      },
    },
  },
  showDiceApp: {
    writingMode: 'vertical-rl',
  },
  minimize: {
    marginRight: 5,
    textDecoration: important('none'),
  },
})

const inLastTenSeconds = (date: number): boolean => Date.now() - date < 10_000

const onNewLogItem = (item: LogItem): Promise<unknown> => {
  if (item.kind === 'Message') {
    return playMessageSound()
  } else if (item.kind === 'Roll') {
    const valuation = valuateActionRoll(item)
    switch (valuation) {
      case 'Miss':
        return playWarnSound()
      case 'MixedSuccess':
        return playRollSound()
      case 'Success':
        return playWinSound()
      case 'Crit':
        return playCritSound()
      case 'CritFail':
        return playWarnSound()
    }
  }
  return Promise.resolve()
}

const setPageTitle = (title: string) => {
  window.document.title = `${title} - Dice Forged in the Dark`
}

const parseRoll = (d: LogItem & { results?: number[]; effect?: string[]; position?: string }): LogItem => {
  switch (d.kind) {
    case 'Message':
      return d
    default:
      return {
        ...d,
        lines: d.lines ?? [d.position, d.effect],
        diceRolled: d.diceRolled
          ? d.diceRolled
          : (d.results?.map((value) => ({ value, dieType: 'd6', dieColor: 'white' })) ?? []),
      }
  }
}

const updateLogItems =
  (docs: QueryDocumentSnapshot<DocumentData>[]) =>
  (oldRolls: LogItem[]): LogItem[] => {
    const newRolls = docs.map((d): LogItem => parseRoll({ ...(d.data() as LogItem), id: d.id }))
    const latestRoll = newRolls[newRolls.length - 1]
    const latestOldRoll = oldRolls[oldRolls.length - 1]
    if (latestRoll && latestOldRoll && latestOldRoll.id !== latestRoll.id && inLastTenSeconds(latestRoll.date)) {
      void onNewLogItem(latestRoll)
    }
    return newRolls
  }

export const LoadedGame: Component<{
  initialState: LoadedGameState
  gameId: string
  gdoc: DocumentReference
  uid: string
  userDisplayName: string
}> = (signal, { initialState, gameId, gdoc, uid, userDisplayName }) => {
  const state = funState<LoadedGameState>(initialState)
  const hidden = funState(false)
  const scrollContainer = h('div', {})

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollContainer.scrollTo({ top: scrollContainer.scrollHeight })
    })
  }

  // Subscribe to game document
  onSnapshot(gdoc, (ss) => {
    const data = ss.data()
    setPageTitle((data?.title as string) ?? '')
    data && merge(state)(data)
  })

  // Subscribe to rolls collection
  onSnapshot(query(collection(gdoc, 'rolls'), orderBy('date')), (snapshot) => {
    state.prop('rollsLoaded').set(true)
    state.prop('rolls').mod(updateLogItems(snapshot.docs))
  })

  // Stay scrolled to the bottom when rolls change
  state.prop('rolls').watch(signal, () => {
    scrollToBottom()
  })

  // Handle theme changes
  state.prop('theme').watch(signal, (theme) => {
    document.documentElement.classList.add(theme)
    signal.addEventListener('abort', () => {
      document.documentElement.classList.remove(theme)
    })
  })

  const showDiceButton = hx(
    'button',
    { signal, props: { className: styles.showDiceApp }, on: { click: () => hidden.set(false) } },
    [h('span', { className: styles.showDiceApp }, ['Show Dice App'])],
  )
  const minimizeButton = hx(
    'button',
    {
      signal,
      props: { className: styles.minimize, title: 'Click to Minimize' },
      on: { click: () => hidden.set(true) },
    },
    ['_'],
  )

  const iframe = h('iframe', {
    className: styles.canvas,
    frameBorder: '0',
    scrolling: 'no',
    allowFullScreen: true,
  })

  const loadingP = h('p', {}, ['Loading...'])
  const rollsContainer = h('div', { className: styles.rolls }, [])
  const leftSection = h('div', { className: styles.left }, [])
  const showDiceCol = h('div', { className: styles.showDiceCol }, [showDiceButton])
  const titleH1 = h('h1', { className: styles.title }, [])
  const rollFormContainer = h('div', {}, [])

  const diceColSection = h('section', { className: styles.right }, [
    h('div', { className: styles.heading }, [
      h('a', { href: '#/' }, [Icon(signal, { icon: chevronLeft, size: 28 })]),
      titleH1,
      h(
        'a',
        {
          href: `#/game-settings/${gameId}`,
          className: styles.settingsButton,
          title: 'Game Settings',
        },
        [Icon(signal, { icon: gears, size: 28 })],
      ),
      minimizeButton,
    ]),
    scrollContainer,
    rollFormContainer,
  ])

  scrollContainer.className = styles.log

  // Create form container elements
  const miFormContainer = h('div', {}, [MIForm(signal, { gdoc, uid, scrollToBottom, userDisplayName })])
  const ashworldFormContainer = h('div', {}, [AshworldForm(signal, { uid, gdoc, scrollToBottom, userDisplayName })])
  const oldRollFormContainer = h('div', {}, [])

  miFormContainer.style.display = 'none'
  ashworldFormContainer.style.display = 'none'
  oldRollFormContainer.style.display = 'none'

  rollFormContainer.appendChild(miFormContainer)
  rollFormContainer.appendChild(ashworldFormContainer)
  rollFormContainer.appendChild(oldRollFormContainer)

  // Watch title
  state.prop('title').watch(signal, (title) => {
    titleH1.textContent = title
    titleH1.className = classes(styles.title, title.length > 14 && styles.title_small)
  })

  // Watch miroId
  state.prop('miroId').watch(signal, (miroId) => {
    if (miroId) {
      iframe.setAttribute('src', `https://miro.com/app/live-embed/${miroId}/`)
      leftSection.replaceChildren(iframe)
      minimizeButton.style.display = ''
    } else {
      leftSection.replaceChildren()
      minimizeButton.style.display = 'none'
    }
  })

  // Watch rolls with keyedChildren
  state.prop('rollsLoaded').watch(signal, (loaded) => {
    if (!loaded) {
      scrollContainer.replaceChildren(loadingP)
    } else {
      scrollContainer.replaceChildren(rollsContainer)
    }
  })

  bindListChildren({
    signal,
    key: prop<LogItem>()('id'),
    state: state.prop('rolls'),
    row: ({ state: rollState, signal: childSignal }) => {
      const roll = rollState.get()
      const rolls = state.prop('rolls').get()
      const index = rolls.findIndex((r) => r.id === roll.id)
      const isLast = index === rolls.length - 1

      return h('article', {}, [
        roll.kind === 'Message'
          ? RollMessage(childSignal, { result: roll })
          : roll.kind === 'Roll'
            ? RollLogItem(childSignal, { result: roll, isLast })
            : null,
      ])
    },
  })(rollsContainer)

  // Watch rollConfig and update form
  state.prop('rollConfig').watch(signal, (rollConfig) => {
    if (rollConfig.system === 'mala-incognita') {
      miFormContainer.style.display = ''
      ashworldFormContainer.style.display = 'none'
      oldRollFormContainer.style.display = 'none'
    } else if (rollConfig.system === 'Ash World 0.1') {
      miFormContainer.style.display = 'none'
      ashworldFormContainer.style.display = ''
      oldRollFormContainer.style.display = 'none'
    } else {
      miFormContainer.style.display = 'none'
      ashworldFormContainer.style.display = 'none'
      oldRollFormContainer.style.display = ''
      // Replace old roll form since it changes completely based on config
      oldRollFormContainer.replaceChildren(RollForm(signal, { rollConfig, gdoc, uid, userDisplayName }))
    }
  })

  // Watch hidden state
  hidden.watch(signal, (isHidden) => {
    if (isHidden) {
      showDiceCol.style.display = ''
      diceColSection.style.display = 'none'
    } else {
      showDiceCol.style.display = 'none'
      diceColSection.style.display = ''
    }
  })

  return h('div', { className: styles.Game }, [
    h('div', { className: styles.body }, [leftSection, showDiceCol, diceColSection]),
  ])
}
