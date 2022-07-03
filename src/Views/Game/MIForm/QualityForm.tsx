import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from './Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePoolState } from './DicePool'
import { Character } from './Character'
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
        fontSize: 12,
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

interface QualityForm$ {
  pool: string
  dicePool: DicePoolState
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<QualityForm$>) =>
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
    state.set(init_QualityForm$())
  }

const init_QualityForm$ = (): QualityForm$ => ({
  dicePool: [],
  note: '',
  pool: '',
  username: '',
})

export const QualityForm = ({
  uid,
  roll,
  back,
}: {
  uid: string
  back: () => unknown
  roll: (rollResult: NewRoll) => unknown
}) => {
  const $ = useFunState<QualityForm$>(init_QualityForm$())
  const { note } = $.get()
  const dicePool$ = $.prop('dicePool')
  return (
    <div className={styles.AssistForm}>
      <DicePool state={dicePool$} sendRoll={rollIt(roll, uid, $)} disableRemove={false} disabled={!note} />
      <div className={styles.form}>
        <FormHeading back={back}>Quality Roll</FormHeading>
        <p>You succeed but how well did it go?</p>
        <p>Roll T dice where T is highest Tier of your remaining dice)</p>
        <div className={styles.poolSelect}>
          <TextInput state={$.prop('pool')} passThroughProps={{ name: 'pool', placeholder: 'Context' }} />
        </div>
        <Character $={$.prop('username')} />
        <Note $={$.prop('note')} />
        <DiceSelection $={dicePool$} />
      </div>
    </div>
  )
}
