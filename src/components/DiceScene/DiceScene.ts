import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { div } from '../../util'
import Dice, { DiceParams } from './Dice'
import { DiceRenderer } from './DiceRenderer'

interface DiceSceneProps {
  onDiceRollComplete: DiceParams['onRoll']
}

export interface DiceSceneRef {
  addDie: (color: number, id?: string) => void
  removeDie: (id: string) => void
  enable: () => void
  disable: () => void
  reset: () => unknown
  enabled: boolean
}

const DiceScene = forwardRef<DiceSceneRef, DiceSceneProps>(({ onDiceRollComplete }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const diceRef = useRef<Dice | null>(null)
  useEffect(() => {
    if (!mountRef.current) return
    const { onPointerDown, onPointerMove, onResize, onPointerUp, dice } = new DiceRenderer(
      mountRef.current,
      onDiceRollComplete,
      false,
    )
    diceRef.current = dice
    const onContextMenu = (e: MouseEvent) => e.preventDefault()
    mountRef.current.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    mountRef.current.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      mountRef.current?.removeEventListener('pointerdown', onPointerDown)
      mountRef.current?.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    addDie(color: number, id?: string) {
      diceRef.current?.addDie(color, id)
    },
    removeDie(id) {
      diceRef.current?.removeDie(id)
    },
    disable() {
      diceRef.current?.disable()
    },
    enable() {
      diceRef.current?.enable()
    },
    reset() {
      diceRef.current?.reset()
    },
    enabled: false,
  }))

  return div({ ref: mountRef, style: { width: '100%', height: '100%', overflow: 'hidden', touchAction: 'none' } }, null)
})

export default DiceScene
