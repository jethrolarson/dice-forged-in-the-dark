import { Acc, append, index } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { important } from 'csx'
import { reject } from 'ramda'
import { keyframes, style, stylesheet } from 'typestyle'
import { colorNameFromHex, dieColors, DieColorType, DieResult, DieType } from '../Models/Die'
import { playAddSound } from '../sounds'
import { nextColor } from '../Views/Game/Die'
import { DiceScene, DiceSceneApi } from './DiceScene/DiceScene'
import { DiceSelection } from './DiceSelection'
import { bindClass } from '../util'

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

export interface DicePool$ {
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

/** @deprecated */
export const removeDiceById = (id: string) => reject((r: Rollable) => r.id === id)

/** @deprecated */
export const addDie =
  (type: DieType, color: DieColorType, id?: string) =>
  (state: DicePool$): DicePool$ => {
    void playAddSound()
    return Acc<DicePool$>().prop('pool').mod(append<Rollable>({ type, color, id }))(state)
  }

/** @deprecated */
export const addDice =
  (dice: Rollable[]) =>
  (state: DicePool$): DicePool$ => {
    void playAddSound()
    return Acc<DicePool$>()
      .prop('pool')
      .mod((pool) => pool.concat(dice))(state)
  }

export const changeColor = (idx: number) => Acc(index<Rollable>(idx)).prop('color').mod(nextColor)

type DicePoolElement = HTMLDivElement & { $api: DiceSceneApi }

interface DicePoolProps {
  sendRoll: (results: DieResult[]) => unknown
  disableAdd$: FunState<boolean>
}

export const DicePool: Component<DicePoolProps, DicePoolElement> = (signal, { sendRoll, disableAdd$ }) => {
  const diceScene = DiceScene(signal, {
    onDiceRollComplete: (results) => {
      sendRoll(
        results.map(({ value, color }): DieResult => ({ dieColor: colorNameFromHex(color), dieType: 'd6', value })),
      )
    },
  })
  const diceApi = diceScene.$api
  const addDie = (color: DieColorType) => {
    diceApi.addDie(dieColors[color])
    diceApi.removeDie('zero')
    diceApi.removeDie('zero2')
  }
  const add0Dice = () => {
    diceApi.reset()
    diceApi.addDie(dieColors.black, 'zero')
    diceApi.addDie(dieColors.black, 'zero2')
  }
  const reset = () => {
    diceApi.reset()
  }

  const container = h('div', { className: styles.DicePool }, [
    h(
      'div',
      { key: 'diceSelection', className: style({ display: 'grid', padding: 4, borderBottom: '2px solid #554889' }) },
      DiceSelection(signal, { addDie, add0Dice, reset }),
    ),
    bindClass(styles.roundTop, disableAdd$, signal)(h('div', { className: styles.diceBox }, diceScene)),
  ])

  // Cast to augmented element type and add the API
  const element = container as DicePoolElement
  element.$api = diceApi

  return element
}
