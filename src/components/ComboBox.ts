import { FunState } from '@fun-land/fun-state'
import { trim } from 'fp-ts/lib/string'
import { FC } from 'react'
import { h, label, e } from '../util'
import { TextInput } from './TextInput'

const DataList: FC<{ id: string; values: string }> = ({ id, values }) =>
  h(
    'datalist',
    { id },
    values
      .split(',')
      .map(trim)
      .map((v) => {
        const [val, label] = v.split('|')
        return h('option', { key: v, value: val }, [label])
      }),
  )

export const ComboBox: FC<{
  name: string
  $: FunState<string>
  tooltip?: string
  options: readonly string[]
  passThroughProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}> = ({ $: state, tooltip, name, options, passThroughProps }) =>
  label({ title: tooltip }, [
    e(TextInput, {
      key: 'input',
      passThroughProps: {
        ...passThroughProps,
        type: 'text',
        name,
        onFocus: () => state.set(''),
        list: `list${name}`,
      },
      state,
    }),
    e(DataList, { key: 'datalist', id: `list${name}`, values: options.join(',') }),
  ])
