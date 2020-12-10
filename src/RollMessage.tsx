import { FC } from 'react'
import { style } from 'typestyle'
import { borderColor } from './colors'
import { Message } from './Models/GameModel'

export const RollMessage: FC<{ result: Message }> = ({ result: { username, note } }) => {
  return (
    <div
      className={style({
        fontSize: 12,
        margin: '24px 12px',
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '6px 12px',
      })}>
      {username}: {note}
    </div>
  )
}
