import React, { FC } from 'react'
import useFunState, { FunState, merge } from 'fun-state'
import { classes, style, stylesheet } from 'typestyle'
import { range, trim } from 'ramda'
import { color, important } from 'csx'
import { Die } from './Die'
import { borderColor } from '../../colors'
import { LoadedGameState, RollResult } from '../../Models/GameModel'
import { DocRef } from '../../hooks/useDoc'
import { pipeVal } from '../../common'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { index } from 'accessor-ts'
import Icon from 'react-icons-kit'
import { RollOptionGroup, RollOptionSection, ValuationType } from '../../Models/RollConfig'
import { Textarea } from '../../components/Textarea'
import { TextInput } from '../../components/TextInput'
import { ButtonSelect } from '../../components/ButtonSelect'

const styles = stylesheet({
  form: {
    padding: '2px 10px 20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateAreas:
      '"roll roll roll" "roll roll roll" "note note note" "player valuation valuation" "dice dice dice"',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 10,
  },
  rollTypes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 10,
  },
  diceButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gridArea: 'dice',
  },
  dieButton: {
    cursor: 'pointer',
    appearance: 'none',
    opacity: 0.6,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
  },
  dieButtonOn: {
    opacity: 1,
    transition: 'opacity 0.2s',
  },
  rollOptionSection: {
    display: 'flex',
    gap: 10,
    gridColumn: '1/4',
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

interface RollFormState {
  rollType: string
  note: string
  rollState: string[]
  username: string
  hoveredDieButton: number
  valuationType: ValuationType
}

const OptGroup: FC<{ optionGroup: RollOptionGroup; index: number; state: FunState<string> }> = ({
  optionGroup: og,
  index,
  state,
}) =>
  og.fixedOptions && og.rollOptions ? (
    <ButtonSelect state={state} options={og.rollOptions} className={style({ gridColumn: '1/4' })} />
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

export const RollForm: FC<{ state: FunState<LoadedGameState>; gdoc: DocRef | null; uid: string }> = ({
  state,
  gdoc,
  uid,
}) => {
  const { rollConfig } = state.get()

  const s = useFunState<RollFormState>({
    note: '',
    rollState: ['', '', '', ''],
    rollType: '',
    username: '',
    hoveredDieButton: -1,
    valuationType: 'Action',
  })
  const { note, rollType, username, hoveredDieButton, rollState, valuationType } = s.get()
  const reset = (): void => merge(s)({ note: '', rollType: '', rollState: ['', '', '', ''] })

  const currentConfig = rollConfig.rollTypes.find((rt) => rt.name === rollType)
  const roll = (n: number) => (): void => {
    if (gdoc) {
      const roll: Omit<RollResult, 'id'> = {
        note,
        rollType,
        lines: rollState,
        username,
        isZero: n === 0,
        results: range(0, n === 0 ? 2 : n).map(rollDie),
        date: Date.now(),
        kind: 'Roll',
        valuationType,
        uid,
      }
      gdoc
        .collection('rolls')
        .add(roll)
        .catch((e) => {
          console.error(e)
          alert('failed to add roll')
        })
      reset()
    }
  }
  return (
    <form
      className={styles.form}
      onSubmit={(e): void => {
        e.preventDefault()
      }}>
      {currentConfig ? (
        <div className={styles.formGrid}>
          <h3 className={style({ gridColumn: '1/4' })}>
            <a
              href="#/"
              onClick={(e): void => {
                e.preventDefault()
                reset()
              }}>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
              <Icon icon={chevronLeft} size={18} className={style({ $nest: { svg: { margin: '-2px 2px 0 0' } } })} />
            </a>
            {currentConfig.name}
          </h3>
          {currentConfig?.optionGroups?.map((og, i) => (
            <OptGroup optionGroup={og} index={i} state={s.prop('rollState').focus(index(i))} />
          ))}

          {currentConfig?.sections?.map((section: RollOptionSection) => (
            <div key={section.name} className={styles.rollOptionSection}>
              {section.optionGroups.map((og, i) => (
                <OptGroup optionGroup={og} index={i} state={s.prop('rollState').focus(index(i))} />
              ))}
            </div>
          ))}

          {currentConfig?.valuationType === 'Ask' && (
            <label className={style({ gridArea: 'valuation' })}>
              Valuation:{' '}
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
          <label className={style({ gridArea: 'player' })}>
            <TextInput
              passThroughProps={{
                placeholder: 'Character',
                type: 'text',
                name: 'username',
              }}
              state={s.prop('username')}
            />
          </label>
          <label className={style({ gridArea: 'note' })}>
            <Textarea
              passThroughProps={{
                placeholder: 'Note',
                className: style({ width: '100%', height: 44, display: 'block', maxHeight: 200, resize: 'vertical' }),
              }}
              state={s.prop('note')}
            />
          </label>
          <div className={styles.diceButtons} onMouseLeave={(): void => s.prop('hoveredDieButton').set(-1)}>
            {range(0, 7).map((n: number) => (
              <button
                key={`btn${n}`}
                disabled={rollType === ''}
                title={`Roll ${n} ${n === 1 ? 'die' : 'dice'}`}
                onMouseEnter={(): void => s.prop('hoveredDieButton').set(n)}
                className={classes(styles.dieButton, hoveredDieButton >= n ? styles.dieButtonOn : undefined)}
                type="button"
                onClick={roll(n)}>
                <Die
                  value={n === 0 ? 1 : n}
                  dieColor={color(n === 0 ? '#000' : borderColor)}
                  border={n === 0}
                  glow={hoveredDieButton === n}
                  pulse={hoveredDieButton === n}
                  dotColor={color(n === 0 ? borderColor : '#000')}
                  size={44}
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.rollTypes}>
          {rollConfig.rollTypes.map((rt) => (
            <button
              key={rt.name}
              onClick={(): void => {
                s.prop('rollType').set(rt.name)
                const vt = rollConfig.rollTypes.find(({ name }) => name === rt.name)?.valuationType
                if (vt) {
                  s.prop('valuationType').set(vt === 'Ask' ? 'Action' : vt)
                }
              }}>
              {rt.name}{' '}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
