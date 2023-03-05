import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { flow } from 'fp-ts/lib/function'
import { style, stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { addDice, DicePool, DicePoolState, removeDiceById } from '../../../components/DicePool'
import { Character } from '../../../components/Character'
import { TextInput } from '../../../components/TextInput'
import { Tier, tierColorMap, TierSelect } from './TierSelect'
import { FormHeading } from '../../../components/FormHeading'
import { DiceSelection } from '../../../components/DiceSelection'
import { useEffect } from 'react'
import { e, h, div } from '../../../util'
import { ComboBox } from '../../../components/ComboBox'
import { approaches } from './ApproachSelect'
import { powers } from './PowerSelect'

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
  pool: string
  tier: Tier
  dicePool: DicePoolState
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, dicePool, tier, pool, username } = state.get()
    const n = dicePool.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Action',
      lines: ['Assist', `${tier} ${pool}`],
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

const init_ActionForm$ = (): AssistForm$ => ({
  dicePool: [],
  note: '',
  pool: '',
  tier: Tier.T0,
  username: '',
})

export const AssistForm = ({
  uid,
  roll,
  active,
}: {
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active: boolean
}) => {
  const $ = useFunState<AssistForm$>(init_ActionForm$())
  const { tier, pool, username, note } = $.get()
  const disabled = !username || !note || !pool
  const _addDice = flow(addDice, $.prop('dicePool').mod)
  const _removeDice = flow(removeDiceById, $.prop('dicePool').mod)
  useEffect(() => {
    _removeDice('assist')
    if (tier && pool) {
      _addDice([{ type: 'd6', color: tierColorMap[tier], id: 'assist' }])
    }
  }, [tier, pool])
  const dicePool$ = $.prop('dicePool')
  return active
    ? div({ className: styles.AssistForm }, [
        e(DicePool, {
          key: 'dicepool',
          state: dicePool$,
          sendRoll: rollIt(roll, uid, $),
          disableRemove: false,
          disabled,
        }),
        div({ key: 'form', className: styles.form }, [
          e(FormHeading, { key: 'head', title: 'Assist Roll' }),
          h('p', { key: 'subhead' }, ["Dive in to assist another player's action at the last second"]),
          h('p', { key: 'subhead2' }, ['Spend and roll one die of your choice']),
          div({ key: 'pool', className: styles.poolSelect }, [
            e(TierSelect, { key: 'tier', $: $.prop('tier') }),
            e(ComboBox, {
              key: 'pool',
              $: $.prop('pool'),
              name: 'pool',
              data: [...approaches, ...powers],
              placeholder: 'Approach or Power',
              required: tier !== Tier.T0,
            }),
          ]),
          e(Character, { key: 'character', $: $.prop('username'), passThroughProps: { required: true } }),
          e(Note, { key: 'note', $: $.prop('note'), passThroughProps: { required: true } }),
        ]),
      ])
    : null
}
