import { FunState } from '@fun-land/fun-state'
import { decrement, increment } from 'fp-ts/lib/function'
import React, { FC } from 'react'
import { stylesheet } from 'typestyle'
import { borderColor } from '../colors'

const styles = stylesheet({
  NumberSpinner: {
    display: 'flex',
    $nest: {
      label: {
        border: 'solid ' + borderColor,
        borderWidth: '2px 0',
        padding: '3px 8px',
      },
      button: {
        fontSize: 14,
        padding: '3px 8px',
      },
    },
  },
})

export const NumberSpinner: FC<{ state: FunState<number>; min: number; max: number }> = ({ state, min, max }) => {
  const v = state.get()
  return (
    <div className={styles.NumberSpinner}>
      <button onClick={() => v > min && state.mod(decrement)}>-</button>
      <label>{v}</label>
      <button onClick={() => v < max && state.mod(increment)}>+</button>
    </div>
  )
}
