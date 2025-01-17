import { FunState } from '@fun-land/fun-state'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { classes, style, stylesheet } from 'typestyle'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { h, div, e, button } from '../../../util'
import { dieColors, DieColorType } from '../../../Models/Die'

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

export const TierLabel = ({ tier }: { tier: Tier }): ReactElement =>
  h('span', { className: style({ color: `var(--bg-die-${tierColorMap[tier]})` }) }, [tier])

const tierOpts = [Tier.T0, Tier.T1, Tier.T2, Tier.T3, Tier.T4, Tier.T5] as const

export const TierSelect = ({ $ }: { $: FunState<Tier> }) => {
  const tier = $.get()
  const [open, setOpen] = useState(false)

  const hide = useCallback(() => setOpen(false), [])
  const popoverRef = useRef<HTMLDivElement>(null)
  useClickOutside(popoverRef, hide)

  const onSelect = (value: Tier) => {
    setOpen(false)
    $.set(value)
  }
  return div({ className: styles.TierSelect }, [
    button({ key: 'tierButton', className: styles.tierButton, onClick: setOpen.bind(null, true) }, [
      tier ? e(TierLabel, { key: 'tierLabel', tier }) : 'Tier',
    ]),
    open &&
      div(
        { key: 'popover', className: styles.popover, ref: popoverRef },
        tierOpts.map((value) =>
          button(
            {
              key: value,
              onClick: onSelect.bind(null, value),
              value,
              type: 'button',
              className: classes(styles.option, tier === value && styles.selected),
            },
            [e(TierLabel, { key: 'tierLabel' + value, tier: value })],
          ),
        ),
      ),
  ])
}
