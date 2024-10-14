import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Character } from '../../../components/Character'
import { CheckDie, CheckDieState } from '../../../components/CheckDie'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { div, e, h } from '../../../util'
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

export const ActionForm = ({
  uid,
  roll,
  active,
}: {
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active: boolean
}) => {
  const $ = useFunState<ActionForm$>(init_ActionForm$())
  const { username, note } = $.get()
  const dicePool$ = $.prop('dicePool')
  return active
    ? div({ className: styles.ActionForm }, [
        e(DicePool, {
          key: 'dicepool',
          state: dicePool$,
          sendRoll: rollIt(roll, uid, $),
          disableRemove: false,
          disableAdd: true,
          disabled: !username || !note,
        }),
        div({ key: 'form', className: styles.form }, [
          e(FormHeading, { key: 'head', title: 'Action' }),
          h('p', { key: 'subhead' }, ['Try something risky or uncertain']),

          e(CheckDie, {
            key: 'knack',
            id: 'knack',
            $: $.prop('knack'),
            dicePool$,
            color: 'white',
            label: e('span', null, ['We got a ', e('b', null, 'knack'), ' for this']),
          }),
          e(CheckDie, {
            key: 'shit',
            id: 'shit',
            $: $.prop('shit'),
            dicePool$,
            color: 'white',
            label: 'We got the right shit',
          }),
          e(CheckDie, {
            key: 'amped',
            id: 'amped',
            $: $.prop('amped'),
            dicePool$,
            color: 'red',
            label: e('span', null, [`We're `, e('b', null, ['juiced']), ' or in ', e('b', null, 'sync')]),
          }),
          e(CheckDie, {
            key: 'upperHand',
            id: 'upperHand',
            $: $.prop('upperHand'),
            dicePool$,
            color: 'white',
            label: "We fuckin' got this (Emcee)",
          }),
          e(CheckDie, {
            key: 'gripes',
            id: 'gripes',
            $: $.prop('gripes'),
            dicePool$,
            color: 'yellow',
            label: e('span', null, [`We're taking a `, e('b', null, ["Devil's Bargain"])]),
          }),
          e('p', {}, ['Emcee tells you ', e('b', null, 'good'), ' and ', e('b', null, 'bad'), ' stuff']),
          e(Character, { key: 'character', $: $.prop('username') }),
          e(Note, { key: 'note', $: $.prop('note') }),
        ]),
      ])
    : null
}
