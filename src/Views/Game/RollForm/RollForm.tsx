import React, { FC } from 'react'
import { stylesheet } from 'typestyle'
import { range } from 'ramda'
import { color, important } from 'csx'
import { Die } from '../Die'
import { borderColor } from '../../../colors'
import { LoadedGameState, RollResult } from '../../../Models/GameModel'
import { DocumentReference, addDoc, collection, getFirestore } from '@firebase/firestore'
import { pipeVal } from '../../../common'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import Icon from 'react-icons-kit'
import { RollType, ValuationType } from '../../../Models/RollConfig'
import { Textarea } from '../../../components/Textarea'
import { TextInput } from '../../../components/TextInput'
import { playAddSound } from '../../../sounds'
import { Rollable, RollFormState } from './RollForm.state'
import { Sections } from './Sections'
import { FunState, merge } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { append, index, removeAt } from '@fun-land/accessor'
import { DieResult, DieColor, DieType } from '../../../Models/Die'

const styles = stylesheet({
  form: {
    padding: '2px 10px 20px',
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
  diceButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  character: {},

  dieButton: {
    cursor: 'pointer',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
  },
  DicePool: {
    border: `2px solid ${borderColor}`,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  diceBox: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    gap: 10,
  },
  rollButton: {
    backgroundColor: '#64a7a3',
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '0 0 5px 5px',
    $nest: { '&:hover': { backgroundColor: borderColor } },
  },
})

const rollDie = (): number => Math.floor(Math.random() * 6) + 1

const zeroDicePool: Rollable[] = [
  { type: 'd6', color: 'red' },
  { type: 'd6', color: 'red' },
]
export const RollForm: FC<{ state: FunState<LoadedGameState>; gdoc: DocumentReference; uid: string }> = ({
  state,
  gdoc,
  uid,
}) => {
  const { rollConfig } = state.get()

  const s = useFunState<RollFormState>({
    note: '',
    rollState: ['', '', '', '', '', '', '', '', '', ''], // TODO don't flatten this. Use a transform of rollConfig instead
    rollType: '',
    username: '',
    valuationType: 'Action',
    dicePool: [],
  })
  const { note, rollType, username, rollState, valuationType, dicePool } = s.get()
  const reset = (): void =>
    merge(s)({ note: '', rollType: '', rollState: ['', '', '', '', '', '', '', '', '', ''], dicePool: [] })

  const currentConfig = rollConfig.rollTypes.find((rt) => rt.name === rollType)
  const roll = (): void => {
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
    addDoc(collection(gdoc, 'rolls'), roll).catch((e) => {
      console.error(e)
      alert('failed to add roll')
    })
    reset()
  }

  const addDie = (type: DieType, color: keyof typeof DieColor, id?: string): void => {
    s.prop('dicePool').mod(append<Rollable>({ type, color, id }))
    void playAddSound()
  }
  const removeDie = (idx: number): void => s.prop('dicePool').mod(removeAt(idx))
  const setDice = (id: string, count: number, type: DieType, color: keyof typeof DieColor): void =>
    s.prop('dicePool').mod((dice) => {
      const newDice = range(0, count).map(() => ({ type, color, id }))
      return dice.filter((d) => d.id !== id).concat(newDice)
    })
  const changeColor = (idx: number): void => s.prop('dicePool').focus(index(idx)).prop('color').mod(nextColor)

  return (
    <form className={styles.form} onSubmit={(e): void => e.preventDefault()}>
      {currentConfig ? (
        <div className={styles.formWrap}>
          <DicePool dicePool={dicePool} roll={roll} removeDie={removeDie} changeColor={changeColor} />
          <div className={styles.formGrid}>
            <h3 className={styles.heading}>
              <button
                className={styles.backButton}
                onClick={(e): void => {
                  e.preventDefault()
                  reset()
                }}>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                <Icon icon={chevronLeft} size={18} className={styles.backButtonIcon} />
              </button>
              {currentConfig.name}
            </h3>
            {currentConfig.sections && (
              <Sections state={s.prop('rollState')} sections={currentConfig.sections} setDice={setDice} />
            )}
            {!currentConfig.excludeCharacter && (
              <label className={styles.character}>
                <TextInput
                  passThroughProps={{
                    placeholder: 'Character',
                    type: 'text',
                    name: 'username',
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
            {!currentConfig.hideDice && <DiceSelection addDie={addDie} />}
          </div>
        </div>
      ) : (
        <RollTypes s={s} rollTypes={rollConfig.rollTypes} />
      )}
    </form>
  )
}

export const dieColors = ['white', 'yellow', 'red', 'green', 'purple'] as const

const DicePool: FC<{
  dicePool: Rollable[]
  roll: () => unknown
  removeDie: (index: number) => unknown
  changeColor: (index: number) => void
}> = ({ dicePool, roll, removeDie, changeColor }) => {
  return (
    <div className={styles.DicePool}>
      <div className={styles.diceBox}>
        {dicePool.map(({ type: d, color: c }, i) => (
          <button
            key={String(i) + d + c}
            onClick={(): unknown => removeDie(i)}
            className={styles.dieButton}
            onContextMenu={(e) => {
              e.preventDefault()
              changeColor(i)
            }}>
            {d === 'd6' ? (
              <Die dieColor={color(DieColor[c])} dotColor={color('#000')} value={6} size={38} />
            ) : (
              <div style={{ color: c }}>{d}</div>
            )}
          </button>
        ))}
      </div>
      <button onClick={roll} className={styles.rollButton}>
        ROLL {dicePool.length}
      </button>
    </div>
  )
}

const nextColor = (c: keyof typeof DieColor): keyof typeof DieColor => {
  const i = dieColors.indexOf(c) + 1
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return dieColors[i === dieColors.length ? 0 : i]!
}

const DiceSelection: FC<{ addDie: (dieType: DieType, dieColor: keyof typeof DieColor) => unknown }> = ({ addDie }) => {
  const s = useFunState<{ hoveredDieButton: number; dieColor: keyof typeof DieColor }>({
    hoveredDieButton: -1,
    dieColor: 'white',
  })
  const { dieColor, hoveredDieButton } = s.get()
  return (
    <div className={styles.diceButtons} onMouseLeave={(): void => s.prop('hoveredDieButton').set(-1)}>
      <button
        onMouseEnter={(): void => s.prop('hoveredDieButton').set(6)}
        className={styles.dieButton}
        type="button"
        title="Add Die. Right-click to change color"
        onContextMenu={(e): void => {
          s.prop('dieColor').mod(nextColor)
          e.preventDefault()
        }}
        onClick={(): void => {
          addDie('d6', dieColor)
        }}>
        <Die
          value={6}
          dieColor={color(DieColor[dieColor])}
          glow={hoveredDieButton === 6}
          pulse={hoveredDieButton === 6}
          dotColor={color('#000')}
          size={44}
        />
      </button>
    </div>
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
