import { hsla } from 'csx'
import { stylesheet } from 'typestyle'
import { funState, FunState } from '@fun-land/fun-state'
import { Component, enhance, h, onTo } from '@fun-land/fun-web'

const styles = stylesheet({
  Builder: {
    display: 'grid',
    gap: 10,
    border: '1px solid var(--border-color)',
    backgroundColor: hsla(0, 0, 0, 0.3).toString(),
    padding: 5,
  },
  expander: {
    borderWidth: 1,
    textAlign: 'left',
    $nest: {
      '&::before': {
        float: 'right',
        content: '"ᐁ"',
      },
    },
  },
  footer: {
    marginTop: 10,
    display: 'grid',
    gap: 5,
    gridTemplateColumns: '1fr 1fr',
  },
  hidden: {
    display: 'none',
  },
})

export const SubForm: Component<{
  onDone: () => unknown
  onCancel: () => unknown
  title: string | Element
  disabled: boolean
  children: Element[]
}> = (signal, { onDone, onCancel, title, disabled, children }) => {
  const openState = funState(false)

  const expanderButton = enhance(
    h('button', { className: styles.expander }, [title]),
    onTo('click', () => openState.set(true), signal),
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
  const doneButton = enhance(
    h('button', { disabled }, ['Done']),
    onTo(
      'click',
      () => {
        onDone()
        openState.set(false)
      },
      signal,
    ),
  )

  const clearButton = enhance(
    h('button', {}, ['Clear']),
    onTo(
      'click',
      () => {
        onCancel()
        openState.set(false)
      },
      signal,
    ),
  )

  return h('div', { className: styles.Builder }, [
    h('label', {}, [title]),
    ...children,
    h('div', { className: styles.footer }, [doneButton, clearButton]),
  ])
}
