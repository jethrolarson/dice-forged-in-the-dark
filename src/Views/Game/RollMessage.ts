import { style } from 'typestyle'
import { Message } from '../../Models/GameModel'
import { Component, h } from '@fun-land/fun-web'
import { Note } from './Note'

const messageStyle = style({
  fontSize: '1rem',
  margin: '24px 12px',
  border: `1px solid var(--border-color)`,
  borderRadius: '8px',
  padding: '6px 12px',
})

export const RollMessage: Component<{ result: Message }> = (signal, { result: { username, note } }) =>
  h('div', { className: messageStyle }, [username, ':', Note(signal, { text: note })])
