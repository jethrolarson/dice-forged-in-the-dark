import { FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { classes, style, stylesheet } from 'typestyle'

const styles = stylesheet({
  buttons: {
    columnCount: 2,
    columnGap: 5,
  },
  label: {
    margin: '0 0 4px',
    fontSize: '1.17rem',
  },
  option: {
    display: 'block',
    width: '100%',
    marginBottom: 5,
  },
  selected: {
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  },
})

export type ButtonOption = string | { value: string; content: string | Element }

export const ButtonSelect: Component<{
  selected: string
  options: ButtonOption[]
  className?: string
  columns?: number
  title: string
  tooltip?: string
  onSelect: (name: string) => unknown
}> = (signal, { selected, options, className, columns = 2, title, tooltip, onSelect }) => {
  const buttonElements = options.map((opt) => {
    const value = typeof opt === 'string' ? opt : opt.value
    const content = typeof opt === 'string' ? opt : opt.content
    return hx(
      'button',
      {
        signal,
        props: { value, type: 'button', className: classes(styles.option, selected === value && styles.selected) },
        on: { click: () => onSelect(value) },
      },
      [content],
    )
  })

  return h('div', { className }, [
    title && h('label', { className: styles.label, title: tooltip }, [title]),
    h('div', { className: classes(styles.buttons, style({ columnCount: columns })) }, buttonElements),
  ])
}

export const FunButtonSelect: Component<{
  $: FunState<string>
  options: ButtonOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
}> = (signal, { $, options, className, columns = 2, label, tooltip }) => {
  const buttonElements = options.map((opt) => {
    const value = typeof opt === 'string' ? opt : opt.value
    const content = typeof opt === 'string' ? opt : opt.content
    const button = hx('button', { signal, props: { value, type: 'button', className: styles.option }, on: { click: () => $.mod((oldValue) => (oldValue === value ? '' : value)) } }, [content])
    return { button, value }
  })

  // Watch state and update button styling
  $.watch(signal, (selected) => {
    buttonElements.forEach(({ button, value }) => {
      button.className = classes(styles.option, selected === value && styles.selected)
    })
  })

  return h('div', { className }, [
    label && h('label', { className: styles.label, title: tooltip }, [label]),
    h(
      'div',
      { className: classes(styles.buttons, style({ columnCount: columns })) },
      buttonElements.map((el) => el.button),
    ),
  ])
}
