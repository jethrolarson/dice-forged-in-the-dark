import { FunState } from '@fun-land/fun-state'
import { style } from 'typestyle'
import { Textarea } from './Textarea'

const className = style({
  width: '100%',
  height: 28,
  display: 'block',
  maxHeight: 200,
  resize: 'none',
})

export const Note = ({
  $,
  passThroughProps,
}: {
  $: FunState<string>
  passThroughProps?: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
}) =>
  Textarea({
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
