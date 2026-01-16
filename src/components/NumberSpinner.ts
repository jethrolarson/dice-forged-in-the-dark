import { FunState, mapRead } from '@fun-land/fun-state'
import { decrement, increment } from 'fp-ts/lib/function'
import { Component, h, hx } from '@fun-land/fun-web'
import { styles } from './NumberSpinner.css'

export const NumberSpinner: Component<{ state: FunState<number>; min: number; max: number }> = (
  signal,
  { state, min, max },
) => {
  const label = hx('label', { signal, props: { }, bind: { textContent: mapRead(state, String) } }, [])
  const decButton = hx(
      'button', { signal, on: { click: () => state.get() > min && state.mod(decrement) } }, ['-'],
    )
  
  const incButton = hx(
    'button', { signal, on: { click: () => state.get() < max && state.mod(increment) } }, ['+'],
  )

  // Watch state and update label
  state.watch(signal, (v) => {
    label.textContent = String(v)
    decButton.disabled = v <= min
    incButton.disabled = v >= max
  })

  return h('div', { className: styles.NumberSpinner }, [decButton, label, incButton])
}
