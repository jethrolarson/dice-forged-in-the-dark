import { funState, FunState } from '@fun-land/fun-state'
import { Component, enhance, h } from '@fun-land/fun-web'
import { DieResult } from '../../../Models/Die'
import { DicePool } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { TextInput } from '../../../components/TextInput'
import { NewRoll } from '../RollForm/FormCommon'
import { hideUnless } from '../../../util'
import { styles } from './FortuneForm.css'

interface FortuneForm$ {
  pool: string
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<FortuneForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, pool, username } = state.get()
    const n = diceRolled.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Fortune',
      lines: ['Fortune', pool].filter(Boolean),
      username,
      isZero,
      diceRolled,
      date: Date.now(),
      kind: 'Roll',
      valuationType: 'Action',
      uid,
    })
    state.set({ ...init_FortuneForm$(), username })
  }

const init_FortuneForm$ = (): FortuneForm$ => ({
  note: '',
  pool: '',
  username: '',
})

export const FortuneForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
}> = (signal, { uid, roll, active$ }) => {
  const $ = funState<FortuneForm$>(init_FortuneForm$())

  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $),
    disableAdd$: funState(false),
    active$,
  })

  // Watch state to manage dice scene enabled/disabled
  $.watch(signal, ({ note }) => {
    note ? dicePool.$api.enable() : dicePool.$api.disable()
  })

  // Create all components once
  const container = enhance(
    h('div', { className: styles.FortuneForm }, [
      dicePool,
      h('div', { className: styles.form }, [
        FormHeading(signal, { title: 'Fortune Roll' }),
        h('p', {}, ['Did a non-player entity succeed in their plans?']),
        h('p', {}, ['OP rolls 0-3 dice based on standing of entity']),
        h('div', {}, [
          TextInput(signal, {
            $: $.prop('pool'),
            passThroughProps: { name: 'pool', placeholder: 'Context' },
          }),
        ]),
        TextInput(signal, {
          passThroughProps: {
            placeholder: 'Entity',
            type: 'text',
            name: 'username',
          },
          $: $.prop('username'),
        }),
        Note(signal, { $: $.prop('note') }),
      ]),
    ]),
    hideUnless(active$, signal),
  )

  return container
}
