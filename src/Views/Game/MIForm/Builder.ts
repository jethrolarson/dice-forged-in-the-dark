import { funState, FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { styles } from './Builder.css'

export const SubForm: Component<{
  onDone: () => unknown
  onCancel: () => unknown
  title: string | Element
  disabled: boolean
  children: Element[]
}> = (signal, { onDone, onCancel, title, disabled, children }) => {
  const openState = funState(false)

  const expanderButton = hx(
    'button',
    { signal, props: { className: styles.expander }, on: { click: () => openState.set(true) } },
    [title],
  )

  const openForm = OpenForm(signal, { onDone, onCancel, title, disabled, children, openState })
  openForm.classList.add(styles.hidden)

  // Toggle visibility based on state
  openState.watch(signal, (isOpen) => {
    expanderButton.classList.toggle(styles.hidden, isOpen)
    openForm.classList.toggle(styles.hidden, !isOpen)
  })

  return h('div', {}, [expanderButton, openForm])
}

const OpenForm: Component<{
  onDone: () => unknown
  onCancel: () => unknown
  title: string | Element
  disabled: boolean
  children: Element[]
  openState: FunState<boolean>
}> = (signal, { onDone, onCancel, title, disabled, children, openState }) => {
  const doneButton = hx(
    'button',
    {
      signal,
      props: { disabled, type: 'button' },
      on: {
        click: () => {
          onDone()
          openState.set(false)
        },
      },
    },
    ['Done'],
  )

  const clearButton = hx(
    'button',
    {
      signal,
      props: { type: 'button' },
      on: {
        click: () => {
          onCancel()
          openState.set(false)
        },
      },
    },
    ['Clear'],
  )

  return h('div', { className: styles.Builder }, [
    h('label', {}, [title]),
    ...children,
    h('div', { className: styles.footer }, [doneButton, clearButton]),
  ])
}
