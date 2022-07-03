import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { important } from 'csx'
import { FC } from 'react'
import { stylesheet } from 'typestyle'
import { DieColor } from '../../../Models/Die'
import { Die, nextColor } from '../Die'
import { addDie, DicePoolState } from './DicePool'

const styles = stylesheet({
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
})

export const DiceSelection: FC<{ $: FunState<DicePoolState> }> = ({ $ }) => {
  const s = useFunState<{ dieColor: keyof typeof DieColor }>({
    dieColor: 'white',
  })
  const { dieColor } = s.get()
  const _addDie = () => $.mod(addDie('d6', dieColor))
  return (
    <div className={styles.diceButtons}>
      <button
        className={styles.dieButton}
        type="button"
        title="Add Die. Right-click to change color"
        onContextMenu={(e): void => {
          s.prop('dieColor').mod(nextColor)
          e.preventDefault()
        }}
        onClick={_addDie}>
        <Die value={6} dieColor={DieColor[dieColor]} glow={false} pulse={false} dotColor={'#000'} size={44} />
      </button>
    </div>
  )
}
