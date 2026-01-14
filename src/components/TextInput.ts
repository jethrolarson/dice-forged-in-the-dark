import { FunState } from '@fun-land/fun-state'
import { Component, enhance, onTo, h } from '@fun-land/fun-web'

export const TextInput: Component<{
  state: FunState<string>
  passThroughProps?: any //TODO what type should be used?
}> = (signal, { state, passThroughProps }) =>
  enhance(
    h('input', { ...passThroughProps, value: state.get() }),
    onTo('change', ({ currentTarget: { value } }) => state.set(value), signal),
  )
