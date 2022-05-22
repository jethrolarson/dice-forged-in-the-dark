import { FunState } from '@fun-land/fun-state'
import { important } from 'csx'
import React, { FC } from 'react'
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
  state: FunState<string>
  options: string[]
  className?: string
  columns: number
  label: string
  tooltip?: string
}> = ({ state, options, className, columns, label, tooltip }) => {
  const selected = state.get()
  return (
    <div className={className}>
      {label && (
        <label className={styles.label} title={tooltip}>
          {label}
        </label>
      )}
      <div className={classes(styles.buttons, style({ columnCount: columns }))}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={(): void => state.mod((st) => (st == opt ? '' : opt))}
            type="button"
            value={opt}
            className={classes(styles.option, opt === selected && styles.selected)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
