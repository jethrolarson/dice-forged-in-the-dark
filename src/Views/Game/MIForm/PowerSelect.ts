import { FunState } from '@fun-land/fun-state'
import { useEffect } from 'react'
import { classes, keyframes, style, stylesheet } from 'typestyle'
import { ComboBox } from '../../../components/ComboBox'
import { TextInput } from '../../../components/TextInput'
import { DieColor } from '../../../Models/Die'
import { e, div, label } from '../../../util'
import { DicePoolState, removeDiceById, setDiceById } from '../../../components/DicePool'
import { Tier, tierColorMap, tierColor, TierSelect } from './TierSelect'
import { important } from 'csx'

export interface Power$ {
  power: string
  tier: Tier
}

export const init_Power$: Power$ = {
  power: '',
  tier: Tier.T0,
}

const textPulse = keyframes({
  from: {
    textShadow: ' 0 0 6px',
  },
})

const styles = stylesheet({
  Power: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    $nest: {
      label: { flexGrow: 1 },
    },
  },
  selected: {
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  },
  active: {
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  },
  input: {
    textAlign: 'center',
    width: 135,
  },
})

export const powers = [
  'Awareness',
  'Cycles',
  'Data',
  'Fortitude',
  'Fortress',
  'Ghost',
  'Instincts',
  'Speed',
  'Stealth',
  'Strength',
  'Swagger',
] as const

export const PowerSelect = ({
  $,
  addDie,
  removeDie,
}: {
  $: FunState<Power$>
  removeDie: (id: string) => unknown
  addDie: (color: number, id: string) => unknown
}) => {
  const { power, tier } = $.get()
  const isActive = !!power && tier !== Tier.T0
  useEffect(() => {
    isActive ? addDie(tierColor(tier), 'power') : removeDie('power')
  }, [isActive, tier])
  return div({ className: styles.Power }, [
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
      ['Power'],
    ),
    e(TierSelect, { key: 'tier', $: $.prop('tier') }),
    e(ComboBox, {
      key: 'power',
      $: $.prop('power'),
      name: 'power',
      data: powers,
      placeholder: 'Power',
      required: tier !== Tier.T0,
      className: styles.input,
    }),
  ])
}
