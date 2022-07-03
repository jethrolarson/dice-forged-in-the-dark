import { FunState } from '@fun-land/fun-state'
import React, { FC } from 'react'
import { classes, style, stylesheet } from 'typestyle'
import { RollOption } from '../Models/RollConfig'

const styles = stylesheet({
  buttons: {
    columnCount: 2,
    columnGap: 5,
  },
  label: {
    margin: '0 0 4px',
    fontSize: 14,
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

export const ButtonSelect: FC<{
  selected: string
  options: RollOption[]
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
          const optName = typeof opt === 'string' ? opt : opt.name
          return (
            <button
              key={optName}
              onClick={onSelect.bind(null, optName)}
              type="button"
              className={classes(styles.option, selected === optName && styles.selected)}>
              {optName}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const FunButtonSelect: FC<{
  $: FunState<string>
  options: RollOption[]
  className?: string
  columns?: number
  label: string
  tooltip?: string
}> = ({ $, options, columns, label, tooltip }) => (
  <ButtonSelect
    columns={columns}
    label={label}
    tooltip={tooltip}
    onSelect={$.set}
    options={options}
    selected={$.get()}
  />
)
