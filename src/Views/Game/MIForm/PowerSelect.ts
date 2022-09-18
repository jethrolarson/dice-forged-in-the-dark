import { FunState } from '@fun-land/fun-state'
import { useEffect } from 'react'
import { classes, keyframes, stylesheet } from 'typestyle'
import { ComboBox } from '../../../components/ComboBox'
import { TextInput } from '../../../components/TextInput'
import { DieColor } from '../../../Models/Die'
import { e, div, label } from '../../../util'
import { DicePoolState, removeDiceById, setDiceById } from '../../../components/DicePool'
import { Tier, TierSelect } from './TierSelect'

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
  Power: { position: 'relative', display: 'flex', alignItems: 'center' },
  selected: {
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  },
  approachButton: {
    flexGrow: 1,
  },
  active: {
    color: DieColor.yellow,
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  },
  input: {
    textAlign: 'center',
  },
})

export const powers = [
  'awareness',
  'cycles',
  'data',
  'fortitude',
  'fortress',
  'ghost',
  'instincts',
  'speed',
  'stealth',
  'strength',
  'swagger',
] as const

export const PowerSelect = ({ $, dicePool$ }: { $: FunState<Power$>; dicePool$: FunState<DicePoolState> }) => {
  const { power, tier } = $.get()
  const isActive = !!power && tier !== Tier.T0
  useEffect(() => {
    dicePool$.mod(isActive ? setDiceById(1, 'd6', 'yellow', 'power') : removeDiceById('power'))
  }, [isActive])
  return div({ className: styles.Power }, [
    label({ key: 'label', className: isActive ? styles.active : '' }, ['Power']),
    e(TierSelect, { key: 'tier', $: $.prop('tier') }),
    e(ComboBox, {
      key: 'power',
      $: $.prop('power'),
      name: 'power',
      options: powers,
      passThroughProps: { placeholder: 'Power', className: classes(styles.input, isActive && styles.active) },
    }),
  ])
}
