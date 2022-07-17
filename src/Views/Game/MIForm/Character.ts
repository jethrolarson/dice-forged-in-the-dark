import { FunState } from '@fun-land/fun-state'
import { TextInput } from '../../../components/TextInput'

export const Character = ({ $ }: { $: FunState<string> }) =>
  TextInput({
    passThroughProps: {
      placeholder: 'Character',
      type: 'text',
      name: 'usernamSe',
    },
    state: $,
  })
