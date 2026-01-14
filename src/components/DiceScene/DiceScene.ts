import { h, on } from '@fun-land/fun-web'
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

export const DiceScene = (
  signal: AbortSignal,
  { onDiceRollComplete }: DiceSceneProps,
): HTMLDivElement & { $api: DiceSceneApi } => {
  const el: HTMLDivElement & { $api?: DiceSceneApi } = h('div', {
    style: { width: '100%', height: '100%', overflow: 'hidden', touchAction: 'none' },
  })
  const { onPointerDown, onPointerMove, onResize, onPointerUp, dice } = new DiceRenderer(el, onDiceRollComplete, false)

  const onContextMenu = (e: MouseEvent) => e.preventDefault()
  on(el, 'pointerdown', onPointerDown, signal)
  window.addEventListener('pointerup', onPointerUp, { signal })
  on(el, 'contextmenu', onContextMenu, signal)
  window.addEventListener('pointermove', onPointerMove, { signal })
  window.addEventListener('resize', onResize, { signal })

  el.$api = {
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

  return el as HTMLDivElement & { $api: DiceSceneApi }
}
