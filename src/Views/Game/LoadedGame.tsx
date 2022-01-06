import useFunState, { merge } from 'fun-state'
import React, { FC, useEffect, useLayoutEffect, useRef } from 'react'
import { stylesheet } from 'typestyle'
import { color, important } from 'csx'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { gears } from 'react-icons-kit/fa/gears'
import { onSnapshot, DocumentReference, collection, query, orderBy } from '@firebase/firestore'
import { DieColor, DieResult, DieType, LoadedGameState, LogItem } from '../../Models/GameModel'
import { borderColor } from '../../colors'
import { RollLogItem } from './RollLog'
import { RollForm } from './RollForm'
import { MessageForm } from './MessageForm'
import { RollMessage } from './RollMessage'
import { getRollSound, getWarnSound, getWinSound, getCritSound, getMessageSound } from '../../sounds'
import { valuateActionRoll } from './RollValuation'
// import { Canvas } from './Canvas'

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
    flexDirection: 'column',
    height: 'calc(100vh - 57px)', // HACK use better css
    maxWidth: 400,
    background: 'radial-gradient(hsl(170, 80%, 15%), hsl(200, 60%, 8%))',
    backgroundRepeat: 'no-repeat',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${borderColor}`,
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
  settingsButton: {
    border: 'none',
    padding: 10,
    background: 'transparent',
    textDecoration: 'none',
    color: important('#2b635e'),
    transition: 'color 0.2s',
    $nest: {
      '&:hover': {
        color: important('hsl(170, 80%, 90%)'),
        transition: 'color 0.2s',
      },
    },
  },
  log: {
    borderBottom: `1px solid ${borderColor}`,
    background: 'hsla(0, 0, 40%, 0.4)',
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
        color: important(borderColor),
      },
    },
  },
  tabOn: {
    borderColor,
  },
})

const inLastTenSeconds = (date: number): boolean => Date.now() - date < 10_000

const onNewLogItem = (item: LogItem): Promise<unknown> => {
  if (item.kind === 'Message') {
    return getMessageSound().then((sound) => sound.play())
  } else if (item.kind === 'Roll') {
    const valuation = valuateActionRoll(item)
    switch (valuation) {
      case 'Miss':
        return getWarnSound().then((sound) => sound.play())
      case 'MixedSuccess':
        return getRollSound().then((sound) => sound.play())
      case 'Success':
        return getWinSound().then((sound) => sound.play())
      case 'Crit':
        return getCritSound().then((sound) => sound.play())
    }
  }
  return Promise.resolve()
}

const parseDieResult = (d: DieResult): DieResult => ({ ...d, dieColor: color(d.dieColor as unknown as string) })

const parseRoll = (d: LogItem & { results?: number[]; effect?: string[]; position?: string }): LogItem => {
  switch (d.kind) {
    case 'Message':
      return d
    case 'Paint':
      return d
    default:
      return {
        ...d,
        lines: d.lines ?? [d.position, d.effect],
        diceRolled: d.diceRolled
          ? d.diceRolled.map(parseDieResult)
          : d.results?.map((value) => ({ value, dieType: DieType.d6, dieColor: color(DieColor.white) })) ?? [],
      }
  }
}

export const LoadedGame: FC<{
  initialState: LoadedGameState
  gameId: string
  gdoc: DocumentReference
  uid: string
}> = ({ initialState, gameId, gdoc, uid }) => {
  const state = useFunState<LoadedGameState>(initialState)
  const { rolls, title, mode, rollsLoaded } = state.get()
  const setMode = (mode: LoadedGameState['mode']) => (): void => state.prop('mode').set(mode)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    onSnapshot(gdoc, (ss) => {
      const data = ss.data()
      window.document.title =
        (data && Reflect.has(data, 'title') && typeof data.title === 'string' ? data.title : 'Untitled') +
        ' - Dice Forged in the Dark'
      data && merge(state)(data)
    })
    return onSnapshot(query(collection(gdoc, 'rolls'), orderBy('date')), (snapshot) => {
      state.prop('rollsLoaded').set(true)
      state.prop('rolls').mod((oldRolls) => {
        const newRolls = snapshot.docs.map((d): LogItem => parseRoll({ ...(d.data() as LogItem), id: d.id }))
        const latestRoll = newRolls[newRolls.length - 1]
        const latestOldRoll = oldRolls[oldRolls.length - 1]
        if (latestRoll && latestOldRoll && latestOldRoll.id !== latestRoll.id && inLastTenSeconds(latestRoll.date)) {
          void onNewLogItem(latestRoll)
        }
        return newRolls
      })
    })
  }, [])

  // stay scrolled to the bottom
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999999999 })
  }, [rolls])

  return (
    <div className={styles.Game}>
      <div className={styles.heading}>
        <a href="#/">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Icon icon={chevronLeft} size={28} />
        </a>
        <h1 className={styles.title}>{title}</h1>
        <a href={`#/game-settings/${gameId}`} className={styles.settingsButton} title="Game Settings">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Icon icon={gears} size={28} />
        </a>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          {/*<Canvas items={rolls.filter((item): item is Paint => item.kind === 'Paint')} gdoc={gdoc} />*/}
        </div>
        <div className={styles.right}>
          <div ref={scrollRef} className={styles.log}>
            {!rollsLoaded ? (
              <p>Loading...</p>
            ) : rolls.length ? (
              <div className={styles.rolls}>
                {rolls.map((r, i) => (
                  <article key={`roll_${r.id}`}>
                    {r.kind === 'Message' ? (
                      <RollMessage result={r} />
                    ) : r.kind === 'Roll' ? (
                      <RollLogItem result={r} isLast={i === rolls.length - 1} />
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p>Make your first roll!</p>
            )}
          </div>
          <nav className={styles.tabs}>
            <button className={mode === 'Roll' ? styles.tabOn : undefined} onClick={setMode('Roll')}>
              Roll
            </button>
            <button className={mode === 'Message' ? styles.tabOn : undefined} onClick={setMode('Message')}>
              Message
            </button>
          </nav>
          {mode === 'Roll' ? <RollForm state={state} gdoc={gdoc} uid={uid} /> : <MessageForm gdoc={gdoc} />}
        </div>
      </div>
    </div>
  )
}
