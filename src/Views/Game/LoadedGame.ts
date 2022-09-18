import React, { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { classes, stylesheet } from 'typestyle'
import { important } from 'csx'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { gears } from 'react-icons-kit/fa/gears'
import {
  onSnapshot,
  DocumentReference,
  collection,
  query,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from '@firebase/firestore'
import { LoadedGameState, LogItem } from '../../Models/GameModel'
import { RollLogItem } from './RollLog'
import { RollForm } from './RollForm/RollForm'
import { RollMessage } from './RollMessage'
import { playWarnSound, playRollSound, playWinSound, playCritSound, playMessageSound } from '../../sounds'
import { valuateActionRoll } from './RollValuation'
import useFunState from '@fun-land/use-fun-state'
import { mergeRight } from 'ramda'
import { MIForm } from './MIForm/MIForm'
import { div, e, h, button } from '../../util'
import { AshworldForm } from './AshworldForm/AshworldForm'

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
    fontSize: 30,
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
    fontSize: 18,
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
    display: 'none',
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
          : d.results?.map((value) => ({ value, dieType: 'd6', dieColor: 'white' })) ?? [],
      }
  }
}

const updateLogItems =
  (docs: Array<QueryDocumentSnapshot<DocumentData>>) =>
  (oldRolls: LogItem[]): LogItem[] => {
    const newRolls = docs.map((d): LogItem => parseRoll({ ...(d.data() as LogItem), id: d.id }))
    const latestRoll = newRolls[newRolls.length - 1]
    const latestOldRoll = oldRolls[oldRolls.length - 1]
    if (latestRoll && latestOldRoll && latestOldRoll.id !== latestRoll.id && inLastTenSeconds(latestRoll.date)) {
      void onNewLogItem(latestRoll)
    }
    return newRolls
  }

export const LoadedGame: FC<{
  initialState: LoadedGameState
  gameId: string
  gdoc: DocumentReference
  uid: string
}> = ({ initialState, gameId, gdoc, uid }) => {
  const state = useFunState<LoadedGameState>(initialState)
  const [hidden, setHidden] = useState(false)
  const { rolls, title, rollsLoaded, miroId, rollConfig, theme } = state.get()
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    onSnapshot(gdoc, (ss) => {
      const data = ss.data()
      setPageTitle((data?.title as string) ?? '')
      data && mergeRight(state)(data)
    })
    return onSnapshot(query(collection(gdoc, 'rolls'), orderBy('date')), (snapshot) => {
      state.prop('rollsLoaded').set(true)
      state.prop('rolls').mod(updateLogItems(snapshot.docs))
    })
  }, [])
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 99999999999 })
  }, [])
  // stay scrolled to the bottom
  useLayoutEffect(() => {
    scrollToBottom()
  }, [rolls])

  return div({ className: classes(styles.Game, theme) }, [
    div({ key: 'body', className: styles.body }, [
      div({ key: 'left', className: styles.left }, [
        miroId &&
          h('iframe', {
            className: styles.canvas,
            src: `https://miro.com/app/live-embed/${miroId}/`,
            frameBorder: '0',
            scrolling: 'no',
            allowFullScreen: true,
          }),
      ]),
      hidden
        ? div({ key: 'diceColbutton', className: styles.showDiceCol }, [
            button({ onClick: () => setHidden(false) }, [
              h('span', { className: styles.showDiceApp }, ['Show Dice App']),
            ]),
          ])
        : h('section', { key: 'diceCol', className: styles.right }, [
            div({ key: 'head', className: styles.heading }, [
              h('a', { key: 'back', href: '#/' }, [
                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                e(Icon, { key: 'backIcon', icon: chevronLeft, size: 28 }),
              ]),
              h('h1', { key: 'heading', className: classes(styles.title, title.length > 14 && styles.title_small) }, [
                title,
              ]),
              h(
                'a',
                {
                  key: 'settingsButton',
                  href: `#/game-settings/${gameId}`,
                  className: styles.settingsButton,
                  title: 'Game Settings',
                },
                [
                  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                  e(Icon, { key: 'gearicon', icon: gears, size: 28 }),
                ],
              ),
              button(
                {
                  key: 'minimizeButton',
                  className: styles.minimize,
                  onClick: () => setHidden(true),
                  title: 'Click to Minimize',
                },
                ['🗕'],
              ),
            ]),
            div({ key: 'log', ref: scrollRef, className: styles.log }, [
              !rollsLoaded
                ? h('p', { key: 'loading' }, ['Loading...'])
                : rolls.length
                ? div(
                    { key: 'rolls', className: styles.rolls },
                    rolls.map((r, i) =>
                      h('article', { key: `roll_${r.id}` }, [
                        r.kind === 'Message'
                          ? e(RollMessage, { key: 'message', result: r })
                          : r.kind === 'Roll'
                          ? e(RollLogItem, { key: 'logItem', result: r, isLast: i === rolls.length - 1 })
                          : null,
                      ]),
                    ),
                  )
                : null,
            ]),
            div({ key: 'rollForm' }, [
              rollConfig.system === 'mala-incognita'
                ? e(MIForm, { key: 'miForm', gdoc, uid, scrollToBottom })
                : rollConfig.system === 'Ash World 0.1'
                ? e(AshworldForm, { key: 'form', uid, gdoc, scrollToBottom })
                : e(RollForm, { key: 'oldForm', rollConfig, gdoc, uid }),
            ]),
          ]),
    ]),
  ])
}
