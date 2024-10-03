import useFunState from '@fun-land/use-fun-state'
import { important } from 'csx'
import { stylesheet } from 'typestyle'
import { DieColor, DieColorType } from '../Models/Die'
import { button, div, e } from '../util'
import { Die, nextColor } from '../Views/Game/Die'

const styles = stylesheet({
  dieButton: {
    cursor: 'pointer',
    appearance: 'none',
    opacity: 0.6,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
    $nest: {
      '&:hover': {
        opacity: 1,
      },
    },
  },
  diceButtons: {
    justifySelf: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
  },
})

export const DiceSelection = ({
  addDie,
  add0Dice,
  reset,
}: {
  addDie: (color: DieColorType) => unknown
  add0Dice: () => unknown
  reset: () => unknown
}) => {
  const s = useFunState<{ dieColor: keyof typeof DieColor }>({
    dieColor: 'white',
  })
  const { dieColor } = s.get()
  return div(
    { className: styles.diceButtons },
    button(
      {
        key: 'd6',
        className: styles.dieButton,
        type: 'button',
        title: 'Add Die. Right-click to change color',
        onContextMenu: (e): void => {
          s.prop('dieColor').mod(nextColor)
          e.preventDefault()
        },
        onClick: () => addDie(s.prop('dieColor').get()),
      },
      e(Die, {
        key: 'd6_die',
        value: 6,
        dieColor,
        glow: false,
        pulse: false,
        dotColor: '#000',
        size: 28,
      }),
    ),
    button(
      {
        key: '0d6',
        className: styles.dieButton,
        type: 'button',
        title: '0d (roll 2 take lowest)',
        onClick: add0Dice,
      },
      e(Die, {
        key: '0d6_die',
        value: 6,
        dieColor: 'black',
        glow: false,
        pulse: false,
        dotColor: '#000',
        size: 28,
      }),
    ),
    button(
      {
        key: 'reset',
        className: styles.dieButton,
        type: 'button',
        onClick: reset,
      },
      'reset',
    ),
  )
}
