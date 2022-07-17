import React, { FC } from 'react'
import { style } from 'typestyle'
import { Message } from '../../Models/GameModel'
import { div, e } from '../../util'
import { Note } from './Note'

const messageStyle = style({
  fontSize: 12,
  margin: '24px 12px',
  border: `1px solid var(--border-color)`,
  borderRadius: '8px',
  padding: '6px 12px',
})
export const RollMessage = ({ result: { username, note } }: { result: Message }) =>
  div(
    {
      className: messageStyle,
    },
    [username, ':', e(Note, { key: 'note', text: note })],
  )
