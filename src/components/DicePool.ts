import { Acc, append, index, removeAt } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { important } from 'csx'
import { reject, repeat } from 'ramda'
import { FC } from 'react'
import { classes, keyframes, style, stylesheet } from 'typestyle'
import { DieColor, DieResult, DieType } from '../Models/Die'
import { playAddSound } from '../sounds'
import { e, div, button } from '../util'
import { Die, nextColor } from '../Views/Game/Die'
import { DiceSelection } from './DiceSelection'
import DiceScene from '../Views/Game/MIForm/DiceScene'

const spin = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
})

const styles = stylesheet({
  dieButton: {
    cursor: 'grab',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    background: 'transparent',
    backgroundColor: important('transparent'),
    border: 'none',
    animationName: spin,
    animationDuration: '1500ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    $nest: {
      '&:hover': {
        animationDuration: '5000ms',
      },
    },
  },
  DicePool: {
    border: '2px solid var(--border-color)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  diceBox: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    background: 'var(--bg-dice)',
    flexGrow: 1,
    gap: 20,
    minHeight: 400,
    userSelect: 'none',
  },
  rollButton: {
    fontWeight: 'bold',
    borderWidth: '2px 0 0',
    borderRadius: '0 0 5px 5px',
    background: 'var(--bg-button-selected)',
  },
  roundTop: {
    borderRadius: '6px 6px 0 0',
  },
})

export interface Rollable {
  type: DieType
  color: keyof typeof DieColor
  id?: string
}

export type DicePoolState = Rollable[]

export const removeDie = removeAt

export const removeDiceById = (id: string) => reject((r: Rollable) => r.id === id)

export const addDie =
  (type: DieType, color: keyof typeof DieColor, id?: string) =>
  (state: DicePoolState): DicePoolState => {
    void playAddSound()
    return append<Rollable>({ type, color, id })(state)
  }

export const addDice =
  (dice: Rollable[]) =>
  (state: DicePoolState): DicePoolState => {
    void playAddSound()
    return state.concat(dice)
  }

const idEquals =
  (id: string) =>
  (r: Rollable): boolean =>
    r.id === id

export const setDiceById =
  (quantity: number, type: DieType, color: keyof typeof DieColor, id: string) =>
  (state: DicePoolState): DicePoolState => {
    const withoutOld = reject(idEquals(id), state)
    if (withoutOld.length + quantity !== state.length) {
      void playAddSound()
    }
    return withoutOld.concat(repeat({ type, color, id }, quantity))
  }

export const changeColor = (idx: number) => Acc(index<Rollable>(idx)).prop('color').mod(nextColor)

export const DicePool: FC<{
  state: FunState<DicePoolState>
  sendRoll: (results: DieResult[]) => unknown
  disabled: boolean
  disableRemove?: boolean
  disableAdd?: boolean
}> = ({ state, sendRoll, disableAdd = false }) => {
  return div({ className: styles.DicePool }, [
    !disableAdd &&
      div(
        { key: 'diceSelevtion', className: style({ display: 'grid', padding: 4, borderBottom: '2px solid #554889' }) },
        [e(DiceSelection, { key: 'dice', $: state })],
      ),
    div(
      { key: 'diceBox', className: classes(styles.diceBox, disableAdd && styles.roundTop) },
      e(DiceScene, {
        key: 'diceScene',
        onDiceRollComplete: () => undefined,
      }),
    ),
  ])
}

const serializePool = (dp: DicePoolState): string =>
  Object.entries(
    dp.reduce<{ d6: number }>(
      (acc, d) => {
        if (d.type === 'd6') {
          acc.d6 += 1
        }
        return acc
      },
      { d6: 0 },
    ),
  )
    .map(([k, v]) => `${v}${k}`)
    .join('')
