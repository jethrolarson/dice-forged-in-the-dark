import { FunState } from '@fun-land/fun-state'
import { style } from 'typestyle'
import { Textarea } from './Textarea'
import { Component } from '@fun-land/fun-web'

const className = style({
  width: '100%',
  height: 28,
  display: 'block',
  maxHeight: 200,
  resize: 'none',
})

export const Note: Component<{
  $: FunState<string>
  passThroughProps?: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
}> = (signal, { $, passThroughProps }) =>
  Textarea(signal, {
    passThroughProps: {
      placeholder: 'Description',
      className,
      onInput: (e): void => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = `${target.scrollHeight + 2}px` // 2px is combined border width
      },
      ...passThroughProps,
    },
    state: $,
  })
