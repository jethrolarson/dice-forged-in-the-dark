import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { style, stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePoolState } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Character } from '../../../components/Character'
import { e, h, div } from '../../../util'
import { CheckDie, CheckDieState } from '../../../components/CheckDie'

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
  dicePool: DicePoolState
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
    const n = dicePool.length
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
  dicePool: [],
  gripes: false,
  knack: false,
  shit: false,
  hx: false,
  upperHand: false,
  amped: false,
  note: '',
  username: '',
})

export const ActionForm = ({ uid, roll }: { uid: string; roll: (rollResult: NewRoll) => unknown }) => {
  const $ = useFunState<ActionForm$>(init_ActionForm$())
  const { username, note } = $.get()
  const dicePool$ = $.prop('dicePool')
  return div({ className: styles.ActionForm }, [
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
        key: 'gripes',
        id: 'gripes',
        $: $.prop('gripes'),
        dicePool$,
        color: 'white',
        label: e('span', null, ['Your ', e('b', null, 'gripes'), " ain't buggin"]),
      }),
      e(CheckDie, {
        key: 'knack',
        id: 'knack',
        $: $.prop('knack'),
        dicePool$,
        color: 'white',
        label: e('span', null, ['You got a ', e('b', null, 'knack'), ' for this']),
      }),
      e(CheckDie, {
        key: 'shit',
        id: 'shit',
        $: $.prop('shit'),
        dicePool$,
        color: 'white',
        label: 'You got the right shit',
      }),
      e(CheckDie, {
        key: 'hx',
        id: 'hx',
        $: $.prop('hx'),
        dicePool$,
        color: 'white',
        label: e('span', null, ['You got ', e('b', null, 'Hx')]),
      }),
      e(CheckDie, {
        key: 'upperHand',
        id: 'upperHand',
        $: $.prop('upperHand'),
        dicePool$,
        color: 'white',
        label: "You fuckin' got this",
      }),
      e(CheckDie, {
        key: 'amped',
        id: 'amped',
        $: $.prop('amped'),
        dicePool$,
        color: 'red',
        label: e('span', null, [`You're `, e('b', null, ['amped']), ' up']),
      }),
      e(Character, { key: 'character', $: $.prop('username') }),
      e(Note, { key: 'note', $: $.prop('note') }),
    ]),
  ])
}
