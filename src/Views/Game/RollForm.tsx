import React, { FC } from 'react'
import useFunState, { FunState, merge } from 'fun-state'
import * as AX from 'accessor-ts'
import { style, stylesheet } from 'typestyle'
import { trim } from 'ramda'
import { color, important } from 'csx'
import { Die } from './Die'
import { borderColor } from '../../colors'
import { DieColor, DieResult, DieType, LoadedGameState, RollResult } from '../../Models/GameModel'
import { DocumentReference, addDoc, collection, getFirestore } from '@firebase/firestore'
import { pipeVal } from '../../common'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { append, index, removeAt } from 'accessor-ts'
import Icon from 'react-icons-kit'
import { RollOptionGroup, RollOptionSection, RollType, ValuationType } from '../../Models/RollConfig'
import { Textarea } from '../../components/Textarea'
import { TextInput } from '../../components/TextInput'
import { ButtonSelect } from '../../components/ButtonSelect'
import { playAddSound } from '../../sounds'

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
    gridTemplateColumns: '1fr 1fr',
    gridGap: 10,
    flexGrow: 2,
  },
  backButton: { $nest: { svg: { margin: '-2px 2px 0 0' } } },
  heading: { gridColumn: '1/3' },
  rollTypes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 10,
  },
  note: {
    gridColumn: '1/3',
  },
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
    gridColumn: '1/3',
  },
  character: {
    gridColumn: '1/3',
  },

  dieButton: {
    cursor: 'pointer',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
  },
  rollOptionSection: {
    display: 'flex',
    gap: 10,
    gridColumn: '1/3',
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

const DataList: FC<{ id: string; values: string }> = ({ id, values }) => (
  <datalist id={id}>
    {values
      .split(',')
      .map(trim)
      .map((v) => {
        const [val, label] = v.split('|')
        return <option key={v} value={val} children={label} />
      })}
  </datalist>
)

type Rollable = { type: DieType; color: DieColor }

interface RollFormState {
  rollType: string
  note: string
  rollState: string[]
  username: string
  valuationType: ValuationType
  dicePool: Rollable[]
}

const OptGroup: FC<{ optionGroup: RollOptionGroup; index: number; state: FunState<string> }> = ({
  optionGroup: og,
  index,
  state,
}) =>
  og.fixedOptions && og.rollOptions ? (
    <ButtonSelect
      state={state}
      options={og.rollOptions}
      columns={og.columns ?? 2}
      label={og.showLabel ? og.name : ''}
      className={style({ flexGrow: 1 })}
    />
  ) : (
    <label key={`optGroup${og.name}${index}`}>
      <TextInput
        passThroughProps={{
          placeholder: og.name,
          type: 'text',
          name: og.name,
          list: `list${index}`,
        }}
        state={state}
      />
      {og.rollOptions && <DataList id={`list${index}`} values={og.rollOptions.join(',')} />}
    </label>
  )

const zeroDicePool: Rollable[] = [
  { type: DieType.d6, color: DieColor.red },
  { type: DieType.d6, color: DieColor.red },
]
export const RollForm: FC<{ state: FunState<LoadedGameState>; gdoc: DocumentReference; uid: string }> = ({
  state,
  gdoc,
  uid,
}) => {
  const { rollConfig } = state.get()

  const s = useFunState<RollFormState>({
    note: '',
    rollState: ['', '', '', '', '', ''], // TODO don't flatten this. Use a transform of rollConfig instead
    rollType: '',
    username: '',
    valuationType: 'Action',
    dicePool: [],
  })
  const { note, rollType, username, rollState, valuationType, dicePool } = s.get()
  const reset = (): void => merge(s)({ note: '', rollType: '', rollState: ['', '', '', '', '', ''], dicePool: [] })

  const currentConfig = rollConfig.rollTypes.find((rt) => rt.name === rollType)
  const roll = (): void => {
    const n = dicePool.length
    const isZero = n === 0
    const diceRolled: DieResult[] = (isZero ? zeroDicePool : dicePool).map(({ type: dieType, color: dieColor }) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      dieColor: dieColor as any,
      dieType,
      value: rollDie(),
    })) as DieResult[]
    const lines = currentConfig?.sections
      ? currentConfig.sections
          .flatMap((s) => s.optionGroups)
          .map((og, i) => (og.showLabel ? og.name + ': ' : '') + rollState[i])
      : rollState
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

  const addDie = (type: DieType, color: DieColor): void => {
    s.prop('dicePool').mod(append({ type, color }))
    void playAddSound()
  }
  const removeDie = (index: number): void => s.prop('dicePool').mod(removeAt(index))
  const changeColor = (index: number): void => s.prop('dicePool').focus(AX.index(index)).prop('color').mod(nextColor)
  let idx = -1
  return (
    <form className={styles.form} onSubmit={(e): void => e.preventDefault()}>
      {currentConfig ? (
        <div className={styles.formWrap}>
          <DicePool dicePool={dicePool} roll={roll} removeDie={removeDie} changeColor={changeColor} />
          <div className={styles.formGrid}>
            <h3 className={styles.heading}>
              <a
                href="#/"
                onClick={(e): void => {
                  e.preventDefault()
                  reset()
                }}>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                <Icon icon={chevronLeft} size={18} className={styles.backButton} />
              </a>
              {currentConfig.name}
            </h3>
            {currentConfig?.optionGroups?.map((og, i) => (
              <OptGroup key={i} optionGroup={og} index={i} state={s.prop('rollState').focus(index(i))} />
            ))}

            {currentConfig?.sections?.map((section: RollOptionSection) => (
              <div key={section.name} className={styles.rollOptionSection}>
                {section.optionGroups.map((og) => {
                  idx++
                  return (
                    <OptGroup
                      key={String(idx) + og.name}
                      optionGroup={og}
                      index={idx}
                      state={s.prop('rollState').focus(index(idx))}
                    />
                  )
                })}
              </div>
            ))}
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
            <DiceSelection addDie={addDie} />
          </div>
        </div>
      ) : (
        <RollTypes s={s} rollTypes={rollConfig.rollTypes} />
      )}
    </form>
  )
}

