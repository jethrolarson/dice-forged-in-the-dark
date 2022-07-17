import { important } from 'csx'
import { FC } from 'react'
import { stylesheet } from 'typestyle'
import { DieColor, DieType } from '../../../Models/Die'
import { button, div, e } from '../../../util'
import { Die } from '../Die'

export interface Rollable {
  type: DieType
  color: keyof typeof DieColor
  id?: string
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

export const DicePool: FC<{
  dicePool: Rollable[]
  roll: () => unknown
  removeDie: (index: number) => unknown
  changeColor: (index: number) => void
  disabled: boolean
}> = ({ dicePool, roll, removeDie, changeColor, disabled }) => {
  return div({ className: styles.DicePool }, [
    div(
      { className: styles.diceBox },
      dicePool.map(({ type: d, color: c }, i) =>
        button(
          {
            key: String(i) + d + c,
            onClick: (): unknown => removeDie(i),
            className: styles.dieButton,
            onContextMenu: (e) => {
              e.preventDefault()
              changeColor(i)
            },
          },
          [
            d === 'd6'
              ? e(Die, { dieColor: DieColor[c], dotColor: '#000', value: 6, size: 38 })
              : div({ style: { color: c } }, [d]),
          ],
        ),
      ),
    ),
    button({ onClick: roll, className: styles.rollButton, disabled }, ['ROLL ', dicePool.length]),
  ])
}
