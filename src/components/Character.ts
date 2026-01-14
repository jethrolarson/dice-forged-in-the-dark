import { FunState } from '@fun-land/fun-state'
import { Component } from '@fun-land/fun-web'
import { TextInput } from './TextInput'

export const Character: Component<{
  $: FunState<string>
  passThroughProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}> = (signal, { $, passThroughProps }) =>
  TextInput(signal, {
    passThroughProps: {
      placeholder: 'Character',
      type: 'text',
      name: 'username',
      ...passThroughProps,
    },
    state: $,
  })
