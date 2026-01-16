import { flow } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { DieColorType } from '../Models/Die'
import { addDice, DicePool$, removeDiceById } from './DicePool'
import { Component, h, hx } from '@fun-land/fun-web'
import { styles } from './CheckDie.css'

export type CheckDieState = boolean
export const CheckDie: Component<{
  id: string
  label: Element | string
  color: DieColorType
  $: FunState<CheckDieState>
  dicePool$: FunState<DicePool$>
}> = (signal, { color, $, dicePool$, label, id }) => {
  const _addDice = flow(addDice, dicePool$.mod)
  const _removeDice = flow(removeDiceById, dicePool$.prop('pool').mod)
  return h('label', { className: styles.CheckDie }, [
    hx('input', {
      props: {
        className: styles.checkbox,
        checked: $.get(),
        type: 'checkbox',
      },
      on: {
        change: ({ currentTarget: { checked } }) => {
          checked ? _addDice([{ color, type: 'd6', id }]) : _removeDice(id)
          $.set(checked)
        },
      },
      signal,
    }),
    label,
  ])
}
