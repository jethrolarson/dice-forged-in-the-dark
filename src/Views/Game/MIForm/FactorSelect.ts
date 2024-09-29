import { flow } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { useState, useCallback, useRef } from 'react'
import { classes, keyframes, stylesheet } from 'typestyle'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { DieColor } from '../../../Models/Die'
import { label, div, button } from '../../../util'

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
    gap: 5,
    zIndex: 1,
    backgroundColor: '#061318',
    padding: 10,
    top: '50%',
    right: 0,
    transform: 'translate(0%, -50%)',
    outline: `1px solid var(--bc-focus)`,
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
  label: {
    flexGrow: 1,
  },
  button: {
    width: 135,
    textAlign: 'left',
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

export const FactorSelect = ({
  $,
  addDie,
  removeDie,
}: {
  $: FunState<Factor>
  removeDie: (id: string) => unknown
  addDie: (color: number, id: string) => unknown
}) => {
  const factor = $.get()
  const [open, setOpen] = useState(false)
  const hide = useCallback(() => setOpen(false), [])
  const popoverRef = useRef<HTMLDivElement>(null)
  useClickOutside(popoverRef, hide)

  const isActive = factor !== Factor.Disadvantaged
  const onSelect = (val: string) => {
    hide()
    $.set(val as Factor)
    switch (val) {
      case Factor.Even:
        addDie(0xffffff, 'factor1')
        removeDie('factor2')
        break
      case Factor.Dominant:
        addDie(0xffffff, 'factor1')
        addDie(0xffffff, 'factor2')
        break
      default:
        removeDie('factor1')
        removeDie('factor2')
    }
  }
  return div(null, [
    div({ key: 'factorSelect', className: styles.FactorSelect }, [
      label({ key: 'title', className: classes(styles.label, isActive ? styles.active : '') }, ['Factor']),
      button(
        {
          key: 'factor',
          className: styles.button,
          onClick: setOpen.bind(null, true),
        },
        [factor],
      ),
      open &&
        div(
          { key: 'popover', className: styles.popover, ref: popoverRef },
          [Factor.Disadvantaged, Factor.Even, Factor.Dominant].map((value) =>
            button(
              {
                key: value,
                onClick: onSelect.bind(null, value),
                value,
                type: 'button',
                className: classes(styles.option, factor === value && styles.selected),
              },
              [value],
            ),
          ),
        ),
    ]),
  ])
}
