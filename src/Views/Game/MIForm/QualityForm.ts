import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { style, stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePoolState } from '../../../components/DicePool'
import { Character } from '../../../components/Character'
import { TextInput } from '../../../components/TextInput'
import { FormHeading } from '../../../components/FormHeading'
import { h, div, e } from '../../../util'

const styles = stylesheet({
  AssistForm: {
    minHeight: 200,
    display: 'grid',
    gridTemplateColumns: '120px auto',
    gap: 12,
    margin: 12,
    $nest: {
      p: {
        margin: 0,
        fontSize: '1rem',
        fontStyle: 'italic',
      },
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  poolSelect: { display: 'flex', alignItems: 'center' },
})

interface QualityForm$ {
  pool: string
  dicePool: DicePoolState
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<QualityForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, dicePool, pool, username } = state.get()
    const n = dicePool.length
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
    state.set(init_QualityForm$())
  }

const init_QualityForm$ = (): QualityForm$ => ({
  dicePool: [],
  note: '',
  pool: '',
  username: '',
})

export const QualityForm = ({
  uid,
  roll,
  active,
}: {
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active: boolean
}) => {
  const $ = useFunState<QualityForm$>(init_QualityForm$())
  const { note } = $.get()
  const dicePool$ = $.prop('dicePool')
  return active
    ? div({ className: styles.AssistForm }, [
        e(DicePool, {
          key: 'dicepool',
          state: dicePool$,
          sendRoll: rollIt(roll, uid, $),
          disableRemove: false,
          disabled: !note,
        }),
        div({ key: 'form', className: styles.form }, [
          e(FormHeading, { key: 'head', title: 'Quality Roll' }),
          h('p', { key: 'subhead' }, ['You succeed but how well?']),
          h('p', { key: 'subhead2' }, ['Roll T dice where T is highest Tier of your remaining dice']),
          div({ key: 'poolSelect', className: styles.poolSelect }, [
            e(TextInput, {
              key: 'pool',
              state: $.prop('pool'),
              passThroughProps: { name: 'pool', placeholder: 'Approach or Power' },
            }),
          ]),
          e(Character, { key: 'character', $: $.prop('username') }),
          e(Note, { key: 'note', $: $.prop('note') }),
        ]),
      ])
    : null
}
