import { Component } from '@fun-land/fun-web'
import { TextInput, TextInputProps } from './TextInput'

export const Character: Component<TextInputProps> = (signal, { $, passThroughProps }) =>
  TextInput(signal, {
    passThroughProps: {
      placeholder: 'Character',
      type: 'text',
      name: 'username',
      ...passThroughProps,
    },
    $,
  })
