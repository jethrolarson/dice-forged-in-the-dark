import { FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { ComboBox } from '../../../components/ComboBox'
import { Tier, tierColorMap, tierColor, TierSelect } from './TierSelect'
import { styles } from './PowerSelect.css'

export interface Power$ {
  power: string
  tier: Tier
}

export const init_Power$: Power$ = {
  power: '',
  tier: Tier.T0,
}

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

export const PowerSelect: Component<{
  $: FunState<Power$>
  removeDie: (id: string) => unknown
  addDie: (color: number, id: string) => unknown
}> = (signal, { $, addDie, removeDie }) => {
  const powerLabel = h('label', {}, ['Power'])

  // Watch state and update label styling and dice
  $.watch(signal, ({ power, tier }) => {
    const isActive = !!power && tier !== Tier.T0

    // Manage dice in pool
    isActive ? addDie(tierColor(tier), 'power') : removeDie('power')

    // Update label styling
    powerLabel.className = ''
    if (isActive) {
      powerLabel.classList.add(styles.active)
      powerLabel.style.color = `var(--bg-die-${tierColorMap[tier]})`
    } else {
      powerLabel.style.color = ''
    }
  })

  return h('div', { className: styles.Power }, [
    powerLabel,
    TierSelect(signal, { $: $.prop('tier') }),
    ComboBox(signal, {
      $: $.prop('power'),
      name: 'power',
      data: powers,
      placeholder: 'Power',
      required: $.get().tier !== Tier.T0,
      className: styles.input,
    }),
  ])
}
