import { DocumentReference, addDoc, collection } from '@firebase/firestore'
import { style, stylesheet } from 'typestyle'
import { TextInput } from '../../components/TextInput'
import { Textarea } from '../../components/Textarea'
import { Component, FunState, funState, h } from '@fun-land/fun-web'
import { hideUnless } from '../../util'

const styles = stylesheet({
  MessageForm: {
    display: 'grid',
    gridGap: 10,
    margin: 10,
    $nest: {
      p: {
        margin: 0,
        fontSize: '1.17rem',
        fontStyle: 'italic',
      },
    },
  },
})

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
            className: style({ width: '100%', height: 44, display: 'block', maxHeight: 200, resize: 'vertical' }),
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
