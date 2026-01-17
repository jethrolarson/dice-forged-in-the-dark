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
import { Component, h, hx, bindListChildren, bindView } from '@fun-land/fun-web'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { gears } from 'react-icons-kit/fa/gears'
import { classes } from '../../util'
import { styles } from './LoadedGame.css'
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
    document.documentElement.className = theme
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

  const rollsContainer = h('div', { className: styles.rolls }, [])
  const leftSection = bindView(signal, state.prop('miroId'), (regionSignal, miroId) => {
    if (miroId) {
      return h('iframe', {
        className: styles.canvas,
        frameBorder: '0',
        scrolling: 'no',
        allowFullScreen: true,
        src: `https://miro.com/app/live-embed/${miroId}/`,
      })
    }
    return h('div', {}, [])
  })
  const showDiceCol = h('div', { className: styles.showDiceCol }, [showDiceButton])
  const titleH1 = h('h1', { className: styles.title }, [])
  const rollFormContainer = h('div', {}, [])

  const diceColSection = h('section', { className: styles.right }, [
    h('div', { className: styles.heading }, [
      h('a', { href: 'index.html' }, [Icon(signal, { icon: chevronLeft, size: 28 })]),
      titleH1,
      h(
        'a',
        {
          href: `settings.html?id=${gameId}`,
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
  const oldRollFormContainer = bindView(signal, state.prop('rollConfig'), (regionSignal, rollConfig) => {
    if (rollConfig.system === 'mala-incognita' || rollConfig.system === 'Ash World 0.1') {
      return h('div', {}, [])
    }
    return RollForm(regionSignal, { rollConfig, gdoc, uid, userDisplayName })
  })

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

  // Watch miroId to show/hide minimize button
  state.prop('miroId').watch(signal, (miroId) => {
    minimizeButton.style.display = miroId ? '' : 'none'
  })

  // Watch rolls with keyedChildren
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

  const scrollContent = bindView(signal, state.prop('rollsLoaded'), (_regionSignal, loaded) => {
    if (!loaded) {
      return h('p', {}, ['Loading...'])
    }
    return rollsContainer
  })
  
  scrollContainer.replaceChildren(scrollContent)

  // Watch rollConfig and update form visibility
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
