import { funState, FunState } from '@fun-land/fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { Character } from '../../../components/Character'
import { FormHeading } from '../../../components/FormHeading'
import { Rollable } from '../RollForm/DicePool'
import { Component, h, enhance } from '@fun-land/fun-web'
import { hideUnless } from '../../../util'

const styles = stylesheet({
  AssistForm: {
    minHeight: 200,
    display: 'grid',
    gap: 12,
    padding: 12,
    margin: 0,
    background: 'var(--bg-game)',
    overflowY: 'auto',
    flex: 1,
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
    const { note, username } = state.get()
    const isZero = diceRolled.length === 0
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

export const ResistForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
}> = (signal, { uid, roll, active$ }) => {
  const $ = funState<AssistForm$>(init_ActionForm$())
  const container = enhance(
    h('div', { className: styles.AssistForm }, [
      DicePool(signal, {
        sendRoll: rollIt(roll, uid, $),
        disableAdd$: funState(true),
        active$,
      }),
      h('div', { className: styles.form }, [
        FormHeading(signal, { title: 'Resist Roll' }),
        h('p', {}, ['Spend die to resist bad shit']),
        Character(signal, { $: $.prop('username') }),
        Note(signal, { $: $.prop('note') }),
      ]),
    ]),
    hideUnless(active$, signal),
  )
  return container
}
