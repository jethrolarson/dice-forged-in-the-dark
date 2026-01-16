import { funState, FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { repeat } from 'ramda'
import { NumberSpinner } from '../../../components/NumberSpinner'
import { DieColor, DieType } from '../../../Models/Die'
import { ModifierT } from '../../../Models/RollConfig'
import { styles } from './Modifier.css'

export const Modifier: Component<{
  section: ModifierT
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
  state?: FunState<string>
}> = (signal, { setDice, section, state }) => {
  const s = funState(section.baseModifier)

  const updateDice = (v: number) => {
    setDice(section.name, repeat(section.dieType, v), section.dieColor)
    v !== 0 && state?.set(`${section.name}: ${v}`)
  }

  // Watch spinner state and update dice
  s.watch(signal, updateDice)

  // Initial dice setup
  updateDice(s.get())

  return h('div', {}, [
    ...(section.showLabel ? [h('label', { className: styles.label, title: section.tooltip }, [section.name])] : []),
    NumberSpinner(signal, { min: section.min, max: section.max, state: s }),
  ])
}
