import { FunState } from '@fun-land/fun-state'
import { Component, enhance, h, on } from '@fun-land/fun-web'
import { classes, style, stylesheet } from 'typestyle'
import { RollOption } from '../Models/RollConfig'

const styles = stylesheet({
  buttons: {
    columnCount: 2,
    columnGap: 5,
  },
  label: {
    margin: '0 0 4px',
    fontSize: '1.17rem',
  },
  threeCol: {},
  option: {
    display: 'block',
    width: '100%',
    marginBottom: 5,
  },
  selected: {
    background: 'var(--bg-button-selected) !important',
    borderColor: 'var(--bc-button-selected) !important',
    color: 'var(--fc-button-selected)',
    cursor: 'default',
  },
})

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
    return enhance(
      h(
        'button',
        {
          type: 'button',
          className: classes(styles.option, selected === optName && styles.selected),
        },
        [optName],
      ),
      on('click', () => onSelect(optName), signal),
    )
  })

  return h('div', { className }, [
    title && h('label', { className: styles.label, title: tooltip }, [title]),
    h('div', { className: classes(styles.buttons, style({ columnCount: columns })) }, buttonElements),
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
    const button = enhance(
      h('button', { type: 'button', className: styles.option }, [optName]),
      on('click', () => $.set(optName), signal),
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
      { className: classes(styles.buttons, style({ columnCount: columns })) },
      buttonElements.map((el) => el.button),
    ),
  ])
}
