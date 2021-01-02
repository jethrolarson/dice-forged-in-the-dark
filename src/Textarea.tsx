import { FunState } from 'fun-state'
import React, { FC } from 'react'
import { pipeVal } from './common'

export const Textarea: FC<{
  state: FunState<string>
  passThroughProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
}> = ({ state, passThroughProps }) => (
  <textarea {...passThroughProps} onChange={pipeVal(state.set)} value={state.get()} />
)
