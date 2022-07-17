import { FunState } from '@fun-land/fun-state'
import React from 'react'
import { pipeVal } from '../common'
import { h } from '../util'

export const Textarea = ({
  state,
  passThroughProps,
}: {
  state: FunState<string>
  passThroughProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
}) => h('textarea', { ...passThroughProps, onChange: pipeVal(state.set), value: state.get() })
