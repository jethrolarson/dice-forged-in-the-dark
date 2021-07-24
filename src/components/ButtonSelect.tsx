import { important } from 'csx'
import { FunState } from 'fun-state'
import { FC } from 'react'
import { classes, stylesheet } from 'typestyle'

const styles = stylesheet({
  ButtonSelect: {
    columnCount: 2,
    columnGap: 5,
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

export const ButtonSelect: FC<{ state: FunState<string>; options: string[]; className?: string }> = ({
  state,
  options,
  className,
}) => {
  const selected = state.get()
  return (
    <div className={classes(styles.ButtonSelect, className)}>
      {options.map((opt) => (
        <button
          onClick={(): void => state.set(opt)}
          type="button"
          value={opt}
          className={classes(styles.option, opt === selected && styles.selected)}>
          {opt}
        </button>
      ))}
    </div>
  )
}
