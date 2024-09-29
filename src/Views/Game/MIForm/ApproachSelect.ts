import { FunState } from '@fun-land/fun-state'
import { useCallback, useEffect, useRef, useState } from 'react'
import { classes, keyframes, style, stylesheet } from 'typestyle'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { DieColor } from '../../../Models/Die'
import { label, e, div, button } from '../../../util'
import { DicePoolState, removeDiceById, setDiceById } from '../../../components/DicePool'
import { Tier, tierColorMap, TierSelect } from './TierSelect'

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
    width: 135,
    display: 'grid',
    zIndex: 2,
    backgroundColor: '#061318',
    top: '50%',
    right: 0,
    transform: 'translate(0%, -50%)',
    outline: `1px solid var(--bc-focus)`,
  },
  active: {
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  },
  Approach: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    $nest: {
      label: {
        flexGrow: 1,
      },
    },
  },
  option: {
    display: 'block',
    borderWidth: 0,
    width: '100%',
  },
  selected: {
    backgroundColor: 'var(--bg-button-selected) !important',
    borderColor: 'var(--bc-button-selected) !important',
    color: 'var(--fc-button-selected) !important',
  },
  approachButton: {
    width: 135,
    textAlign: 'left',
  },
  required: {
    borderColor: 'red !important',
  },
})

export const approaches = ['Charm', 'Deceit', 'Force', 'Focus', 'Ingenuity'] as const

export const ApproachSelect = ({
  $,
  addDie,
  removeDie,
}: {
  $: FunState<Approach$>
  removeDie: (id: string) => unknown
  addDie: (id: string) => unknown
}) => {
  const { approach, tier } = $.get()
  const [open, setOpen] = useState(false)
  const hide = useCallback(() => setOpen(false), [])
  const popoverRef = useRef<HTMLDivElement>(null)
  useClickOutside(popoverRef, hide)
  const isActive = !!approach && tier !== Tier.T0
  useEffect(() => {
    isActive ? addDie('approach') : removeDie('approach')
  }, [isActive, tier])
  const onSelect = (value: string) => {
    hide()
    $.prop('approach').mod((a) => (a === value ? '' : value))
  }

  return div({ className: styles.Approach }, [
    label(
      {
        key: 'label',
        className: isActive
          ? classes(
              styles.active,
              style({
                color: `var(--bg-die-${tierColorMap[tier]})`,
              }),
            )
          : '',
      },
      ['Approach'],
    ),
    e(TierSelect, { key: 'tier', $: $.prop('tier') }),
    button(
      {
        key: 'approach',
        className: classes(styles.approachButton, tier !== Tier.T0 && !approach && styles.required),
        onClick: setOpen.bind(null, true),
      },
      [approach || 'Select'],
    ),
    open &&
      div(
        { key: 'popover', className: styles.popover, ref: popoverRef },
        approaches.map((value) =>
          button(
            {
              key: value,
              onClick: onSelect.bind(null, value),
              value,
              type: 'button',
              className: classes(styles.option, value === approach && styles.selected),
            },
            [value, ...(value === approach ? [' ❌'] : [])],
          ),
        ),
      ),
  ])
}
