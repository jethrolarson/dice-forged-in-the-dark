import { FunState } from '@fun-land/fun-state'
import { e } from '../util'
import Combobox, { ComboboxProps } from 'react-widgets/Combobox'
import { classes, stylesheet } from 'typestyle'

const styles = stylesheet({
  Combobox: {},
  required: {
    $nest: {
      '.rw-widget-container': {
        border: '1px solid red',
      },
    },
  },
})

export const ComboBox = ({
  $,
  required,
  ...props
}: {
  $: FunState<string>
  required?: boolean
} & ComboboxProps<string>) =>
  e(Combobox<string>, {
    ...props,
    className: classes(styles.Combobox, props.className, required && $.get() === '' && styles.required),
    dropUp: true,
    onChange: (v) => $.set(v),
    value: $.get(),
  })
