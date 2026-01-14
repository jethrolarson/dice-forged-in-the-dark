import { FunState } from '@fun-land/fun-state'
import { Component, on, h, enhance, bindProperty } from '@fun-land/fun-web'

export interface TextareaProps {
  $: FunState<string>
  passThroughProps?: Partial<HTMLTextAreaElement> & Record<string, unknown>
}

export const Textarea: Component<TextareaProps, HTMLTextAreaElement> = (signal, { $, passThroughProps }) =>
  enhance(
    h('textarea', { ...passThroughProps }),
    bindProperty('value', $, signal),
    on('input', ({ currentTarget: { value } }) => $.set(value), signal),
  )