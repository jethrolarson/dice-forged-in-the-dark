import { FunState } from '@fun-land/fun-state'
import { Component, hx } from '@fun-land/fun-web'

export interface TextInputProps {
  $: FunState<string>
  passThroughProps?: Partial<HTMLInputElement> & Record<string, unknown>
}

export const TextInput: Component<TextInputProps> = (signal, { $, passThroughProps }) =>
  hx('input', {
    signal,
    props: passThroughProps,
    bind: { value: $ },
    on: { change: ({ currentTarget: { value } }) => $.set(value) },
  })
