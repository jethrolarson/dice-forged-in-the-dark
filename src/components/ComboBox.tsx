import { FunState } from '@fun-land/fun-state'
import { trim } from 'fp-ts/lib/string'
import React, { FC } from 'react'
import { TextInput } from './TextInput'

const DataList: FC<{ id: string; values: string }> = ({ id, values }) => (
  <datalist id={id}>
    {values
      .split(',')
      .map(trim)
      .map((v) => {
        const [val, label] = v.split('|')
        return <option key={v} value={val} children={label} />
      })}
  </datalist>
)

export const ComboBox: FC<{
  name: string
  label: string
  $: FunState<string>
  tooltip?: string
  options: readonly string[]
}> = ({ label, $: state, tooltip, name, options }) => {
  return (
    <label title={tooltip}>
      <TextInput
        passThroughProps={{
          placeholder: label,
          type: 'text',
          name,
          onFocus: () => state.set(''),
          list: `list${name}`,
        }}
        state={state}
      />
      <DataList id={`list${name}`} values={options.join(',')} />
    </label>
  )
}
