import { FunState } from '@fun-land/fun-state'
import React, { FC, ReactNode } from 'react'
import { classes, style, stylesheet } from 'typestyle'

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
  label: string
  tooltip?: string
  onSelect: (name: string) => unknown
}> = ({ selected, options, className, columns = 2, label, tooltip, onSelect }) => {
  return (
    <div className={className}>
      {label && (
        <label className={styles.label} title={tooltip}>
          {label}
        </label>
      )}
      <div className={classes(styles.buttons, style({ columnCount: columns }))}>
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value
          return (
            <button
              key={value}
              onClick={onSelect.bind(null, value)}
              value={value}
              type="button"
              className={classes(styles.option, selected === value && styles.selected)}>
              {typeof opt === 'string' ? opt : opt.content}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const FunButtonSelect: FC<{
  $: FunState<string>
  options: ButtonOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
}> = ({ $, options, className, columns, label, tooltip }) => (
  <ButtonSelect
    className={className}
    columns={columns}
    label={label}
    tooltip={tooltip}
    onSelect={(value) => $.mod((oldValue) => (oldValue === value ? '' : value))}
    options={options}
    selected={$.get()}
  />
)
