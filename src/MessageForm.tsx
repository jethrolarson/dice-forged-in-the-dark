import React, { FC } from 'react'
import useFunState from 'fun-state'
import { style } from 'typestyle'
import { DocRef } from './useDoc'
import { pipeVal } from './common'

interface MessageFormState {
  note: string
  username: string
}

export const MessageForm: FC<{ gdoc: DocRef | null }> = ({ gdoc }) => {
  const state = useFunState<MessageFormState>({ note: '', username: '' })
  const { username, note } = state.get()
  const postMessage: React.FormEventHandler<HTMLFormElement> = (e): void => {
    e.preventDefault()
    if (gdoc) {
      gdoc
        .collection('rolls')
        .add({
          note,
          username,
          date: Date.now(),
          kind: 'Message',
        })
        .catch((e) => {
          console.error(e)
          alert('failed to add roll')
        })
      state.prop('username').set('')
    }
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
        <textarea
          required={true}
          placeholder="Note"
          className={style({ width: '100%', height: 44, display: 'block', maxHeight: 200, resize: 'vertical' })}
          onChange={pipeVal(state.prop('note').set)}
          value={note}
        />
      </label>
      <label className={style({ gridArea: 'player' })}>
        <input
          required={true}
          placeholder="Character"
          type="text"
          name="username"
          value={username}
          onChange={pipeVal(state.prop('username').set)}
        />
      </label>
      <button type="submit" disabled={note === '' || username === ''}>
        Send
      </button>
    </form>
  )
}
