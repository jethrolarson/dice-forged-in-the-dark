import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePoolState } from '../../../components/DicePool'
import { Character } from '../../../components/Character'
import { FormHeading } from '../../../components/FormHeading'
import { e, h, div } from '../../../util'
import { Rollable } from '../RollForm/DicePool'

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
  poolSelect: { display: 'flex', alignItems: 'center' },
})

interface AssistForm$ {
  dicePool: DicePoolState
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, dicePool, username } = state.get()
    const n = dicePool.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Action',
      lines: ['Assist'],
      username,
      isZero,
      diceRolled,
      date: Date.now(),
      kind: 'Roll',
      valuationType: 'Highest',
      uid,
    })
    state.set(init_ActionForm$())
  }

const ampDie: Rollable = {
  color: 'red',
  type: 'd6',
  id: 'amped',
}

const init_ActionForm$ = (): AssistForm$ => ({
  dicePool: [ampDie],
  note: '',
  username: '',
})

export const FortuneForm = ({ uid, roll }: { uid: string; roll: (rollResult: NewRoll) => unknown }) => {
  const $ = useFunState<AssistForm$>(init_ActionForm$())
  const { note } = $.get()
  const disabled = !note
  const dicePool$ = $.prop('dicePool')
  return div({ className: styles.AssistForm }, [
    e(DicePool, {
      key: 'dicepool',
      state: dicePool$,
      sendRoll: rollIt(roll, uid, $),
      disableRemove: false,
      disableAdd: true,
      disabled,
    }),
    div({ key: 'form', className: styles.form }, [
      e(FormHeading, { key: 'head', title: 'Fortune' }),
      h('p', { key: 'subhead' }, ['See what the universe does']),
      e(Character, { key: 'character', $: $.prop('username') }),
      e(Note, { key: 'note', $: $.prop('note') }),
    ]),
  ])
}
