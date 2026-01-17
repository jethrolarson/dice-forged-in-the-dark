import { Component, h } from '@fun-land/fun-web'
import { DieResult } from '../../../Models/Die'
import { ResultDie } from './ResultDie'
import * as styles from './RollLog.css'

export const DiceDisplay: Component<{
  diceRolled: DieResult[]
  highestIndex: number
  excludedIndex: number
  isLast: boolean
}> = (signal, { diceRolled, highestIndex, excludedIndex, isLast }) => {
  const len = diceRolled.length
  return h(
    'div',
    { className: styles.dice },
    diceRolled.map(({ dieColor, value: d }, i) =>
      ResultDie(signal, {
        size: len > 4 ? 36 : len === 1 ? 50 : 36,
        value: d,
        highest: highestIndex === i,
        excluded: excludedIndex === i,
        isLast,
        dieColor,
      }),
    ),
  )
}
