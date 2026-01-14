import { funState, FunState } from '@fun-land/fun-state'
import { Component, enhance, h, on } from '@fun-land/fun-web'
import { classes, keyframes, stylesheet } from 'typestyle'
import { DieColor } from '../../../Models/Die'

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
  hidden: {
    display: 'none',
  },
})

export enum Factor {
  Disadvantaged = 'Disadvantaged',
  Even = 'Even',
  Dominant = 'Dominant',
}

export const factorDie = { color: 'white', type: 'd6', id: 'factor' } as const

export const FactorSelect: Component<{
  $: FunState<Factor>
  removeDie: (id: string) => unknown
  addDie: (color: number, id: string) => unknown
  active: boolean
}> = (signal, { $, addDie, removeDie, active }) => {
  const openState = funState(false)

  const factorLabel = h('label', { className: styles.label }, ['Factor'])
  const factorButton = enhance(
    h('button', { className: styles.button }, []),
    on('click', () => openState.set(true), signal),
  )

  const onSelect = (val: Factor) => {
    openState.set(false)
    $.set(val)
  }

  // Create option buttons once with stable handlers
  const optionButtons = [Factor.Disadvantaged, Factor.Even, Factor.Dominant].map((value) => {
    const button = enhance(
      h('button', { value, type: 'button', className: styles.option }, [value]),
      on('click', () => onSelect(value), signal),
    )
    return { button, value }
  })

  const popover = h(
    'div',
    { className: classes(styles.popover, styles.hidden) },
    optionButtons.map((el) => el.button),
  )

  // Watch factor state to update label, button, dice, and option styling
  $.watch(signal, (factor) => {
    const isActive = factor !== Factor.Disadvantaged

    // Update label styling
    factorLabel.className = classes(styles.label, isActive ? styles.active : '')

    // Update button text
    factorButton.textContent = factor

    // Update option button styling
    optionButtons.forEach(({ button, value }) => {
      button.className = classes(styles.option, factor === value && styles.selected)
    })

    // Update dice based on factor and active state
    if (active) {
      switch (factor) {
        case Factor.Even:
          addDie(0xffffff, 'factor1')
          removeDie('factor2')
          break
        case Factor.Dominant:
          addDie(0xffffff, 'factor1')
          addDie(0xffffff, 'factor2')
          break
        case Factor.Disadvantaged:
          removeDie('factor1')
          removeDie('factor2')
      }
    }
  })

  // Watch open state to toggle popover visibility
  openState.watch(signal, (isOpen) => {
    popover.classList.toggle(styles.hidden, !isOpen)
  })

  return h('div', {}, [h('div', { className: styles.FactorSelect }, [factorLabel, factorButton, popover])])
}
