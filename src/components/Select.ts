import { FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'

export const Select: Component<{ options: readonly string[]; $: FunState<string> }> = (signal, { $, options }) =>
  hx(
    'select',
    { signal, bind: { value: $ }, on: { change: ({ currentTarget: { value } }) => $.set(value) } },
    options.map((op) => h('option', { value: op }, [op])),
  )
