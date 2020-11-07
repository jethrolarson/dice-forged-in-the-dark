import React, { FC, useEffect, useLayoutEffect, useRef } from 'react'
import useFunState, { merge } from 'fun-state'
import { stylesheet } from 'typestyle'
import * as O from 'fp-ts/lib/Option'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { gears } from 'react-icons-kit/fa/gears'
import { GameState, GameView, initialGameState, RollResult } from './GameModel'
import { useDoc } from './useDoc'
import { borderColor } from './colors'
import { RollLog } from './RollLog'
import { RollForm } from './RollForm'
import { MessageForm } from './MessageForm'
import { important } from 'csx'
import { RollMessage } from './RollMessage'

const styles = stylesheet({
  Game: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: 375,
    margin: '0 auto',
    background: 'radial-gradient(hsl(170, 80%, 15%), hsl(200, 60%, 8%))',
    backgroundRepeat: 'no-repeat',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
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
    border: `1px solid ${borderColor}`,
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

export const gamePath = (path: string): O.Option<GameView> => {
  const m = /^\/game\/([^/?]+)/.exec(path)
  return m && m.length > 0 ? O.some({ kind: 'GameView', id: m[1] }) : O.none
}

export const Game: FC<{ gameId: string }> = ({ gameId }) => {
  const gdoc = useDoc(`games/${gameId}`)
  const state = useFunState<GameState>({ ...initialGameState })
  useEffect(() => {
    if (gdoc) {
      gdoc
        .get()
        .then((snapshot) => {
          if (!snapshot.exists) {
            document.location.hash = '#not_found'
          }
          const gameIds = new Set(JSON.parse(localStorage.getItem('games') ?? '[]'))
          gameIds.add(gameId)
          localStorage.setItem('games', JSON.stringify(Array.from(gameIds)))
        })
        .catch((e) => {
          console.error(e)
          alert('failed to load game')
        })
      gdoc.onSnapshot((ss) => {
        const data = ss.data()
        window.document.title =
          (data && Reflect.has(data, 'title') && typeof data.title === 'string' ? data.title : 'Untitled') +
          ' - Dice Forged in the Dark'
        data && merge(state)(data)
      })
      return gdoc
        .collection('rolls')
        .orderBy('date')
        .onSnapshot((snapshot) =>
          state.prop('rolls').set(snapshot.docs.map((d) => ({ ...(d.data() as RollResult), id: d.id }))),
        )
    }
    return undefined
  }, [gdoc])
  const { rolls, title, mode } = state.get()
  const setMode = (mode: GameState['mode']) => (): void => state.prop('mode').set(mode)
  const scrollRef = useRef<HTMLDivElement>(null)
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
      <div ref={scrollRef} className={styles.log}>
        {rolls.length ? (
          <ul className={styles.rolls}>
            {rolls.map((r, i) => (
              <li key={`roll_${r.id}`}>
                {r.kind === 'Message' ? (
                  <RollMessage result={r} />
                ) : (
                  <RollLog result={r} isLast={i === rolls.length - 1} />
                )}
              </li>
            ))}
          </ul>
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
      {mode === 'Roll' ? <RollForm state={state} gdoc={gdoc} /> : <MessageForm gdoc={gdoc} />}
    </div>
  )
}
