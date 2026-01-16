import { DocumentReference, addDoc, collection } from '@firebase/firestore'
import { TextInput } from '../../components/TextInput'
import { Textarea } from '../../components/Textarea'
import { Component, h } from '@fun-land/fun-web'
import { hideUnless } from '../../util'
import { funState, FunState } from '@fun-land/fun-state'
import { styles } from './MessageForm.css'

interface MessageFormState {
  note: string
  username: string
}

export const MessageForm: Component<{ gdoc: DocumentReference; active$: FunState<boolean> }> = (
  signal,
  { gdoc, active$ },
) => {
  const state = funState<MessageFormState>({ note: '', username: '' })
  const { username, note } = state.get()
  const postMessage = (e: Event): void => {
    e.preventDefault()
    addDoc(collection(gdoc, 'rolls'), {
      note,
      username,
      date: Date.now(),
      kind: 'Message',
    }).catch((e) => {
      console.error(e)
      alert('failed to send message')
    })
    state.prop('username').set('')
  }
  return hideUnless(
    active$,
    signal,
  )(
    h('form', { onSubmit: postMessage, className: styles.MessageForm }, [
      h('label', {}, [
        Textarea(signal, {
          passThroughProps: {
            required: true,
            placeholder: 'Note',
            className: styles.textarea,
          },
          $: state.prop('note'),
        }),
      ]),
      h('label', { key: 'character' }, [
        TextInput(signal, {
          passThroughProps: {
            required: true,
            placeholder: 'Character',
            type: 'text',
            name: 'username',
          },
          $: state.prop('username'),
        }),
      ]),
      h('button', { key: 'send', type: 'submit', disabled: note === '' || username === '' }, ['Send']),
    ]),
  )
}
