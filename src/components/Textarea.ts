import { FunState } from '@fun-land/fun-state'
import { pipeVal } from '../common'
import { Component, on, h } from '@fun-land/fun-web'

export const Textarea: Component<{
  state: FunState<string>
  passThroughProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
}> = (signal, { state, passThroughProps }) =>
  on(h('textarea', { ...passThroughProps, value: state.get() }), 'change', pipeVal(state.set), signal)
