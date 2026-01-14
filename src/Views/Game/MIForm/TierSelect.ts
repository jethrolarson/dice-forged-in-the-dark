import { funState, FunState } from '@fun-land/fun-state'
import { classes, style, stylesheet } from 'typestyle'
import { dieColors, DieColorType } from '../../../Models/Die'
import { Component, enhance, h, on, renderWhen } from '@fun-land/fun-web'

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
  },
  popover: {
    zIndex: 1,
    display: 'grid',
    gap: 5,
    position: 'absolute',
    width: '46px',
    backgroundColor: '#061318',
    padding: 5,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
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
  const openState = funState(false)

  const tierButton = enhance(
    h('button', { className: styles.tierButton }, []),
    on('click', () => openState.set(true), signal),
  )

  // Watch tier state and update button content
  $.watch(signal, (tier) => {
    tierButton.replaceChildren(TierLabel(signal, { tier }))
  })

  // TODO use popover api
  // useClickOutside(popoverRef, hide)
  return h('div', { className: styles.TierSelect }, [
    tierButton,
    renderWhen({ component: TierPopover, signal, props: { $, state: openState }, state: openState }),
  ])
}

const TierPopover: Component<{ $: FunState<Tier>; state: FunState<boolean> }> = (signal, { $, state }) => {
  // Create option buttons once with stable handlers
  const optionButtons = tierOpts.map((value) => {
    const button = enhance(
      h('button', { value, type: 'button', className: styles.option }, []),
      on(
        'click',
        () => {
          $.set(value)
          state.set(false)
        },
        signal,
      ),
    )
    button.replaceChildren(TierLabel(signal, { tier: value }))
    return { button, value }
  })

  // Watch tier state and update selected styling
  $.watch(signal, (tier) => {
    optionButtons.forEach(({ button, value }) => {
      button.className = classes(styles.option, tier === value && styles.selected)
    })
  })

  return h(
    'div',
    { className: styles.popover },
    optionButtons.map((el) => el.button),
  )
}
