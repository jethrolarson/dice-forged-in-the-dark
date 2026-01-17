import { DocumentReference, addDoc, collection } from '@firebase/firestore'
import { TextInput } from '../../components/TextInput'
import { Textarea } from '../../components/Textarea'
import { Component, h } from '@fun-land/fun-web'
import { hideUnless } from '../../util'
import { funState, FunState } from '@fun-land/fun-state'
import { styles } from './MessageForm.css'

interface MessageFormState {
  note: string
}

export const MessageForm: Component<{
  gdoc: DocumentReference
  active$: FunState<boolean>
  username$: FunState<string>
}> = (signal, { gdoc, active$, username$ }) => {
  const state = funState<MessageFormState>({ note: '' })
  
  const postMessage = (e: Event): void => {
    e.preventDefault()
    const note = state.prop('note').get()
    const username = username$.get()
    addDoc(collection(gdoc, 'rolls'), {
      note,
      username,
      date: Date.now(),
      kind: 'Message',
    }).catch((e) => {
      console.error(e)
      alert('failed to send message')
    })
    state.prop('note').set('')
  }
  
  const note$ = state.prop('note')
  const sendButton = h('button', { key: 'send', type: 'submit' }, ['Send'])
  
  // Watch states and update button disabled
  const updateButtonDisabled = () => {
    const note = note$.get()
    const username = username$.get()
    sendButton.disabled = note === '' || username === ''
  }
  
  note$.watch(signal, updateButtonDisabled)
  username$.watch(signal, updateButtonDisabled)
  updateButtonDisabled() // Initial state
  
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
          $: note$,
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
          $: username$,
        }),
      ]),
      sendButton,
    ]),
  )
}
