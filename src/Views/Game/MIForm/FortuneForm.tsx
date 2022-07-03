import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from './Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePoolState } from './DicePool'
import { TextInput } from '../../../components/TextInput'
import { FormHeading } from './FormHeading'
import { DiceSelection } from './DiceSelection'

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
  dicePool: DicePoolState
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, dicePool, pool, username } = state.get()
    const n = dicePool.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Fortune',
      lines: ['Fortune', pool].filter(Boolean),
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
  username: '',
})

export const FortuneForm = ({
  uid,
  roll,
  back,
}: {
  uid: string
  back: () => unknown
  roll: (rollResult: NewRoll) => unknown
}) => {
  const $ = useFunState<AssistForm$>(init_ActionForm$())
  const { note } = $.get()
  const dicePool$ = $.prop('dicePool')
  return (
    <div className={styles.AssistForm}>
      <DicePool state={dicePool$} sendRoll={rollIt(roll, uid, $)} disableRemove={false} disabled={!note} />
      <div className={styles.form}>
        <FormHeading back={back}>Fortune Roll</FormHeading>
        <p>Did a non-player entity succeed in their plans?</p>
        <p>OP rolls 0-3 dice based on standing of entity</p>
        <div className={styles.poolSelect}>
          <TextInput state={$.prop('pool')} passThroughProps={{ name: 'pool', placeholder: 'Context' }} />
        </div>
        <TextInput
          passThroughProps={{
            placeholder: 'Entity',
            type: 'text',
            name: 'username',
          }}
          state={$.prop('username')}
        />
        <Note $={$.prop('note')} />
        <DiceSelection $={dicePool$} />
      </div>
    </div>
  )
}
