import { funState, FunRead, FunState, mapRead } from '@fun-land/fun-state'
import { Component, h, hx, bindListChildren, enhance } from '@fun-land/fun-web'
import { DieColor, DieType } from '../../../Models/Die'
import { Die, DieVisualState } from '../Die'
import { prop } from '@fun-land/accessor'
import { styles } from './DicePool.css'

export interface Rollable {
  type: DieType
  color: keyof typeof DieColor
  id: string
}

export const DicePool: Component<{
  dicePool$: FunState<Rollable[]>
  roll: () => unknown
  removeDie: (index: number) => unknown
  changeColor: (index: number) => void
  disabled$: FunRead<boolean>
}> = (signal, { dicePool$, roll, removeDie, changeColor, disabled$ }) => {
  const rollButton = hx(
    'button',
    {
      signal,
      props: { className: styles.rollButton, type: 'button' },
      bind: {
        textContent: mapRead(dicePool$, (dicePool) => `ROLL ${dicePool.length}`),
        disabled: disabled$,
      },
      on: { click: () => roll() },
    },
    [],
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

        const dieVisualState: FunState<DieVisualState> = funState({
          dieColor: DieColor[c],
          dotColor: '#000',
        })

        // Watch for color changes on this die
        dieState.watch(childSignal, (die) => {
          dieVisualState.prop('dieColor').set(DieColor[die.color])
        })

        const btn = h('button', { className: styles.dieButton }, [
          d === 'd6'
            ? Die(childSignal, { value: 6, size: 38, $: dieVisualState })
            : h('div', { style: { color: c } }, [d]),
        ])

        return hx('button', { signal: childSignal, props: { className: styles.dieButton, type: 'button' }, on: { click: () => removeDie(index), contextmenu: (e) => { e.preventDefault(); changeColor(index) } } }, btn)
      },
    }),
  )

  return h('div', { className: styles.DicePool }, [diceBox, rollButton])
}
