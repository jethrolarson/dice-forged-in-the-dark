import { funState, FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { DicePool } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { TextInput } from '../../../components/TextInput'
import { NewRoll } from '../RollForm/FormCommon'

const styles = stylesheet({
  FortuneForm: {
    minHeight: 200,
    display: 'grid',
    gap: 12,
    margin: 12,
    $nest: {
      p: {
        margin: 0,
        fontSize: '1.17rem',
        fontStyle: 'italic',
      },
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  hidden: {
    display: 'none',
  },
})

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
    state.set(init_FortuneForm$())
  }

const init_FortuneForm$ = (): FortuneForm$ => ({
  note: '',
  pool: '',
  username: '',
})

export const FortuneForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active: boolean
}> = (signal, { uid, roll, active }) => {
  const $ = funState<FortuneForm$>(init_FortuneForm$())

  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $),
    disableAdd: false,
  })

  const diceApi = dicePool.$api

  // Watch state to manage dice scene enabled/disabled
  $.watch(signal, ({ note }) => {
    note ? diceApi.enable() : diceApi.disable()
  })

  // Create all components once
  const container = h('div', { className: active ? styles.FortuneForm : styles.hidden }, [
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
  ])

  return container
}
