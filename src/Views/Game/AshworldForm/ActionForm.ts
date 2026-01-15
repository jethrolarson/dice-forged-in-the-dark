import { Component, h } from '@fun-land/fun-web'
import { FunState, funState } from '@fun-land/fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Character } from '../../../components/Character'
import { CheckDie, CheckDieState } from '../../../components/CheckDie'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'

const styles = stylesheet({
  ActionForm: {
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
    gap: 10,
  },
})

interface ActionForm$ {
  dicePool: DicePool$
  note: string
  gripes: CheckDieState
  knack: CheckDieState
  shit: CheckDieState
  hx: CheckDieState
  upperHand: CheckDieState
  amped: CheckDieState
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<ActionForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, dicePool, username } = state.get()
    const n = dicePool.pool.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Action',
      lines: ['Action'].filter(Boolean),
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

const init_ActionForm$ = (): ActionForm$ => ({
  dicePool: init_DicePool$(),
  gripes: false,
  knack: false,
  shit: false,
  hx: false,
  upperHand: false,
  amped: false,
  note: '',
  username: '',
})

export const ActionForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
}> = (signal, { uid, roll }) => {
  const $ = funState<ActionForm$>(init_ActionForm$())
  const dicePool$ = $.prop('dicePool')
  return h('div', { className: styles.ActionForm }, [
    DicePool(signal, {
      sendRoll: rollIt(roll, uid, $),
      disableAdd$: funState(true),
    }),
    h('div', { className: styles.form }, [
      FormHeading(signal, { title: 'Action' }),
      h('p', { key: 'subhead' }, ['Try something risky or uncertain']),

      CheckDie(signal, {
        id: 'knack',
        $: $.prop('knack'),
        dicePool$,
        color: 'white',
        label: h('span', null, ['We got a ', h('b', null, 'knack'), ' for this']),
      }),
      CheckDie(signal, {
        id: 'shit',
        $: $.prop('shit'),
        dicePool$,
        color: 'white',
        label: 'We got the right shit',
      }),
      CheckDie(signal, {
        id: 'amped',
        $: $.prop('amped'),
        dicePool$,
        color: 'red',
        label: h('span', null, [`We're `, h('b', null, ['juiced']), ' or in ', h('b', null, 'sync')]),
      }),
      CheckDie(signal, {
        id: 'upperHand',
        $: $.prop('upperHand'),
        dicePool$,
        color: 'white',
        label: "We fuckin' got this (Emcee)",
      }),
      CheckDie(signal, {
        id: 'gripes',
        $: $.prop('gripes'),
        dicePool$,
        color: 'yellow',
        label: h('span', null, [`We're taking a `, h('b', null, ["Devil's Bargain"])]),
      }),
      h('p', {}, ['Emcee tells you ', h('b', null, 'good'), ' and ', h('b', null, 'bad'), ' stuff']),
      Character(signal, { $: $.prop('username') }),
      Note(signal, { $: $.prop('note') }),
    ]),
  ])
}
