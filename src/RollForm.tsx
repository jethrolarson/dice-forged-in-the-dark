import React, { FC } from 'react'
import useFunState, { FunState, merge } from 'fun-state'
import { classes, style, stylesheet } from 'typestyle'
import { range, trim } from 'ramda'
import { color, important } from 'csx'
import { Die } from './Die'
import { borderColor } from './colors'
import { GameState } from './Models/GameModel'
import { DocRef } from './useDoc'
import { pipeVal } from './common'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { index } from 'accessor-ts'
import Icon from 'react-icons-kit'

const styles = stylesheet({
  form: {
    padding: 10,
  },
  formGrid: {
    display: 'grid',
    gridTemplateAreas: '"roll roll roll" "roll roll roll" "note note note" "player player player" "dice dice dice"',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 10,
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

const rollDie = (): number => Math.floor(Math.random() * 6) + 1

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

interface RollFormState {
  rollType: string
  note: string
  rollState: string[]
  username: string
  hoveredDieButton: number
}

export const RollForm: FC<{ state: FunState<GameState>; gdoc: DocRef | null }> = ({ state, gdoc }) => {
  const { rollConfig } = state.get()

  const s = useFunState<RollFormState>({
    note: '',
    rollState: ['', '', '', ''],
    rollType: '',
    username: '',
    hoveredDieButton: -1,
  })
  const { note, rollType, username, hoveredDieButton, rollState } = s.get()
  const reset = (): void => merge(s)({ note: '', rollType: '', rollState: ['', '', '', ''] })
  const roll = (n: number) => (): void => {
    if (gdoc) {
      gdoc
        .collection('rolls')
        .add({
          note,
          rollType,
          lines: rollState,
          username,
          isZero: n === 0,
          results: range(0, n === 0 ? 2 : n).map(rollDie),
          date: Date.now(),
          kind: 'Roll',
        })
        .catch((e) => {
          console.error(e)
          alert('failed to add roll')
        })
      reset()
    }
  }
  const currentConfig = rollConfig.rollTypes.find((rt) => rt.name === rollType)
  return (
    <form
      className={styles.form}
      onSubmit={(e): void => {
        e.preventDefault()
      }}>
      <div className={styles.formGrid}>
        {currentConfig ? (
          <>
            <h3 className={style({ gridColumn: '1/4' })}>
              <a
                href="#/"
                onClick={(e): void => {
                  e.preventDefault()
                  reset()
                }}>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                <Icon icon={chevronLeft} size={18} />
              </a>
              {currentConfig.name}
            </h3>
            {currentConfig.optionGroups.map((og, i) => (
              <label key={`optGroup${og.name}`}>
                <input
                  placeholder={og.name}
                  type="text"
                  name={og.name}
                  list={`list${i}`}
                  value={s.prop('rollState').focus(index(i)).get()}
                  onChange={pipeVal(s.prop('rollState').focus(index(i)).set)}
                />
                <DataList id={`list${i}`} values={og.rollOptions.join(',')} />
              </label>
            ))}
          </>
        ) : (
          rollConfig.rollTypes.map((rt) => (
            <button key={rt.name} onClick={(): void => s.prop('rollType').set(rt.name)}>
              {rt.name}{' '}
            </button>
          ))
        )}
        <label className={style({ gridArea: 'player' })}>
          <input
            placeholder="Character"
            type="text"
            name="username"
            value={username}
            onChange={pipeVal(s.prop('username').set)}
          />
        </label>
        <label className={style({ gridArea: 'note' })}>
          <textarea
            placeholder="Note"
            className={style({ width: '100%', height: 44, display: 'block', maxHeight: 200, resize: 'vertical' })}
            onChange={pipeVal(s.prop('note').set)}
            value={note}
          />
        </label>
        <div className={styles.diceButtons} onMouseLeave={(): void => s.prop('hoveredDieButton').set(-1)}>
          {range(0, 7).map((n: number) => (
            <button
              key={`btn${n}`}
              disabled={rollType === ''}
              title={`Roll ${n} ${n === 1 ? 'die' : 'dice'}`}
              onMouseEnter={(): void => s.prop('hoveredDieButton').set(n)}
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
    </form>
  )
}
