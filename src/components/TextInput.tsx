import { FunState } from '@fun-land/fun-state'
import React, { FC } from 'react'
import { pipeVal } from '../common'

export const TextInput: FC<{
  state: FunState<string>
  passThroughProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}> = ({ state, passThroughProps }) => <input {...passThroughProps} onChange={pipeVal(state.set)} value={state.get()} />
