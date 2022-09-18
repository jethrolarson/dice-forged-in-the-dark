import React, { FC } from 'react'
import { stylesheet } from 'typestyle'
import { important } from 'csx'
import { nextColor } from '../Die'
import { RollResult } from '../../../Models/GameModel'
import { DocumentReference } from '@firebase/firestore'
import { pipeVal } from '../../../common'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import Icon from 'react-icons-kit'
import { RollConfig, RollType, ValuationType } from '../../../Models/RollConfig'
import { Textarea } from '../../../components/Textarea'
import { TextInput } from '../../../components/TextInput'
import { accessDieColor, RollFormState } from './RollForm.state'
import { Sections } from './Sections'
import { FunState, merge } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { removeAt } from '@fun-land/accessor'
import { DieResult, DieColor, DieType } from '../../../Models/Die'
import { sendRoll } from './FormCommon'
import { DicePool, Rollable } from './DicePool'
import { DiceSelection } from '../../../components/DiceSelection'

const styles = stylesheet({
  form: {
    padding: 10,
  },
  formWrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 10,
  },
  formGrid: {
    display: 'grid',
    gridGap: 10,
    flexGrow: 2,
  },
  backButton: {
    border: 0,
    padding: '4px',
    marginRight: 4,
  },
  backButtonIcon: { $nest: { svg: { margin: '-2px 2px 0 0' } } },
  heading: {},
  rollTypes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 10,
  },
  note: {},
  noteInput: {
    width: '100%',
    height: 28,
    display: 'block',
    maxHeight: 200,
    resize: 'none',
  },
  dieButton: {
    cursor: 'pointer',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
  },
  diceButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  character: {},
  rollButton: {
    fontWeight: 'bold',
    borderWidth: '2px 0 0',
    borderRadius: '0 0 5px 5px',
  },
})

const rollDie = (): number => Math.floor(Math.random() * 6) + 1

const zeroDicePool: Rollable[] = [
  { type: 'd6', color: 'red' },
  { type: 'd6', color: 'red' },
]

const reset = (state: FunState<RollFormState>): void =>
  merge(state)({ note: '', rollType: '', rollState: ['', '', '', '', '', '', '', '', '', ''], dicePool: [] })

export const roll = (gdoc: DocumentReference, uid: string, state: FunState<RollFormState>) => (): void => {
  const { dicePool, rollState, note, rollType, username, valuationType } = state.get()
  const n = dicePool.length
  const isZero = n === 0
  if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
  const diceRolled: DieResult[] = (isZero ? zeroDicePool : dicePool).map(({ type: dieType, color: dieColor }) => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dieColor: DieColor[dieColor] as any,
    dieType,
    value: rollDie(),
  })) as DieResult[]
  const lines = rollState
  const roll: Omit<RollResult, 'id'> = {
    note,
    rollType,
    lines,
    username,
    isZero,
    diceRolled,
    date: Date.now(),
    kind: 'Roll',
    valuationType,
    uid,
  }
  sendRoll(gdoc, roll)
  reset(state)
}

export const RollForm: FC<{ rollConfig: RollConfig; gdoc: DocumentReference; uid: string }> = ({
  rollConfig,
  gdoc,
  uid,
}) => {
  const s = useFunState<RollFormState>({
    note: '',
    rollState: ['', '', '', '', '', '', '', '', '', ''], // TODO don't flatten this. Use a transform of rollConfig instead
    rollType: '',
    username: '',
    valuationType: 'Action',
    dicePool: [],
  })
  const { rollType, username, valuationType, dicePool } = s.get()

  const currentConfig = rollConfig.rollTypes!.find((rt) => rt.name === rollType)
  const removeDie = (idx: number): void => s.prop('dicePool').mod(removeAt(idx))
  const setDice = (id: string, dice: DieType[], color: keyof typeof DieColor): void => {
    s.prop('dicePool').mod((ds) => {
      const newDice = dice.map((type): Rollable => ({ type, color, id }))
      const xs: Rollable[] = ds.filter((d) => d.id !== id).concat(newDice)
      return xs
    })
  }
  const changeColor = (idx: number): void => s.focus(accessDieColor(idx)).mod(nextColor)

  return (
    <form className={styles.form} onSubmit={(e): void => e.preventDefault()}>
      {currentConfig ? (
        <div className={styles.formWrap}>
          <DicePool
            dicePool={dicePool}
            roll={roll(gdoc, uid, s)}
            disabled={!currentConfig.excludeCharacter && !username.length}
            removeDie={removeDie}
            changeColor={changeColor}
          />
          <div className={styles.formGrid}>
            <h3 className={styles.heading}>
              <button
                className={styles.backButton}
                onClick={(e): void => {
                  e.preventDefault()
                  reset(s)
                }}>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                <Icon icon={chevronLeft} size={18} className={styles.backButtonIcon} />
              </button>
              {currentConfig.name}
            </h3>
            <Sections state={s.prop('rollState')} sections={currentConfig.sections} setDice={setDice} />
            {!currentConfig.excludeCharacter && (
              <label className={styles.character}>
                <TextInput
                  passThroughProps={{
                    placeholder: 'Character',
                    type: 'text',
                    name: 'username',
                    required: true,
                  }}
                  state={s.prop('username')}
                />
              </label>
            )}
            {currentConfig?.valuationType === 'Ask' && (
              <label>
                Rules:{' '}
                <select
                  onChange={pipeVal((val) => s.prop('valuationType').set(val as ValuationType))}
                  value={valuationType}>
                  <option key="Action">Action</option>
                  <option key="Resist">Resist</option>
                  <option key="Sum">Sum</option>
                  <option key="Highest">Highest</option>
                  <option key="Lowest">Lowest</option>
                </select>
              </label>
            )}
            <label className={styles.note}>
              <Textarea
                passThroughProps={{
                  placeholder: 'Description',
                  className: styles.noteInput,
                  onInput: (e): void => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = `${target.scrollHeight + 2}px` // 2px is combined border width
                  },
                }}
                state={s.prop('note')}
              />
            </label>
            {!currentConfig.hideDice && <DiceSelection $={s.prop('dicePool')} />}
          </div>
        </div>
      ) : (
        <RollTypes s={s} rollTypes={rollConfig.rollTypes!} />
      )}
    </form>
  )
}

const RollTypes: FC<{ rollTypes: RollType[]; s: FunState<RollFormState> }> = ({ rollTypes, s }) => (
  <div className={styles.rollTypes}>
    {rollTypes.map((rt) => (
      <button
        key={rt.name}
        onClick={(): void => {
          s.prop('rollType').set(rt.name)
          const vt = rollTypes.find(({ name }) => name === rt.name)?.valuationType
          if (vt) {
            s.prop('valuationType').set(vt === 'Ask' ? 'Action' : vt)
          }
        }}>
        {rt.name}{' '}
      </button>
    ))}
  </div>
)
