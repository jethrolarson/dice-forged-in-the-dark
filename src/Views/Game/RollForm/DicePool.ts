import { FunState } from '@fun-land/fun-state'
import { Component, enhance, h, bindListChildren, on } from '@fun-land/fun-web'
import { important } from 'csx'
import { stylesheet } from 'typestyle'
import { DieColor, DieType } from '../../../Models/Die'
import { Die } from '../Die'
import { prop } from '@fun-land/accessor'

export interface Rollable {
  type: DieType
  color: keyof typeof DieColor
  id: string
}

const styles = stylesheet({
  dieButton: {
    cursor: 'pointer',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    backgroundColor: important('transparent'),
    border: 'none',
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
    justifyContent: 'center',
    background: 'var(--bg-dice)',
    flexGrow: 1,
    gap: 10,
  },
  rollButton: {
    fontWeight: 'bold',
    borderWidth: '2px 0 0',
    borderRadius: '0 0 5px 5px',
  },
})

export const DicePool: Component<{
  dicePool$: FunState<Rollable[]>
  roll: () => unknown
  removeDie: (index: number) => unknown
  changeColor: (index: number) => void
  disabled$: FunState<boolean>
}> = (signal, { dicePool$, roll, removeDie, changeColor, disabled$ }) => {
  const rollButton = enhance(
    h('button', { className: styles.rollButton }, ['ROLL 0']),
    on('click', () => roll(), signal),
  )

  const diceBox = enhance(
    h('div', { className: styles.diceBox }, []),

    // Use keyedChildren for dynamic dice list
    bindListChildren({
      signal,
      state: dicePool$,
      key: prop<Rollable>()('id'),
      row: ({ state: dieState, signal: childSignal }) => {
        const die = dieState.get()
        const { type: d, color: c } = die

        // Find index for this die
        const dicePool = dicePool$.get()
        const index = dicePool.findIndex((d) => d.id === die.id)

        const btn = h('button', { className: styles.dieButton }, [
          d === 'd6'
            ? Die(childSignal, { dieColor: DieColor[c], dotColor: '#000', value: 6, size: 38 })
            : h('div', { style: { color: c } }, [d]),
        ])

        return enhance<HTMLButtonElement>(
          btn,
          on('click', () => removeDie(index), childSignal),
          on(
            'contextmenu',
            (e) => {
              const x = e.currentTarget
              e.preventDefault()
              changeColor(index)
            },
            childSignal,
          ),
        )
      },
    }),
  )

  // Watch dice pool length for roll button
  dicePool$.watch(signal, (dicePool) => {
    rollButton.textContent = `ROLL ${dicePool.length}`
  })

  // Watch disabled state
  disabled$.watch(signal, (disabled) => {
    rollButton.disabled = disabled
  })

  return h('div', { className: styles.DicePool }, [diceBox, rollButton])
}
