import { FunState } from '@fun-land/fun-state'
import { Component, hx } from '@fun-land/fun-web'

export interface TextareaProps {
  $: FunState<string>
  passThroughProps?: Partial<HTMLTextAreaElement> & Record<string, unknown>
}

export const Textarea: Component<TextareaProps, HTMLTextAreaElement> = (signal, { $, passThroughProps }) =>
  hx('textarea', {
    signal,
    props: passThroughProps,
    bind: { value: $ },
    on: { input: ({ currentTarget: { value } }) => $.set(value) },
  })
