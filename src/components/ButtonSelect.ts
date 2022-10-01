import { FunState } from '@fun-land/fun-state'
import { classes, style, stylesheet } from 'typestyle'
import { RollOption } from '../Models/RollConfig'
import { h, div, label } from '../util'

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
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  },
})

export const ButtonSelect = ({
  selected,
  options,
  className,
  columns = 2,
  label: title,
  tooltip,
  onSelect,
}: {
  selected: string
  options: RollOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
  onSelect: (name: string) => unknown
}) =>
  div({ className }, [
    title && label({ className: styles.label, title: tooltip }, [title]),
    h(
      'div',
      { className: classes(styles.buttons, style({ columnCount: columns })) },
      options.map((opt) => {
        const optName = typeof opt === 'string' ? opt : opt.name
        return h(
          'button',
          {
            key: optName,
            onClick: onSelect.bind(null, optName),
            type: 'button',
            className: classes(styles.option, selected === optName && styles.selected),
          },
          [optName],
        )
      }),
    ),
  ])

export const FunButtonSelect = ({
  $,
  options,
  columns,
  label,
  tooltip,
}: {
  $: FunState<string>
  options: RollOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
}) =>
  ButtonSelect({
    columns,
    label,
    tooltip,
    onSelect: $.set,
    options,
    selected: $.get(),
  })
