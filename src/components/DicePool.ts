import { Acc, append, index } from '@fun-land/accessor'
import { FunRead } from '@fun-land/fun-state'
import { Component, h, bindClass } from '@fun-land/fun-web'
import { reject } from 'ramda'
import { colorNameFromHex, dieColors, DieColorType, DieResult, DieType } from '../Models/Die'
import { playAddSound } from '../sounds'
import { nextColor } from '../Views/Game/Die'
import { DiceScene, DiceSceneApi } from './DiceScene/DiceScene'
import { DiceSelection } from './DiceSelection'
import { styles } from './DicePool.css'

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
  disableAdd$: FunRead<boolean>
  active$: FunRead<boolean>
}

export const DicePool: Component<DicePoolProps, DicePoolElement> = (signal, { sendRoll, disableAdd$, active$ }) => {
  let diceScene: ReturnType<typeof DiceScene> | null = null

  const placeholderApi: DiceSceneApi = {
    addDie: () => {
      /* No-op when inactive */
    },
    removeDie: () => {
      /* No-op when inactive */
    },
    enable: () => {
      /* No-op when inactive */
    },
    disable: () => {
      /* No-op when inactive */
    },
    reset: () => {
      /* No-op when inactive */
    },
    enabled: false,
  }

  const diceBox = h('div', { className: styles.diceBox })

  const container = h('div', { className: styles.DicePool }, [
    h(
      'div',
      { key: 'diceSelection', className: styles.diceSelection },
      DiceSelection(signal, {
        addDie: (color: DieColorType) => {
          element.$api.addDie(dieColors[color])
          element.$api.removeDie('zero')
          element.$api.removeDie('zero2')
        },
        add0Dice: () => {
          element.$api.reset()
          element.$api.addDie(dieColors.black, 'zero')
          element.$api.addDie(dieColors.black, 'zero2')
        },
        reset: () => {
          element.$api.reset()
        },
      }),
    ),
    bindClass(styles.roundTop, disableAdd$, signal)(diceBox),
  ])

  const element = container as DicePoolElement
  element.$api = placeholderApi

  const createScene = () => {
    const width = diceBox.clientWidth
    const height = diceBox.clientHeight
    if (width > 0 && height > 0) {
      diceScene = DiceScene(signal, {
        onDiceRollComplete: (results) => {
          sendRoll(
            results.map(({ value, color }): DieResult => ({ dieColor: colorNameFromHex(color), dieType: 'd6', value })),
          )
        },
        width,
        height,
      })
      element.$api = diceScene.$api
      return diceScene
    }
    return null
  }

  const waitForDimensions = (callback: (scene: HTMLElement) => void) => {
    const check = () => {
      const scene = createScene()
      if (scene) {
        callback(scene)
      } else {
        requestAnimationFrame(check)
      }
    }
    requestAnimationFrame(check)
  }

  active$.watch(signal, (active) => {
    if (active && !diceScene) {
      const scene = createScene()
      if (scene) {
        diceBox.appendChild(scene)
      } else {
        waitForDimensions((scene) => diceBox.appendChild(scene))
      }
    } else if (!active && diceScene) {
      element.$api.reset()
      diceBox.replaceChildren()
      diceScene = null
      element.$api = placeholderApi
    }
  })

  return element
}
