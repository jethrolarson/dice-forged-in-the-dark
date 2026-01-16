import { FunState } from '@fun-land/fun-state'
import { classes, style, stylesheet } from 'typestyle'
import { dieColors, DieColorType } from '../../../Models/Die'
import { Component, h, hx } from '@fun-land/fun-web'

const styles = stylesheet({
  TierSelect: {
    position: 'relative',
    $nest: {
      button: {
        border: 'none',
        fontSize: '2rem',
        padding: '1px 2px 2px',
        fontSmooth: 'always',
        $nest: {
          '&:hover': {
            background: 'transparent',
            textShadow: '1px 1px 3px',
          },
        },
      },
    },
  },
  tierButton: {
    margin: '0 4px',
    lineHeight: '2rem',
    anchorName: '--tier-anchor',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  popover: {
    position: 'absolute',
    gap: 5,
    zIndex: 1,
    width: '46px',
    backgroundColor: '#061318',
    padding: 5,
    outline: `1px solid var(--bc-focus)`,
    // (typestyle doesn't know these props, but it will still emit them)
    positionAnchor: '--tier-anchor',
    positionArea: 'center center',
    display: 'none',
    $nest: {
      '&:popover-open': {
        display: 'grid',
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
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
})

export enum Tier {
  T0 = '⨷',
  T1 = '⓵',
  T2 = '⓶',
  T3 = '⓷',
  T4 = '⓸',
  T5 = '⓹',
}

export const tierColorMap = {
  [Tier.T0]: 'white',
  [Tier.T1]: 'green',
  [Tier.T2]: 'blue',
  [Tier.T3]: 'purple',
  [Tier.T4]: 'yellow',
  [Tier.T5]: 'red',
} satisfies Record<Tier, DieColorType>

export const tierColor = (tier: Tier): number => dieColors[tierColorMap[tier]]

export const TierLabel: Component<{ tier: Tier }> = (signal, { tier }) =>
  h('span', { className: style({ color: `var(--bg-die-${tierColorMap[tier]})` }) }, [tier])

const tierOpts = [Tier.T0, Tier.T1, Tier.T2, Tier.T3, Tier.T4, Tier.T5] as const

export const TierSelect: Component<{ $: FunState<Tier> }> = (signal, { $ }) => {
  const popover = h(
    'div',
    {
      className: styles.popover,
      popover: 'auto',
    },
    [],
  )

  const tierButton = hx(
    'button',
    {
      signal,
      props: { className: styles.tierButton, type: 'button' },
      attrs: { 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
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
    tierButton.setAttribute('aria-expanded', popover.matches(':popover-open') ? 'true' : 'false')
  }

  popover.addEventListener('toggle', syncExpanded, { signal })

  const onSelect = (val: Tier) => {
    popover.hidePopover()
    $.set(val)
  }

  const tierButtonLabel = h('span', {}, [])

  const optionButtons = tierOpts.map((value) => {
    const button = hx(
      'button',
      { signal, props: { value, type: 'button', className: styles.option }, on: { click: () => onSelect(value) } },
      [],
    )
    const label = h('span', {}, [])
    button.appendChild(label)
    return { button, value, label }
  })

  optionButtons.forEach(({ button }) => popover.appendChild(button))
  tierButton.appendChild(tierButtonLabel)

  // Watch tier state and update button content and selected styling
  $.watch(signal, (tier) => {
    tierButtonLabel.textContent = tier
    tierButtonLabel.className = style({ color: `var(--bg-die-${tierColorMap[tier]})` })

    optionButtons.forEach(({ button, value, label }) => {
      button.className = classes(styles.option, tier === value && styles.selected)
      label.textContent = value
      label.className = style({ color: `var(--bg-die-${tierColorMap[value]})` })
    })
  })

  return h('div', { className: styles.TierSelect }, [tierButton, popover])
}
