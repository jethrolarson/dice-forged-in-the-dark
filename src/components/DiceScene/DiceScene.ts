import { Component, h, on, enhance } from '@fun-land/fun-web'
import { DiceParams } from './Dice'
import { DiceRenderer } from './DiceRenderer'

interface DiceSceneProps {
  onDiceRollComplete: DiceParams['onRoll']
}

export interface DiceSceneApi {
  addDie: (color: number, id?: string) => void
  removeDie: (id: string) => void
  enable: () => void
  disable: () => void
  reset: () => unknown
  enabled: boolean
}

type DiceSceneElement = HTMLDivElement & { $api: DiceSceneApi }

export const DiceScene: Component<DiceSceneProps, DiceSceneElement> = (signal, { onDiceRollComplete }) => {
  const el = h('div', {
    style: { width: '100%', height: '100%', overflow: 'hidden', touchAction: 'none' },
  })
  const { onPointerDown, onPointerMove, onResize, onPointerUp, dice } = new DiceRenderer(el, onDiceRollComplete, false)
  const onContextMenu = (e: MouseEvent) => e.preventDefault()
  enhance(el, on('pointerdown', onPointerDown, signal), on('contextmenu', onContextMenu, signal))

  window.addEventListener('pointerup', onPointerUp, { signal })
  window.addEventListener('pointermove', onPointerMove, { signal })
  window.addEventListener('resize', onResize, { signal })

  // Cast to augmented element type and add the API
  const element = el as DiceSceneElement
  element.$api = {
    addDie(color: number, id?: string) {
      dice.addDie(color, id)
    },
    removeDie(id) {
      dice.removeDie(id)
    },
    disable() {
      dice.disable()
    },
    enable() {
      dice.enable()
    },
    reset() {
      dice.reset()
    },
    enabled: false,
  }

  return element
}
