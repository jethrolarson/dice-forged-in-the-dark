import useFunState from '@fun-land/use-fun-state'
import { hsla } from 'csx'
import { ReactNode } from 'react'
import { stylesheet } from 'typestyle'
import { button, div, label } from '../../../util'

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

export const SubForm = ({
  onDone,
  onCancel,
  title,
  disabled,
  children,
}: {
  onDone: () => unknown
  onCancel: () => unknown
  title: ReactNode
  disabled: boolean
  children: ReactNode
}) => {
  const state = useFunState(false)
  const isOpen = state.get()
  const setOpen = state.set
  return isOpen
    ? div({ className: styles.Builder }, [
        label({ key: 'title' }, [title]),
        children,
        div({ key: 'footer', className: styles.footer }, [
          button(
            {
              key: 'done',
              onClick: (): void => {
                onDone()
                setOpen(false)
              },
              disabled,
            },
            ['Done'],
          ),
          button(
            {
              key: 'clear',
              onClick: (): void => {
                onCancel()
                setOpen(false)
              },
            },
            ['Clear'],
          ),
        ]),
      ])
    : button({ className: styles.expander, onClick: () => setOpen(true) }, [title])
}
