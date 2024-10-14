import { DocumentReference, addDoc, collection } from '@firebase/firestore'
import useFunState from '@fun-land/use-fun-state'
import React, { FC } from 'react'
import { style, stylesheet } from 'typestyle'
import { TextInput } from '../../components/TextInput'
import { Textarea } from '../../components/Textarea'
import { button, e, h, label } from '../../util'

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

export const MessageForm: FC<{ gdoc: DocumentReference; active: boolean }> = ({ gdoc, active }) => {
  const state = useFunState<MessageFormState>({ note: '', username: '' })
  const { username, note } = state.get()
  const postMessage: React.FormEventHandler<HTMLFormElement> = (e): void => {
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
  return active
    ? h('form', { onSubmit: postMessage, className: styles.MessageForm }, [
        label({ key: 'note' }, [
          e(Textarea, {
            key: 'note',
            passThroughProps: {
              required: true,
              placeholder: 'Note',
              className: style({ width: '100%', height: 44, display: 'block', maxHeight: 200, resize: 'vertical' }),
            },
            state: state.prop('note'),
          }),
        ]),
        label({ key: 'character' }, [
          e(TextInput, {
            key: 'character',
            passThroughProps: {
              required: true,
              placeholder: 'Character',
              type: 'text',
              name: 'username',
            },
            state: state.prop('username'),
          }),
        ]),
        button({ key: 'send', type: 'submit', disabled: note === '' || username === '' }, ['Send']),
      ])
    : null
}
