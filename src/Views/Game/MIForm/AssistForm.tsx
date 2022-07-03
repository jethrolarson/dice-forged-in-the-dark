import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { flow } from 'fp-ts/lib/function'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from './Note'
import { NewRoll } from '../RollForm/FormCommon'
import { addDice, DicePool, DicePoolState, removeDiceById } from './DicePool'
import { Character } from './Character'
import { TextInput } from '../../../components/TextInput'
import { Tier, TierSelect } from './TierSelect'
import { FormHeading } from './FormHeading'
import { DiceSelection } from './DiceSelection'
import { useEffect } from 'react'

const styles = stylesheet({
  AssistForm: {
    minHeight: 200,
    display: 'grid',
    gridTemplateColumns: '140px auto',
    gap: 10,
    margin: 10,
    $nest: {
      p: {
        margin: 0,
        fontSize: 14,
        fontStyle: 'italic',
      },
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
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
  back,
}: {
  uid: string
  back: () => unknown
  roll: (rollResult: NewRoll) => unknown
}) => {
  const $ = useFunState<AssistForm$>(init_ActionForm$())
  const { tier, pool, username, note } = $.get()
  const disabled = !username || !note || !pool
  const _addDice = flow(addDice, $.prop('dicePool').mod)
  const _removeDice = flow(removeDiceById, $.prop('dicePool').mod)
  useEffect(() => {
    _removeDice('assist')
    if (tier && pool) {
      _addDice([{ type: 'd6', color: 'white', id: 'assist' }])
    }
  }, [tier, pool])
  const dicePool$ = $.prop('dicePool')
  return (
    <div className={styles.AssistForm}>
      <DicePool state={dicePool$} sendRoll={rollIt(roll, uid, $)} disableRemove={false} disabled={disabled} />
      <div className={styles.form}>
        <FormHeading back={back}>Assist Roll</FormHeading>
        <p>You dive in to assist another player's action at the last second.</p>
        <p>Spend and roll one die of your choice</p>
        <div className={styles.poolSelect}>
          <TierSelect $={$.prop('tier')} />
          <TextInput state={$.prop('pool')} passThroughProps={{ name: 'pool', placeholder: 'Approach or Power' }} />
        </div>
        <Character $={$.prop('username')} />
        <Note $={$.prop('note')} />
        <DiceSelection $={dicePool$} />
      </div>
    </div>
  )
}
