import useFunState from '@fun-land/use-fun-state'
import { hsla } from 'csx'
import React, { FC, ReactNode } from 'react'
import { stylesheet } from 'typestyle'

const styles = stylesheet({
  Builder: {
    display: 'grid',
    gap: 10,
    border: '1px solid var(--border-color)',
    backgroundColor: hsla(0, 0, 0, 0.3).toString(),
    padding: 5,
  },
  expander: {
    borderWidth: 1,
    textAlign: 'left',
    $nest: {
      '&::before': {
        float: 'right',
        content: '"ᐁ"',
      },
    },
  },
  footer: {
    marginTop: 10,
    display: 'grid',
    gap: 5,
    gridTemplateColumns: '1fr 1fr',
  },
})

export const SubForm: FC<{
  onDone: () => unknown
  onCancel: () => unknown
  label: ReactNode
  disabled: boolean
  children: ReactNode
}> = ({ onDone, onCancel, label, disabled, children }) => {
  const state = useFunState(false)
  const isOpen = state.get()
  const setOpen = state.set
  return isOpen ? (
    <div className={styles.Builder}>
      <label>{label}</label>
      {children}
      <div className={styles.footer}>
        <button
          onClick={(): void => {
            onDone()
            setOpen(false)
          }}
          disabled={disabled}>
          Done
        </button>
        <button
          onClick={(): void => {
            onCancel()
            setOpen(false)
          }}>
          Clear
        </button>
      </div>
    </div>
  ) : (
    <button className={styles.expander} onClick={() => setOpen(true)}>
      {label}
    </button>
  )
}
