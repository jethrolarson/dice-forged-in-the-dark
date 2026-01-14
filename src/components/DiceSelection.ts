import { Component, enhance, funState, h, on } from '@fun-land/fun-web'
import { important } from 'csx'
import { stylesheet } from 'typestyle'
import { DieColor, DieColorType } from '../Models/Die'
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

export const DiceSelection: Component<{
  addDie: (color: DieColorType) => unknown
  add0Dice: () => unknown
  reset: () => unknown
}> = (signal, { addDie, add0Dice, reset }) => {
  const s = funState<{ dieColor: keyof typeof DieColor }>({
    dieColor: 'white',
  })
  const { dieColor } = s.get()

  const addDieButton = enhance(
    h(
      'button',
      {
        key: 'd6',
        className: styles.dieButton,
        type: 'button',
        title: 'Add Die. Right-click to change color',
      },
      Die(signal, {
        value: 6,
        dieColor: DieColor[dieColor],
        glow: false,
        pulse: false,
        dotColor: '#000',
        size: 28,
      }),
    ),
    on(
      'contextmenu',
      (e): void => {
        s.prop('dieColor').mod(nextColor)
        e.preventDefault()
      },
      signal,
    ),
    on('click', () => addDie(s.prop('dieColor').get()), signal),
  )

  const roll0Button = enhance(
    h(
      'button',
      {
        key: '0d6',
        className: styles.dieButton,
        type: 'button',
        title: '0d (roll 2 take lowest)',
      },
      Die(signal, {
        value: 6,
        dieColor: DieColor['black'],
        glow: false,
        pulse: false,
        dotColor: '#000',
        size: 28,
      }),
    ),
    on('click', add0Dice, signal),
  )

  return h('div', { className: styles.diceButtons }, [
    addDieButton,
    roll0Button,
    h(
      'button',
      {
        key: 'reset',
        className: styles.dieButton,
        type: 'button',
        onClick: reset,
      },
      'reset',
    ),
  ])
}
