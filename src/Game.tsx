import React, { FC, useEffect, useLayoutEffect, useRef } from 'react'
import useFunState, { merge, not } from 'fun-state'
import diceSprite from './dice.png'
import { classes, style, stylesheet } from 'typestyle'
import * as O from 'fp-ts/lib/Option'
import { range, trim } from 'ramda'
import Icon from 'react-icons-kit'
import firebase from 'firebase/app'
import debounce from 'lodash.debounce'
import { gears } from 'react-icons-kit/fa/gears'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { GameState, GameView, initialGameState, RollResult } from './GameModel'
import { useDoc } from './useDoc'
import { RollLog } from './RollLog'

const noop = (): void => {}

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
    width: '100vw',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    background: 'transparent',
    verticalAlign: 'bottom',
    color: '#fff',
    fontSize: 30,
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
    appearance: 'none',
    border: 'none',
    padding: 10,
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
  },
  settings: {
    border: '1px solid #aaa',
    background: '#111',
    borderWidth: '1px 0',
    padding: '0 35px 35px',
    flex: 1,
    display: 'grid',
    gridGap: 10,

    alignContent: 'start',
  },
  log: {
    border: '1px solid #aaa',
    background: '#111',
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
    gridArea: 'dice',
  },
  dieButton: {
    marginRight: 2,
    cursor: 'pointer',
    backgroundImage: `url(${diceSprite})`,
    appearance: 'none',
    opacity: 0.5,
    width: 50,
    height: 50,
    backgroundClip: 'padding-box',
    backgroundSize: '295.5px 50px',
    backgroundColor: 'transparent',
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

const saveEffectOptions = debounce((gdoc: firebase.firestore.DocumentReference, value: string): void => {
  if (gdoc) gdoc.set({ effectOptions: value }, { merge: true }).catch(() => alert('save failed'))
}, 2000)
const savePositionOptions = debounce((gdoc: firebase.firestore.DocumentReference, value: string): void => {
  if (gdoc) gdoc.set({ positionOptions: value }, { merge: true }).catch(() => alert('save failed'))
}, 2000)

const saveRollTypeOptions = debounce((gdoc: firebase.firestore.DocumentReference, value: string): void => {
  if (gdoc) gdoc.set({ rollTypeOptions: value }, { merge: true }).catch(() => alert('save failed'))
}, 2000)

const deleteGame = (gdoc: firebase.firestore.DocumentReference) => (): void => {
  if (gdoc && window.confirm('Are you sure you want to delete this game permanently?')) {
    gdoc.delete().catch(() => alert('delete failed'))
    document.location.hash = '#'
  }
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
        .catch(() => alert('failed to load game'))
      gdoc.onSnapshot((ss) => {
        const data = ss.data()
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
    settingsOpen,
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
        .catch(() => alert('failed to add roll'))
      merge(state)({ note: '', rollType: '', position: '', effect: '' })
    }
  }

  const onTitleChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    if (gdoc) gdoc.set({ title: value }, { merge: true }).catch(() => alert('failed to save'))
  }

  const onPositionOptionsChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    state.prop('positionOptions').set(value)
    if (gdoc) savePositionOptions(gdoc, value)
  }
  const onEffectOptionsChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    state.prop('effectOptions').set(value)
    if (gdoc) saveEffectOptions(gdoc, value)
  }
  const onRollTypeOptionsChange: React.ChangeEventHandler<HTMLTextAreaElement> = ({ currentTarget: { value } }) => {
    state.prop('rollTypeOptions').set(value)
    if (gdoc) saveRollTypeOptions(gdoc, value)
  }

  const toggleSettings = (): void => state.prop('settingsOpen').mod(not)
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
        <input className={styles.title} type="text" aria-label="Game Name" value={title} onChange={onTitleChange} />
        <button className={styles.settingsButton} onClick={toggleSettings} title="Game Settings">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Icon icon={gears} size={28} />
        </button>
      </div>
      {settingsOpen && (
        <div className={styles.settings}>
          <h2>Game Settings</h2>
          <label>
            {' '}
            Position Options
            <br />
            <input type="text" value={positionOptions} onChange={onPositionOptionsChange} width={300} />
          </label>
          <label>
            {' '}
            Effect Options
            <br />
            <input type="text" value={effectOptions} onChange={onEffectOptionsChange} width={200} />
          </label>
          <label>
            {' '}
            Role Type Options
            <br />
            <textarea value={rollTypeOptions} onChange={onRollTypeOptionsChange} />
          </label>

          <button onClick={gdoc ? deleteGame(gdoc) : noop}>Delete Game</button>
        </div>
      )}
      {!settingsOpen && (
        <>
          <div ref={scrollRef} className={styles.log}>
            {rolls.length ? (
              <ul className={styles.rolls}>
                {rolls.map((r) => (
                  <li key={`roll_${r.id}`}>
                    <RollLog result={r} />
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
                gridTemplateAreas: '"rollType position effect" "note note note" "dice dice player"',
                gridGap: 10,
              })}>
              <label className={style({ gridArea: 'rollType' })}>
                Roll Type <br />
                <input
                  type="text"
                  name="rolltype"
                  list="rollTypeList"
                  value={rollType}
                  onChange={pipeVal(state.prop('rollType').set)}
                />
                <DataList id="rollTypeList" values={rollTypeOptions} />
              </label>
              <label className={style({ gridArea: 'position' })}>
                Position <br />
                <input
                  type="text"
                  name="position"
                  list="positionList"
                  value={position}
                  onChange={pipeVal(state.prop('position').set)}
                />
                <DataList id="positionList" values={positionOptions} />
              </label>
              <label className={style({ gridArea: 'effect' })}>
                Effect <br />
                <input
                  type="text"
                  name="effect"
                  list="effectList"
                  value={effect}
                  onChange={pipeVal(state.prop('effect').set)}
                />
                <DataList id="effectList" values={effectOptions} />
              </label>
              <label className={style({ gridArea: 'player' })}>
                Player <br />
                <input type="text" name="username" value={username} onChange={pipeVal(state.prop('username').set)} />
              </label>
              <label className={style({ gridArea: 'note' })}>
                <div>{'Note '}</div>
                <textarea
                  className={style({ width: '100%', height: 60 })}
                  onChange={pipeVal(state.prop('note').set)}
                  value={note}
                />
              </label>
              <div className={styles.diceButtons} onMouseLeave={(): void => state.prop('hoveredDieButton').set(-1)}>
                {range(0, 7).map((n: number) => (
                  <button
                    key={`btn${n}`}
                    title={`Roll ${n} ${n === 1 ? 'die' : 'dice'}`}
                    onMouseEnter={(): void => state.prop('hoveredDieButton').set(n)}
                    className={classes(
                      styles.dieButton,
                      style({
                        backgroundPositionX: -49 * (n === 0 ? 0 : n - 1),
                        ...(n === 0
                          ? {
                              filter: 'invert(100%)',
                            }
                          : {}),
                      }),
                      hoveredDieButton >= n ? styles.dieButtonOn : undefined,
                    )}
                    type="button"
                    onClick={roll(n)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  )
}
