import { FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { classes } from '../../../util'

import { Tier, tierColorMap, tierColor, TierSelect } from './TierSelect'
import { styles } from './ApproachSelect.css'

export interface Approach$ {
  approach: string
  tier: Tier
}

export const init_Approach$: Approach$ = {
  approach: '',
  tier: Tier.T0,
}

export const approaches = ['Charm', 'Deceit', 'Force', 'Focus', 'Ingenuity'] as const

export const ApproachSelect: Component<{
  $: FunState<Approach$>
  removeDie: (id: string) => unknown
  addDie: (color: number, id: string) => unknown
}> = (signal, { $, addDie, removeDie }) => {
  const approachLabel = h('label', {}, ['Approach'])

  const popover = h(
    'div',
    {
      className: styles.popover,
      popover: 'auto',
    },
    [],
  )

  const approachButton = hx(
    'button',
    {
      signal,
      props: { className: styles.approachButton, type: 'button' },
      attrs: {
        anchorName: '--approach-anchor',
        'aria-haspopup': 'menu',
        'aria-expanded': 'false',
      },
      on: {
        click: () => {
          if (popover.matches(':popover-open')) popover.hidePopover()
          else popover.showPopover()
          // (toggle event will also fire; this is fine either way)
          syncExpanded()
        },
      },
    },
    [],
  )

  // Keep aria-expanded in sync even when UA closes (click-outside / Esc)
  const syncExpanded = () => {
    approachButton.setAttribute('aria-expanded', popover.matches(':popover-open') ? 'true' : 'false')
  }

  popover.addEventListener('toggle', syncExpanded, { signal })

  const onSelect = (value: string) => {
    popover.hidePopover()
    $.prop('approach').mod((a) => (a === value ? '' : value))
  }

  const optionButtons = approaches.map((value) => {
    const button = hx(
      'button',
      { signal, props: { value, type: 'button', className: styles.option }, on: { click: () => onSelect(value) } },
      [value],
    )
    return { button, value }
  })

  optionButtons.forEach(({ button }) => popover.appendChild(button))

  // Watch state and update DOM + dice pool
  $.watch(signal, ({ approach, tier }) => {
    const isActive = !!approach && tier !== Tier.T0

    // Manage dice in pool
    isActive ? addDie(tierColor(tier), 'approach') : removeDie('approach')

    // Update label styling
    approachLabel.className = ''
    if (isActive) {
      approachLabel.classList.add(styles.active)
      approachLabel.style.color = `var(--bg-die-${tierColorMap[tier]})`
    } else {
      approachLabel.style.color = ''
    }

    // Update button text
    approachButton.textContent = approach || 'Select'

    // Update button styling
    approachButton.className = styles.approachButton
    if (tier !== Tier.T0 && !approach) {
      approachButton.classList.add(styles.required)
    }
  })

  // Watch approach state and update option styling and content
  $.prop('approach').watch(signal, (approach) => {
    optionButtons.forEach(({ button, value }) => {
      button.className = classes(styles.option, value === approach && styles.selected)
      button.textContent = value + (value === approach ? ' ❌' : '')
    })
  })

  return h('div', { className: styles.Approach }, [
    approachLabel,
    TierSelect(signal, { $: $.prop('tier') }),
    approachButton,
    popover,
  ])
}
