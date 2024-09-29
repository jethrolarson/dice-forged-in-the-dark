import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { important } from 'csx'
import { stylesheet } from 'typestyle'
import { DieColor } from '../Models/Die'
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
  },
})

export const DiceSelection = ({ addDie }: { addDie: (id?: string) => unknown }) => {
  const s = useFunState<{ dieColor: keyof typeof DieColor }>({
    dieColor: 'white',
  })
  const { dieColor } = s.get()
  return div({ className: styles.diceButtons }, [
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
        onClick: () => addDie(),
      },
      [
        e(Die, {
          key: 'd6_die',
          value: 6,
          dieColor: DieColor[dieColor],
          glow: false,
          pulse: false,
          dotColor: '#000',
          size: 28,
        }),
      ],
    ),
  ])
}
