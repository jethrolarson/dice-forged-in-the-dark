import { FunState } from '@fun-land/fun-state'
import { Component, enhance, h, on } from '@fun-land/fun-web'
import { classes, keyframes, stylesheet } from 'typestyle'
import { DieColor } from '../../../Models/Die'

const textPulse = keyframes({
  from: { textShadow: ' 0 0 6px' },
})

const styles = stylesheet({
  popover: {
    position: 'absolute',
    gap: 5,
    zIndex: 1,
    backgroundColor: '#061318',
    padding: 7,
    outline: `1px solid var(--bc-focus)`,
    // (typestyle doesn't know these props, but it will still emit them)
    positionAnchor: '--factor-anchor',
    positionArea: 'top center',
    display: 'none',
    $nest: {
      '&:popover-open': {
        display: 'grid',
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  FactorSelect: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  option: { display: 'block', width: '100%' },
  selected: {
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  },
  label: { flexGrow: 1 },
  button: {
    width: 135,
    textAlign: 'center',
  },
  factorButton: {
    anchorName: '--factor-anchor',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
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

export const FactorSelect: Component<{
  $: FunState<Factor>
  removeDie: (id: string) => unknown
  addDie: (color: number, id: string) => unknown
}> = (signal, { $, addDie, removeDie }) => {
  const factorLabel = h('label', { className: styles.label }, 'Factor')

  const popover = h(
    'div',
    {
      className: styles.popover,
      popover: 'auto',
    },
    [],
  )

  const factorButton = h(
    'button',
    {
      className: classes(styles.button, styles.factorButton),
      type: 'button',
      anchorName: '--factor-anchor',
      'aria-haspopup': 'menu',
      'aria-expanded': 'false',
    },
    [],
  )

  // Keep aria-expanded in sync even when UA closes (click-outside / Esc)
  const syncExpanded = () => {
    factorButton.setAttribute('aria-expanded', popover.matches(':popover-open') ? 'true' : 'false')
  }

  popover.addEventListener('toggle', syncExpanded, { signal })

  enhance(
    factorButton,
    on(
      'click',
      () => {
        if (popover.matches(':popover-open')) popover.hidePopover()
        else popover.showPopover()
        // (toggle event will also fire; this is fine either way)
        syncExpanded()
      },
      signal,
    ),
  )

  const onSelect = (val: Factor) => {
    popover.hidePopover()
    $.set(val)
  }

  const optionButtons = [Factor.Disadvantaged, Factor.Even, Factor.Dominant].map((value) => {
    const button = enhance(
      h('button', { value, type: 'button', className: styles.option }, value),
      on('click', () => onSelect(value), signal),
    )
    return { button, value }
  })

  optionButtons.forEach(({ button }) => popover.appendChild(button))

  $.watch(signal, (factor: Factor) => {
    const isActive = factor !== Factor.Disadvantaged
    factorLabel.className = classes(styles.label, isActive ? styles.active : '')
    factorButton.textContent = factor

    optionButtons.forEach(({ button, value }) => {
      button.className = classes(styles.option, factor === value && styles.selected)
    })

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
  })

  return h('div', {}, [h('div', { className: styles.FactorSelect }, [factorLabel, factorButton, popover])])
}
