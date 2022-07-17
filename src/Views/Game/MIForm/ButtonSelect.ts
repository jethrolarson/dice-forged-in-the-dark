import { FunState } from '@fun-land/fun-state'
import { FC, ReactNode } from 'react'
import { classes, style, stylesheet } from 'typestyle'
import { h, div, button, label } from '../../../util'

const styles = stylesheet({
  buttons: {
    columnCount: 2,
    columnGap: 5,
  },
  label: {
    margin: '0 0 4px',
    fontSize: 14,
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

export type ButtonOption = string | { value: string; content: ReactNode }

export const ButtonSelect: FC<{
  selected: string
  options: ButtonOption[]
  className?: string
  columns?: number
  title: string
  tooltip?: string
  onSelect: (name: string) => unknown
}> = ({ selected, options, className, columns = 2, title, tooltip, onSelect }) => {
  return div({ className }, [
    title && label({ key: 'title', className: styles.label, title: tooltip }, [title]),
    div(
      { key: 'options', className: classes(styles.buttons, style({ columnCount: columns })) },
      options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value
        return button(
          {
            key: value,
            onClick: onSelect.bind(null, value),
            value,
            type: 'button',
            className: classes(styles.option, selected === value && styles.selected),
          },
          [typeof opt === 'string' ? opt : opt.content],
        )
      }),
    ),
  ])
}

export const FunButtonSelect: FC<{
  $: FunState<string>
  options: ButtonOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
}> = ({ $, options, className, columns, label, tooltip }) =>
  ButtonSelect({
    className,
    columns,
    title: label,
    tooltip,
    onSelect: (value) => $.mod((oldValue) => (oldValue === value ? '' : value)),
    options,
    selected: $.get(),
  })
