import { flow } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { useState, useCallback, useRef } from 'react'
import { classes, keyframes, stylesheet } from 'typestyle'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { DieColor } from '../../../Models/Die'
import { addDice, DicePoolState, removeDiceById } from './DicePool'

const textPulse = keyframes({
  from: {
    textShadow: ' 0 0 6px',
  },
})

const styles = stylesheet({
  popover: {
    position: 'absolute',
    width: '100%',
    display: 'grid',
    gap: 5,
    zIndex: 1,
    backgroundColor: '#061318',
    padding: 10,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  FactorSelect: { position: 'relative', display: 'flex', alignItems: 'center', gap: 10 },
  option: {
    display: 'block',
    width: '100%',
  },
  selected: {
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  },
  approachButton: {
    flexGrow: 1,
  },
  active: {
    color: DieColor.white,
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  },
})

export enum Factor {
  Disadvantaged = 'Disadvantaged',
  Even = 'Even',
  Dominant = 'Dominant',
}

export const factorDie = { color: 'white', type: 'd6', id: 'factor' } as const

export const FactorSelect = ({ $, dicePool$ }: { $: FunState<Factor>; dicePool$: FunState<DicePoolState> }) => {
  const factor = $.get()
  const [open, setOpen] = useState(false)
  const hide = useCallback(() => setOpen(false), [])
  const popoverRef = useRef<HTMLDivElement>(null)
  useClickOutside(popoverRef, hide)
  const _addDice = flow(addDice, dicePool$.mod)
  const _removeDice = flow(removeDiceById, dicePool$.mod)
  const isActive = factor !== Factor.Disadvantaged
  const onSelect = (val: string) => {
    hide()
    $.set(val as Factor)
    switch (val) {
      case Factor.Even:
        _removeDice('factor')
        _addDice([factorDie])
        break
      case Factor.Dominant:
        _removeDice('factor')
        _addDice([factorDie, factorDie])
        break
      default:
        _removeDice('factor')
    }
  }
  return (
    <div>
      <div className={styles.FactorSelect}>
        <label className={isActive ? styles.active : ''}>Factor</label>
        <button
          className={classes(styles.approachButton, isActive && styles.active)}
          onClick={setOpen.bind(null, true)}>
          {factor}
        </button>
        {open && (
          <div className={styles.popover} ref={popoverRef}>
            {[Factor.Disadvantaged, Factor.Even, Factor.Dominant].map((value) => {
              return (
                <button
                  key={value}
                  onClick={onSelect.bind(null, value)}
                  value={value}
                  type="button"
                  className={classes(styles.option, factor === value && styles.selected)}>
                  {value}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
