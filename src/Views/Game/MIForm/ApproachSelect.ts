import { FunState } from '@fun-land/fun-state'
import { useCallback, useEffect, useRef, useState } from 'react'
import { classes, keyframes, stylesheet } from 'typestyle'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { DieColor } from '../../../Models/Die'
import { label, e, div, button } from '../../../util'
import { DicePoolState, removeDiceById, setDiceById } from './DicePool'
import { Tier, TierSelect } from './TierSelect'

export interface Approach$ {
  approach: string
  tier: Tier
}

export const init_Approach$: Approach$ = {
  approach: '',
  tier: Tier.T0,
}

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
  active: {
    color: DieColor.purple,
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  },
  Approach: { position: 'relative', display: 'flex', alignItems: 'center' },
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
    color: 'hsl(169deg 50% 45%)',
  },
})

export const ApproachSelect = ({ $, dicePool$ }: { $: FunState<Approach$>; dicePool$: FunState<DicePoolState> }) => {
  const { approach, tier } = $.get()
  const [open, setOpen] = useState(false)
  const hide = useCallback(() => setOpen(false), [])
  const popoverRef = useRef<HTMLDivElement>(null)
  useClickOutside(popoverRef, hide)
  const isActive = !!approach && tier !== Tier.T0
  useEffect(() => {
    if (isActive) {
      dicePool$.mod(setDiceById(1, 'd6', 'purple', 'approach'))
    } else {
      dicePool$.mod(removeDiceById('approach'))
    }
  }, [isActive])
  const onSelect = (value: string) => {
    hide()
    $.prop('approach').mod((a) => (a === value ? '' : value))
  }

  return div({ className: styles.Approach }, [
    label({ key: 'label', className: isActive ? styles.active : '' }, ['Approach']),
    e(TierSelect, { key: 'tier', $: $.prop('tier') }),
    button(
      {
        key: 'approach',
        className: classes(styles.approachButton, isActive && styles.active),
        onClick: setOpen.bind(null, true),
      },
      [approach || 'Select'],
    ),
    open &&
      div(
        { key: 'popover', className: styles.popover, ref: popoverRef },
        ['Charm', 'Deceit', 'Force', 'Focus', 'Ingenuity'].map((value) =>
          button(
            {
              key: value,
              onClick: onSelect.bind(null, value),
              value,
              type: 'button',
              className: classes(styles.option, isActive && styles.selected),
            },
            [value],
          ),
        ),
      ),
  ])
}
