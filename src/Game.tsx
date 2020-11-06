import React, { FC, useEffect, useLayoutEffect, useRef } from 'react'
import useFunState, { merge } from 'fun-state'
import { classes, style, stylesheet } from 'typestyle'
import * as O from 'fp-ts/lib/Option'
import { range, trim } from 'ramda'
import Icon from 'react-icons-kit'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { gears } from 'react-icons-kit/fa/gears'
import { GameState, GameView, initialGameState, RollResult } from './GameModel'
import { useDoc } from './useDoc'
import { borderColor } from './colors'
import { RollLog } from './RollLog'
import { Die } from './Die'
import { color, important } from 'csx'

const getRollSound = ((): (() => Promise<HTMLAudioElement>) => {
  let loadingAudio = false
  let diceAudioEl: HTMLAudioElement
  return (): Promise<HTMLAudioElement> => {
    diceAudioEl = new Audio('dice_roll.mp3')
    return new Promise<HTMLAudioElement>((resolve) => {
      if (!loadingAudio) {
        loadingAudio = true
        diceAudioEl.addEventListener('canplaythrough', () => {
          resolve(diceAudioEl)
        })
      }
      return resolve(diceAudioEl)
    })
  }
})()

const DataList: FC<{ id: string; values: string }> = ({ id, values }) => (
  <datalist id={id}>
    {values
      .split(',')
      .map(trim)
      .map((v) => {
        const [val, label] = v.split('|')
        return <option key={v} value={val} children={label} />
      })}
  </datalist>
)

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
  form: {
    padding: 10,
  },
  diceButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gridArea: 'dice',
  },
  dieButton: {
    cursor: 'pointer',
    appearance: 'none',
    opacity: 0.6,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
  },
  dieButtonOn: {
    opacity: 1,
    transition: 'opacity 0.2s',
  },
})

export const gamePath = (path: string): O.Option<GameView> => {
  const m = /^\/game\/([^/?]+)/.exec(path)
  return m && m.length > 0 ? O.some({ kind: 'GameView', id: m[1] }) : O.none
}

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

const pipeVal = (f: (value: string) => unknown) => ({
  currentTarget: { value },
}: React.FormEvent<FormElement>): unknown => f(value)

const rollDie = (): number => Math.floor(Math.random() * 6) + 1

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
  const {
    rolls,
    note,
    position,
    effect,
    username,
    title,
    positionOptions,
    effectOptions,
    rollType,
    rollTypeOptions,
    hoveredDieButton,
  } = state.get()
  const scrollRef = useRef<HTMLDivElement>(null)
  // stay scrolled to the bottom
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999999999 })
  }, [rolls])

  const roll = (n: number) => (): void => {
    if (gdoc) {
      gdoc
        .collection('rolls')
        .add({
          note,
          rollType,
          position,
          effect,
          username,
          isZero: n === 0,
          results: range(0, n === 0 ? 2 : n).map(rollDie),
          date: Date.now(),
        })
        .catch((e) => {
          console.error(e)
          alert('failed to add roll')
        })
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      getRollSound().then((audio) => audio.play())
      merge(state)({ note: '', rollType: '', position: '', effect: '' })
    }
  }
  return (
    <form
      className={styles.Game}
      onSubmit={(e): void => {
        e.preventDefault()
      }}>
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
                <RollLog result={r} isLast={i === rolls.length - 1} />
              </li>
            ))}
          </ul>
        ) : (
          <p>Make your first roll!</p>
        )}
      </div>
      <div className={styles.form}>
        <div
          className={style({
            display: 'grid',
            gridTemplateAreas: '"rollType position effect" "note note note" "player player player" "dice dice dice"',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridGap: 10,
          })}>
          <label className={style({ gridArea: 'rollType' })}>
            <input
              placeholder="Roll Type"
              type="text"
              name="rolltype"
              list="rollTypeList"
              value={rollType}
              onChange={pipeVal(state.prop('rollType').set)}
            />
            <DataList id="rollTypeList" values={rollTypeOptions} />
          </label>
          <label className={style({ gridArea: 'position' })}>
            <input
              type="text"
              name="position"
              list="positionList"
              placeholder="Position"
              value={position}
              onChange={pipeVal(state.prop('position').set)}
            />
            <DataList id="positionList" values={positionOptions} />
          </label>
          <label className={style({ gridArea: 'effect' })}>
            <input
              type="text"
              name="effect"
              list="effectList"
              placeholder="Effect"
              value={effect}
              onChange={pipeVal(state.prop('effect').set)}
            />
            <DataList id="effectList" values={effectOptions} />
          </label>
          <label className={style({ gridArea: 'player' })}>
            <input
              placeholder="Character"
              type="text"
              name="username"
              value={username}
              onChange={pipeVal(state.prop('username').set)}
            />
          </label>
          <label className={style({ gridArea: 'note' })}>
            <textarea
              placeholder="Note"
              className={style({ width: '100%', height: 44, display: 'block', maxHeight: 200, resize: 'vertical' })}
              onChange={pipeVal(state.prop('note').set)}
              value={note}
            />
          </label>
          <div className={styles.diceButtons} onMouseLeave={(): void => state.prop('hoveredDieButton').set(-1)}>
            {range(0, 7).map((n: number) => (
              <button
                key={`btn${n}`}
                disabled={rollType === ''}
                title={`Roll ${n} ${n === 1 ? 'die' : 'dice'}`}
                onMouseEnter={(): void => state.prop('hoveredDieButton').set(n)}
                className={classes(styles.dieButton, hoveredDieButton >= n ? styles.dieButtonOn : undefined)}
                type="button"
                onClick={roll(n)}>
                <Die
                  value={n === 0 ? 1 : n}
                  dieColor={color(n === 0 ? '#000' : borderColor)}
                  border={n === 0}
                  glow={hoveredDieButton === n}
                  pulse={hoveredDieButton === n}
                  dotColor={color(n === 0 ? borderColor : '#000')}
                  size={44}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  )
}
