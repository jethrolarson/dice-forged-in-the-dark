import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePoolState } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Character } from '../../../components/Character'
import { Factor, factorDie, FactorSelect } from './FactorSelect'
import { init_Power$, Power$, PowerSelect } from './PowerSelect'
import { Approach$, init_Approach$, ApproachSelect } from './ApproachSelect'
import { e, h, div } from '../../../util'

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
  approach$: Approach$
  power$: Power$
  factor$: Factor
  dicePool: DicePoolState
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<ActionForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, approach$, power$, dicePool, username } = state.get()
    const n = dicePool.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Action',
      lines: [
        'Action',
        approach$.approach ? `${approach$.tier} ${approach$.approach}` : '',
        power$.power ? `${power$.tier} ${power$.power}` : '',
      ].filter(Boolean),
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
  dicePool: [factorDie],
  approach$: init_Approach$,
  note: '',
  power$: init_Power$,
  factor$: Factor.Even,
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
      disabled: !username || !note,
    }),
    div({ key: 'form', className: styles.form }, [
      e(FormHeading, { key: 'head', title: 'Action Roll' }),
      h('p', { key: 'subhead' }, ['Do something risky or stressful']),
      e(ApproachSelect, { key: 'approach', $: $.prop('approach$'), dicePool$ }),
      e(PowerSelect, { key: 'power', $: $.prop('power$'), dicePool$ }),
      e(FactorSelect, { key: 'factor', $: $.prop('factor$'), dicePool$ }),
      e(Character, { key: 'character', $: $.prop('username') }),
      e(Note, { key: 'note', $: $.prop('note') }),
    ]),
  ])
}

/* <FunButtonSelect
  columns={1}
  label="Position"
  options={[
    {
      value: 'Controlled',
      content: (
        <>
          <TierLabel tier="⓵" /> Controlled
        </>
      ),
    },
    {
      value: 'Risky',
      content: (
        <>
          <TierLabel tier="⓶" /> Risky
        </>
      ),
    },
    {
      value: 'Desperate',
      content: (
        <>
          <TierLabel tier="⓷" /> Desperate
        </>
      ),
    },
  ]}
  $={$.prop('position')}
/>
<FunButtonSelect
  columns={1}
  label="Effect"
  options={['None', 'Limited', 'Standard', 'Great']}
  $={$.prop('effect')}
/> */
