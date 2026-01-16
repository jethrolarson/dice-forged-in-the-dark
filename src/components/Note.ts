import { Textarea, TextareaProps } from './Textarea'
import { Component, enhance, on } from '@fun-land/fun-web'
import { className } from './Note.css'

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
        currentTarget.style.height = `${currentTarget.scrollHeight + 2}px` // 2px is combined border width
      },
      signal,
    ),
  )
