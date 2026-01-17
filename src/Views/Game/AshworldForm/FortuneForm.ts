import { funState, FunState } from '@fun-land/fun-state'
import { DieResult } from '../../../Models/Die'
import { Character } from '../../../components/Character'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { Rollable } from '../RollForm/DicePool'
import { NewRoll } from '../RollForm/FormCommon'
import { Component, h, enhance } from '@fun-land/fun-web'
import { hideUnless } from '../../../util'
import { styles } from './FortuneForm.css'

interface AssistForm$ {
  dicePool: DicePool$
  note: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>, username$: FunState<string>) =>
  (diceRolled: DieResult[]): void => {
    const { note } = state.get()
    const username = username$.get()
    const isZero = diceRolled.length === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Action',
      lines: ['Fortune'],
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
  color: 'yellow',
  type: 'd6',
  id: 'fortune',
}

const init_ActionForm$ = (): AssistForm$ => ({
  dicePool: { ...init_DicePool$(), pool: [ampDie] },
  note: '',
})

export const FortuneForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
  username$: FunState<string>
}> = (signal, { uid, roll, active$, username$ }) => {
  const $ = funState<AssistForm$>(init_ActionForm$())
  const container = enhance(
    h('div', { className: styles.AssistForm }, [
      DicePool(signal, {
        sendRoll: rollIt(roll, uid, $, username$),
        disableAdd$: funState(false),
        active$,
      }),
      h('div', { key: 'form', className: styles.form }, [
        FormHeading(signal, { title: 'Fortune' }),
        h('p', { key: 'subhead' }, ['See what the universe does']),
        Character(signal, { $: username$ }),
        Note(signal, { $: $.prop('note') }),
      ]),
    ]),
    hideUnless(active$, signal),
  )
  return container
}
