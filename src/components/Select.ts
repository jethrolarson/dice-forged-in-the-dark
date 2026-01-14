import { FunState } from '@fun-land/fun-state'
import { enhance, Component, h, on, bindProperty } from '@fun-land/fun-web'

export const Select: Component<{ options: readonly string[]; $: FunState<string> }> = (signal, { $, options }) => {
  const optionEls = options.map((op) => h('option', { value: op }, [op]))

  return enhance(
    h('select', {}, optionEls),
    bindProperty('value', $, signal),
    on('change', ({ currentTarget: { value } }) => $.set(value), signal),
  )
}
