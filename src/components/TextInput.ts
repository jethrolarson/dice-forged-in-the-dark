import { FunState } from '@fun-land/fun-state'
import { Component, enhance, on, bindProperty, h } from '@fun-land/fun-web'

export interface TextInputProps {
  $: FunState<string>
  passThroughProps?: Partial<HTMLInputElement> & Record<string, unknown>
}

export const TextInput: Component<TextInputProps> = (signal, { $, passThroughProps }) =>
  enhance(
    h('input', { ...passThroughProps, value: $.get() }),
    bindProperty('value', $, signal),
    on('change', ({ currentTarget: { value } }) => $.set(value), signal),
  )
