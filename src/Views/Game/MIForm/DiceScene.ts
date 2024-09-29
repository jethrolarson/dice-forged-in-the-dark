import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { div } from '../../../util'
import Dice from './Dice'
import { DiceRenderer } from './DiceRenderer'

interface DiceSceneProps {
  onDiceRollComplete: (diceResults: number[]) => void
}

export type DiceSceneRef = { addDie: (id?: string) => void; removeDie: (id: string) => void }

const DiceScene = forwardRef<DiceSceneRef, DiceSceneProps>(({ onDiceRollComplete }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const diceRef = useRef<Dice | null>(null)
  useEffect(() => {
    if (!mountRef.current) return
    const { onPointerDown, onPointerMove, onResize, onPointerUp, dice } = new DiceRenderer(
      mountRef.current,
      onDiceRollComplete,
    )
    diceRef.current = dice
    const onContextMenu = (e: MouseEvent) => e.preventDefault()
    mountRef.current.addEventListener('pointerdown', onPointerDown)
    mountRef.current.addEventListener('pointerup', onPointerUp)
    mountRef.current.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerDown)
      mountRef.current?.removeEventListener('pointerdown', onPointerDown)
      mountRef.current?.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    addDie(id?: string) {
      diceRef.current?.addDie(id)
    },
    removeDie(id) {
      diceRef.current?.removeDie(id)
    },
  }))

  return div({ ref: mountRef, style: { width: '100%', height: '100%', overflow: 'hidden' } }, null)
})

export default DiceScene
