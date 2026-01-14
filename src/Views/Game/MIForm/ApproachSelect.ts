import { funState, FunState } from '@fun-land/fun-state'
import { Component, enhance, h, onTo, renderWhen } from '@fun-land/fun-web'
import { classes, keyframes, style, stylesheet } from 'typestyle'

import { Tier, tierColorMap, tierColor, TierSelect } from './TierSelect'

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

export const ApproachSelect: Component<{
  $: FunState<Approach$>
  removeDie: (id: string) => unknown
  addDie: (color: number, id: string) => unknown
}> = (signal, { $, addDie, removeDie }) => {
  const openState = funState(false)

  const approachButton = enhance(
    h('button', {
      className: styles.approachButton,
    }),
    onTo('click', () => openState.set(true), signal),
  )

  const approachLabel = h('label', {}, ['Approach'])

  // Watch state and update DOM + dice pool
  $.watch(signal, ({ approach, tier }) => {
    const isActive = !!approach && tier !== Tier.T0

    // Manage dice in pool
    isActive ? addDie(tierColor(tier), 'approach') : removeDie('approach')

    // Update label styling
    approachLabel.className = ''
    if (isActive) {
      approachLabel.classList.add(
        styles.active,
        style({
          color: `var(--bg-die-${tierColorMap[tier]})`,
        }),
      )
    }

    // Update button text
    approachButton.textContent = approach || 'Select'

    // Update button styling
    approachButton.className = styles.approachButton
    if (tier !== Tier.T0 && !approach) {
      approachButton.classList.add(styles.required)
    }
  })

  const onSelect = (value: string) => {
    openState.set(false)
    $.prop('approach').mod((a) => (a === value ? '' : value))
  }

  return h('div', { className: styles.Approach }, [
    approachLabel,
    TierSelect(signal, { $: $.prop('tier') }),
    approachButton,
    renderWhen({
      component: ApproachPopover,
      signal,
      props: { $, onSelect, state: openState },
      state: openState,
    }),
  ])
}

const ApproachPopover: Component<{
  $: FunState<Approach$>
  onSelect: (value: string) => void
  state: FunState<boolean>
}> = (signal, { $, onSelect }) => {
  // Create option buttons once with stable handlers
  const optionButtons = approaches.map((value) => {
    const button = enhance(
      h('button', { value, type: 'button', className: styles.option }, []),
      onTo('click', () => onSelect(value), signal),
    )
    return { button, value }
  })

  const popover = h(
    'div',
    { className: styles.popover },
    optionButtons.map((el) => el.button),
  )

  // Watch approach state and update option styling and content
  $.prop('approach').watch(signal, (approach) => {
    optionButtons.forEach(({ button, value }) => {
      button.className = classes(styles.option, value === approach && styles.selected)
      button.textContent = value + (value === approach ? ' ❌' : '')
    })
  })

  return popover
}
