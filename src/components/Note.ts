import { style } from 'typestyle'
import { Textarea, TextareaProps } from './Textarea'
import { Component, enhance, on } from '@fun-land/fun-web'

const className = style({
  width: '100%',
  height: 28,
  display: 'block',
  maxHeight: 200,
  resize: 'none',
})

export const Note: Component<TextareaProps> = (signal, { $, passThroughProps }) =>
  enhance(
    Textarea(signal, {
      passThroughProps: {
        placeholder: 'Description',
        className,
        ...passThroughProps,
      },
      $,
    }),
    on(
      'input',
      ({ currentTarget }): void => {
        const target = currentTarget
        target.style.height = `${target.scrollHeight + 2}px` // 2px is combined border width
      },
      signal,
    ),
  )
