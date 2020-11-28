import React, { FC } from 'react'
import useFunState, { FunState, merge } from 'fun-state'
import { classes, style, stylesheet } from 'typestyle'
import { range, trim } from 'ramda'
import { color, important } from 'csx'
import { Die } from './Die'
import { borderColor } from './colors'
import { GameState } from './GameModel'
import { DocRef } from './useDoc'
import { pipeVal } from './common'

const styles = stylesheet({
  form: {
    padding: 10,
  },
  formGrid: {
    display: 'grid',
    gridTemplateAreas: '"rollType position effect" "note note note" "player player player" "dice dice dice"',
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
  position: string
  effect: string
  username: string
  hoveredDieButton: number
}

export const RollForm: FC<{ state: FunState<GameState>; gdoc: DocRef | null }> = ({ state, gdoc }) => {
  const { positionOptions, effectOptions, rollTypeOptions } = state.get()

  const s = useFunState<RollFormState>({
    note: '',
    rollType: '',
    position: '',
    effect: '',
    username: '',
    hoveredDieButton: -1,
  })
  const { note, rollType, position, effect, username, hoveredDieButton } = s.get()

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
          kind: 'Roll',
        })
        .catch((e) => {
          console.error(e)
          alert('failed to add roll')
        })
      merge(s)({ note: '', rollType: '', position: '', effect: '' })
    }
  }
  return (
    <form
      className={styles.form}
      onSubmit={(e): void => {
        e.preventDefault()
      }}>
      <div className={styles.formGrid}>
        <label className={style({ gridArea: 'rollType' })}>
          <input
            placeholder="Roll Type"
            type="text"
            name="rolltype"
            list="rollTypeList"
            value={rollType}
            onChange={pipeVal(s.prop('rollType').set)}
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
            onChange={pipeVal(s.prop('position').set)}
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
            onChange={pipeVal(s.prop('effect').set)}
          />
          <DataList id="effectList" values={effectOptions} />
        </label>
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
