import { Acc, append, index, removeAt } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { important } from 'csx'
import { reject } from 'ramda'
import { forwardRef, MutableRefObject } from 'react'
import { classes, keyframes, style, stylesheet } from 'typestyle'
import { colorNameFromHex, DieColor, dieColors, DieColorType, DieResult, DieType } from '../Models/Die'
import { playAddSound } from '../sounds'
import { e, div } from '../util'
import { nextColor } from '../Views/Game/Die'
import { DiceSelection } from './DiceSelection'
import DiceScene, { DiceSceneRef } from './DiceScene/DiceScene'

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
  color: DieColorType
  id?: string
}

export type DicePool$ = {
  /** @deprecated */
  pool: Rollable[]
  sceneLoaded: boolean
  enabled: boolean
}

export const init_DicePool$ = (): DicePool$ => ({
  pool: [],
  sceneLoaded: false,
  enabled: false,
})

export const removeDie = removeAt

export const removeDiceById = (id: string) => reject((r: Rollable) => r.id === id)

export const addDie =
  (type: DieType, color: DieColorType, id?: string) =>
  (state: DicePool$): DicePool$ => {
    void playAddSound()
    return Acc<DicePool$>().prop('pool').mod(append<Rollable>({ type, color, id }))(state)
  }

export const addDice =
  (dice: Rollable[]) =>
  (state: DicePool$): DicePool$ => {
    void playAddSound()
    return Acc<DicePool$>()
      .prop('pool')
      .mod((pool) => pool.concat(dice))(state)
  }

export const changeColor = (idx: number) => Acc(index<Rollable>(idx)).prop('color').mod(nextColor)

export const DicePool = forwardRef<
  DiceSceneRef,
  {
    state: FunState<DicePool$>
    sendRoll: (results: DieResult[]) => unknown
    disabled: boolean
    disableRemove?: boolean
    disableAdd?: boolean
  }
>(({ sendRoll, disableAdd = false, state }, diceSceneRef) => {
  const addDie = (color: DieColorType) => {
    ;(diceSceneRef as MutableRefObject<DiceSceneRef>)?.current.addDie(dieColors[color])
    ;(diceSceneRef as MutableRefObject<DiceSceneRef>)?.current.removeDie('zero')
    ;(diceSceneRef as MutableRefObject<DiceSceneRef>)?.current.removeDie('zero2')
  }
  const add0Dice = () => {
    ;(diceSceneRef as MutableRefObject<DiceSceneRef>)?.current.reset()
    ;(diceSceneRef as MutableRefObject<DiceSceneRef>)?.current.addDie(dieColors.black, 'zero')
    ;(diceSceneRef as MutableRefObject<DiceSceneRef>)?.current.addDie(dieColors.black, 'zero2')
  }
  const reset = () => {
    ;(diceSceneRef as MutableRefObject<DiceSceneRef>)?.current.reset()
  }
  return div({ className: styles.DicePool }, [
    !disableAdd &&
      div(
        { key: 'diceSelection', className: style({ display: 'grid', padding: 4, borderBottom: '2px solid #554889' }) },
        e(DiceSelection, { key: 'dice', addDie, add0Dice, reset }),
      ),
    div(
      { key: 'diceBox', className: classes(styles.diceBox, disableAdd && styles.roundTop) },
      e(DiceScene, {
        key: 'diceScene',
        ref: diceSceneRef,
        dicePool$: state,
        onDiceRollComplete: (results) => {
          sendRoll(
            results.map(({ value, color }): DieResult => ({ dieColor: colorNameFromHex(color), dieType: 'd6', value })),
          )
        },
      }),
    ),
  ])
})