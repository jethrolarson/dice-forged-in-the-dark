import { FunState } from '@fun-land/fun-state'
import {  Component, h, hx } from '@fun-land/fun-web'
import { classes } from '../../../util'
import { styles } from './FactorSelect.css'

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

  const factorButton = hx(
    'button',
    {
      signal,
      props: { className: classes(styles.button, styles.factorButton), type: 'button' },
      attrs: { anchorName: '--factor-anchor', 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
      on: {
        click: () => {
          if (popover.matches(':popover-open')) {
            popover.hidePopover()
          } else popover.showPopover()
          syncExpanded()
        },
      },
    },
    [],
  )

  // Keep aria-expanded in sync even when UA closes (click-outside / Esc)
  const syncExpanded = () => {
    factorButton.setAttribute('aria-expanded', popover.matches(':popover-open') ? 'true' : 'false')
  }

  popover.addEventListener('toggle', syncExpanded, { signal })

  const onSelect = (val: Factor) => {
    popover.hidePopover()
    $.set(val)
  }

  const optionButtons = [Factor.Disadvantaged, Factor.Even, Factor.Dominant].map((value) => {
    const button = hx(
      'button',
      { signal, props: { value, type: 'button', className: styles.option }, on: { click: () => onSelect(value) } },
      [value],
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
