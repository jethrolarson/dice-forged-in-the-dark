import { important } from 'csx'
import { FunState } from 'fun-state'
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
    backgroundColor: important('#49d08b'),
    borderColor: important('#49d08b'),
    color: '#201c29',
    cursor: 'default',
  },
})

export const ButtonSelect: FC<{
  state: FunState<string>
  options: string[]
  className?: string
  columns: number
  label: string
}> = ({ state, options, className, columns, label }) => {
  const selected = state.get()
  return (
    <div className={className}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={classes(styles.buttons, style({ columnCount: columns }))}>
        {options.map((opt) => (
          <button
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
