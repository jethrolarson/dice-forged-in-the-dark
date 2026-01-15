import { funState, FunState } from '@fun-land/fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { Character } from '../../../components/Character'
import { FormHeading } from '../../../components/FormHeading'
import { Rollable } from '../RollForm/DicePool'
import { Component, h } from '@fun-land/fun-web'

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

export const AssistForm: Component<{ uid: string; roll: (rollResult: NewRoll) => unknown }> = (
  signal,
  { uid, roll },
) => {
  const $ = funState<AssistForm$>(init_ActionForm$())
  return h('div', { className: styles.AssistForm }, [
    DicePool(signal, {
      sendRoll: rollIt(roll, uid, $),

      disableAdd$: funState(true),
    }),
    h('div', { className: styles.form }, [
      FormHeading(signal, { title: 'Assist' }),
      h('p', {}, ['Roll your amp die to save another action']),
      Character(signal, { $: $.prop('username') }),
      Note(signal, { $: $.prop('note') }),
    ]),
  ])
}
