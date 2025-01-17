import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
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
  dicePool: DicePool$
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, dicePool, username } = state.get()
    const n = dicePool.pool.length
    const isZero = n === 0
    roll({
      note,
      rollType: 'Action',
      lines: ['Assist'],
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

const ampDie: Rollable = {
  color: 'red',
  type: 'd6',
  id: 'amped',
}

const init_ActionForm$ = (): AssistForm$ => ({
  dicePool: { ...init_DicePool$(), pool: [ampDie] },
  note: '',
  username: '',
})

export const AssistForm = ({ uid, roll }: { uid: string; roll: (rollResult: NewRoll) => unknown }) => {
  const $ = useFunState<AssistForm$>(init_ActionForm$())
  const { username, note } = $.get()
  const disabled = !username || !note
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
      e(FormHeading, { key: 'head', title: 'Assist' }),
      h('p', { key: 'subhead' }, ['Roll your amp die to save another action']),
      e(Character, { key: 'character', $: $.prop('username') }),
      e(Note, { key: 'note', $: $.prop('note') }),
    ]),
  ])
}
