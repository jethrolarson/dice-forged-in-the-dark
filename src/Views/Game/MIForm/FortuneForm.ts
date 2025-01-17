import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { useEffect, useRef } from 'react'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { DiceSceneRef } from '../../../components/DiceScene/DiceScene'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { TextInput } from '../../../components/TextInput'
import { div, e, h } from '../../../util'
import { NewRoll } from '../RollForm/FormCommon'

const styles = stylesheet({
  AssistForm: {
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
})

interface AssistForm$ {
  pool: string
  dicePool: DicePool$
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>) =>
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
    state.set(init_ActionForm$())
  }

const init_ActionForm$ = (): AssistForm$ => ({
  dicePool: init_DicePool$(),
  note: '',
  pool: '',
  username: '',
})

export const FortuneForm = ({
  uid,
  roll,
  active,
}: {
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active: boolean
}) => {
  const $ = useFunState<AssistForm$>(init_ActionForm$())
  const { note } = $.get()
  const dicePool$ = $.prop('dicePool')
  const diceSceneRef = useRef<DiceSceneRef | null>(null)
  useEffect(() => {
    note ? diceSceneRef.current?.enable() : diceSceneRef.current?.disable()
  }, [note])
  return active
    ? div({ className: styles.AssistForm }, [
        e(DicePool, {
          key: 'dicepool',
          ref: diceSceneRef,
          state: dicePool$,
          sendRoll: rollIt(roll, uid, $),
          disableRemove: false,
          disabled: !note,
        }),
        div({ key: 'form', className: styles.form }, [
          e(FormHeading, { key: 'title', title: 'Fortune Roll' }),
          h('p', { key: 'subhead' }, ['Did a non-player entity succeed in their plans?']),
          h('p', { key: 'subhead2' }, ['OP rolls 0-3 dice based on standing of entity']),
          div({ key: 'poolSelect' }, [
            e(TextInput, {
              key: 'pool',
              state: $.prop('pool'),
              passThroughProps: { name: 'pool', placeholder: 'Context' },
            }),
          ]),
          e(TextInput, {
            key: 'username',
            passThroughProps: {
              placeholder: 'Entity',
              type: 'text',
              name: 'username',
            },
            state: $.prop('username'),
          }),
          e(Note, { key: 'note', $: $.prop('note') }),
        ]),
      ])
    : null
}
