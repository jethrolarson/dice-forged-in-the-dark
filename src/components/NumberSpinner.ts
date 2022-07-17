import { FunState } from '@fun-land/fun-state'
import { decrement, increment } from 'fp-ts/lib/function'
import { FC } from 'react'
import { stylesheet } from 'typestyle'
import { label, div, button } from '../util'

const styles = stylesheet({
  NumberSpinner: {
    display: 'flex',
    $nest: {
      label: {
        border: 'solid var(--border-color)',
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
  return div({ className: styles.NumberSpinner }, [
    button({ key: 'dec', onClick: () => v > min && state.mod(decrement) }, ['-']),
    label({ key: 'label' }, [v]),
    button({ key: 'inc', onClick: () => v < max && state.mod(increment) }, ['+']),
  ])
}
