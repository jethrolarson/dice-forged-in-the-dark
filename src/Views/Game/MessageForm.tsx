import React, { FC } from 'react'
import useFunState from 'fun-state'
import { style } from 'typestyle'
import { DocumentReference, addDoc, collection } from '@firebase/firestore'
import { TextInput } from '../../components/TextInput'
import { Textarea } from '../../components/Textarea'

interface MessageFormState {
  note: string
  username: string
}

export const MessageForm: FC<{ gdoc: DocumentReference }> = ({ gdoc }) => {
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
      alert('failed to add roll')
    })
    state.prop('username').set('')
  }
  return (
    <form
      onSubmit={postMessage}
      className={style({
        display: 'grid',
        gridTemplateAreas: '"note" "player"',
        gridGap: 10,
        margin: 10,
      })}>
      <label className={style({ gridArea: 'note' })}>
        <Textarea
          passThroughProps={{
            required: true,
            placeholder: 'Note',
            className: style({ width: '100%', height: 44, display: 'block', maxHeight: 200, resize: 'vertical' }),
          }}
          state={state.prop('note')}
        />
      </label>
      <label className={style({ gridArea: 'player' })}>
        <TextInput
          passThroughProps={{
            required: true,
            placeholder: 'Character',
            type: 'text',
            name: 'username',
          }}
          state={state.prop('username')}
        />
      </label>
      <button type="submit" disabled={note === '' || username === ''}>
        Send
      </button>
    </form>
  )
}
