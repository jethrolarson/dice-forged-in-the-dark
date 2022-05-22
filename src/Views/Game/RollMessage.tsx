import React, { FC } from 'react'
import { style } from 'typestyle'
import { Message } from '../../Models/GameModel'
import { Note } from './Note'

export const RollMessage: FC<{ result: Message }> = ({ result: { username, note } }) => {
  return (
    <div
      className={style({
        fontSize: 12,
        margin: '24px 12px',
        border: `1px solid var(--border-color)`,
        borderRadius: '8px',
        padding: '6px 12px',
      })}>
      {username}:
      <Note text={note} />
    </div>
  )
}
