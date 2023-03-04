import { FunState } from '@fun-land/fun-state'
import { TextInput } from './TextInput'

export const Character = ({
  $,
  passThroughProps,
}: {
  $: FunState<string>
  passThroughProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}) =>
  TextInput({
    passThroughProps: {
      placeholder: 'Character',
      type: 'text',
      name: 'username',
      ...passThroughProps,
    },
    state: $,
  })
