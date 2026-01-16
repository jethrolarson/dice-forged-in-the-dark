import { Component, h, hx } from '@fun-land/fun-web'
import { DieColor, DieColorType } from '../Models/Die'
import { Die, DieVisualState, nextColor } from '../Views/Game/Die'
import { funState, FunState } from '@fun-land/fun-state'
import { styles } from './DiceSelection.css'

export const DiceSelection: Component<{
  addDie: (color: DieColorType) => unknown
  add0Dice: () => unknown
  reset: () => unknown
}> = (signal, { addDie, add0Dice, reset }) => {
  const dieState: FunState<DieVisualState> = funState({
    dieColor: DieColor.white,
    dotColor: '#000',
  })

  let currentColorKey: DieColorType = 'white'

  const addDieButton = hx(
    'button',
    {
      signal,
      props: {
        className: styles.dieButton,
        type: 'button',
        title: 'Add Die. Right-click to change color',
      },
      on: {
        contextmenu: (e) => {
          currentColorKey = nextColor(currentColorKey)
          dieState.prop('dieColor').set(DieColor[currentColorKey])
          e.preventDefault()
        },
        click: () => addDie(currentColorKey),
      },
    },
    Die(signal, { value: 6, $: dieState, size: 28 }),
  )

  const roll0State: FunState<DieVisualState> = funState({
    dieColor: DieColor.black,
    dotColor: '#000',
  })

  const roll0Button = hx(
    'button',
    {
      signal,
      props: {
        className: styles.dieButton,
        type: 'button',
        title: '0d (roll 2 take lowest)',
      },
      on: { click: () => add0Dice() },
    },
    Die(signal, { value: 6, $: roll0State, size: 28 }),
  )

  return h('div', { className: styles.diceButtons }, [
    addDieButton,
    roll0Button,
    hx(
      'button',
      {
        props: { type: 'button', className: styles.dieButton },
        signal,
        on: { click: () => reset() },
      },
      'reset',
    ),
  ])
}