export const dieColors = [DieColor.white, DieColor.yellow, DieColor.red, DieColor.green, DieColor.purple]

const DicePool: FC<{
  dicePool: Rollable[]
  roll: () => unknown
  removeDie: (index: number) => unknown
  changeColor: (index: number) => void
}> = ({ dicePool, roll, removeDie, changeColor }) => {
  return (
    <div className={styles.DicePool}>
      <div className={styles.diceBox}>
        {dicePool.map(({ type: d, color: c }, i) =>
          d === DieType.d6 ? (
            <button
              key={String(i) + d + c}
              onClick={(): unknown => removeDie(i)}
              className={styles.dieButton}
              onContextMenu={(e) => {
                e.preventDefault()
                changeColor(i)
              }}>
              <Die dieColor={color(c)} dotColor={color('#000')} value={6} size={38} />
            </button>
          ) : (
            <div style={{ color: c }}>
              {d} c{c}
            </div>
          ),
        )}
      </div>
      <button onClick={roll} className={styles.rollButton}>
        ROLL {dicePool.length}
      </button>
    </div>
  )
}

const nextColor = (c: DieColor): DieColor => {
  const i = dieColors.indexOf(c) + 1
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return dieColors[i === dieColors.length ? 0 : i]!
}

const DiceSelection: FC<{ addDie: (dieType: DieType, dieColor: DieColor) => unknown }> = ({ addDie }) => {
  const s = useFunState({
    hoveredDieButton: -1,
    dieColor: DieColor.white,
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
          addDie(DieType.d6, dieColor)
        }}>
        <Die
          value={6}
          dieColor={color(dieColor)}
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
