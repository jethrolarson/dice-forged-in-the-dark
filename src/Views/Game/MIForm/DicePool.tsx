import { Acc, append, index, removeAt } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import { important } from 'csx'
import { reject, repeat } from 'ramda'
import { FC } from 'react'
import { keyframes, stylesheet } from 'typestyle'
import { DieColor, DieResult, DieType } from '../../../Models/Die'
import { playAddSound } from '../../../sounds'
import { Die, nextColor } from '../Die'

const spin = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
})

const styles = stylesheet({
  dieButton: {
    cursor: 'grab',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
    animationName: spin,
    animationDuration: '1000ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    $nest: {
      '&:hover': {
        animationDuration: '5000ms',
      },
    },
  },
  DicePool: {
    border: '2px solid var(--border-color)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  diceBox: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    background: 'var(--bg-dice)',
    padding: 10,
    flexGrow: 1,
    gap: 20,
    borderRadius: '8px 8px 0 0',
  },
  rollButton: {
    fontWeight: 'bold',
    borderWidth: '2px 0 0',
    borderRadius: '0 0 5px 5px',
  },
})

export interface Rollable {
  type: DieType
  color: keyof typeof DieColor
  id?: string
}

export type DicePoolState = Rollable[]

export const removeDie = removeAt

export const removeDiceById = (id: string) => reject((r: Rollable) => r.id === id)

export const addDie =
  (type: DieType, color: keyof typeof DieColor, id?: string) =>
  (state: DicePoolState): DicePoolState => {
    void playAddSound()
    return append<Rollable>({ type, color, id })(state)
  }

export const addDice =
  (dice: Rollable[]) =>
  (state: DicePoolState): DicePoolState => {
    void playAddSound()
    return state.concat(dice)
  }

const idEquals =
  (id: string) =>
  (r: Rollable): boolean =>
    r.id === id

export const setDiceById =
  (quantity: number, type: DieType, color: keyof typeof DieColor, id: string) =>
  (state: DicePoolState): DicePoolState => {
    const withoutOld = reject(idEquals(id), state)
    if (withoutOld.length + quantity !== state.length) {
      void playAddSound()
    }
    return withoutOld.concat(repeat({ type, color, id }, quantity))
  }

export const changeColor = (idx: number) => Acc(index<Rollable>(idx)).prop('color').mod(nextColor)

const zeroDicePool: Rollable[] = [
  { type: 'd6', color: 'red' },
  { type: 'd6', color: 'red' },
]

const rollDie = (): number => Math.floor(Math.random() * 6) + 1

const rollPool = (dicePool: DicePoolState): DieResult[] => {
  const isZero = dicePool.length === 0
  const diceRolled: DieResult[] = (isZero ? zeroDicePool : dicePool).map(({ type: dieType, color: dieColor }) => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dieColor: DieColor[dieColor] as any,
    dieType,
    value: rollDie(),
  })) as DieResult[]
  return diceRolled
}

export const DicePool: FC<{
  state: FunState<DicePoolState>
  sendRoll: (results: DieResult[]) => unknown
  disabled: boolean
  disableRemove?: boolean
}> = ({ state, sendRoll, disabled, disableRemove = false }) => {
  const dicePool = state.get()
  const roll = () => sendRoll(rollPool(dicePool))
  return (
    <div className={styles.DicePool}>
      <div className={styles.diceBox}>
        {dicePool.map(({ type: d, color: c }, i) => (
          <button
            key={String(i) + d + c}
            onClick={(): unknown => !disableRemove && state.mod(removeDie(i))}
            className={styles.dieButton}
            title="Click to remove. Right-click to change color."
            onContextMenu={(e) => {
              e.preventDefault()
              state.mod(changeColor(i))
            }}>
            {d === 'd6' ? (
              <Die dieColor={DieColor[c]} dotColor={'#000'} value={6} size={38} />
            ) : (
              <div style={{ color: c }}>{d}</div>
            )}
          </button>
        ))}
      </div>
      <button onClick={roll} className={styles.rollButton} disabled={disabled}>
        ROLL {dicePool.length}
      </button>
    </div>
  )
}
