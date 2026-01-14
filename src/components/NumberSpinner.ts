import { FunState } from '@fun-land/fun-state'
import { decrement, increment } from 'fp-ts/lib/function'
import { Component, enhance, h, on } from '@fun-land/fun-web'
import { stylesheet } from 'typestyle'

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
        fontSize: '1.17rem',
        padding: '3px 8px',
      },
    },
  },
})

export const NumberSpinner: Component<{ state: FunState<number>; min: number; max: number }> = (
  signal,
  { state, min, max },
) => {
  const label = h('label', {}, [String(state.get())])
  const decButton = enhance(
    h('button', {}, ['-']),
    on('click', () => state.get() > min && state.mod(decrement), signal),
  )
  const incButton = enhance(
    h('button', {}, ['+']),
    on('click', () => state.get() < max && state.mod(increment), signal),
  )

  // Watch state and update label
  state.watch(signal, (v) => {
    label.textContent = String(v)
    decButton.disabled = v <= min
    incButton.disabled = v >= max
  })

  return h('div', { className: styles.NumberSpinner }, [decButton, label, incButton])
}
