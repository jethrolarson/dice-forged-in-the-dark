import { FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { RollOption } from '../Models/RollConfig'
import { classes } from '../util'
import { styles } from './ButtonSelect.css'

export const ButtonSelect: Component<{
  selected: string
  options: RollOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
  onSelect: (name: string) => unknown
}> = (signal, { selected, options, className, columns = 2, label: title, tooltip, onSelect }) => {
  const buttonElements = options.map((opt) => {
    const optName = typeof opt === 'string' ? opt : opt.name
    return hx(
      'button',
      {
        props: { type: 'button', className: classes(styles.option, selected === optName && styles.selected) },
        signal,
        on: { click: () => onSelect(optName) },
      },
      [optName],
    )
  })

  return h('div', { className }, [
    title && h('label', { className: styles.label, title: tooltip }, [title]),
    h('div', { className: styles.buttons, style: { '--column-count': columns } as Record<string, string | number> }, buttonElements),
  ])
}

export const FunButtonSelect: Component<{
  $: FunState<string>
  options: RollOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
}> = (signal, { $, options, className, columns = 2, label: title, tooltip }) => {
  const buttonElements = options.map((opt) => {
    const optName = typeof opt === 'string' ? opt : opt.name
    const button = hx(
      'button',
      { props: { type: 'button', className: styles.option }, signal, on: { click: () => $.set(optName) } },
      [optName],
    )

    return { button, optName }
  })

  // Watch state and update button styling
  $.watch(signal, (selected) => {
    buttonElements.forEach(({ button, optName }) => {
      button.className = classes(styles.option, selected === optName && styles.selected)
    })
  })

  return h('div', { className }, [
    title && h('label', { className: styles.label, title: tooltip }, [title]),
    h(
      'div',
      { className: styles.buttons, style: { '--column-count': columns } as Record<string, string | number> },
      buttonElements.map((el) => el.button),
    ),
  ])
}
