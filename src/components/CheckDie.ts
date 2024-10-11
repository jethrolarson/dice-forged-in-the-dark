import { flow, not } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { ReactElement } from 'react'
import { stylesheet } from 'typestyle'
import { DieColorType } from '../Models/Die'
import { e } from '../util'
import { addDice, DicePool$, removeDiceById } from './DicePool'

const styles = stylesheet({
  CheckDie: {
    fontSize: '1rem',
  },
  checkbox: {
    verticalAlign: 'middle',
    appearance: 'none',
    width: '1.2em',
    height: '1.2em',
    marginRight: 5,
    borderWidth: 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Roboto Mono'",
    $nest: {
      '&:checked:before': {
        content: '"×"',
        fontSize: '1.3em',
        lineHeight: 1,
      },
    },
  },
})

export type CheckDieState = boolean
export const CheckDie = ({
  color,
  $,
  dicePool$,
  label,
  id,
}: {
  id: string
  label: ReactElement | string
  color: DieColorType
  $: FunState<CheckDieState>
  dicePool$: FunState<DicePool$>
}) => {
  const _addDice = flow(addDice, dicePool$.mod)
  const _removeDice = flow(removeDiceById, dicePool$.prop('pool').mod)
  return e('label', { className: styles.CheckDie }, [
    e('input', {
      className: styles.checkbox,
      checked: $.get(),
      type: 'checkbox',
      onChange: ({ currentTarget: { checked } }) => {
        checked ? _addDice([{ color: color, type: 'd6', id }]) : _removeDice(id)
        $.set(checked)
      },
    }),
    label,
  ])
}
