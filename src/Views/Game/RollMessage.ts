import { Message } from '../../Models/GameModel'
import { Component, h } from '@fun-land/fun-web'
import { Note } from './Note'
import { messageStyle } from './RollMessage.css'

export const RollMessage: Component<{ result: Message }> = (signal, { result: { username, note } }) =>
  h('div', { className: messageStyle }, [username, ':', Note(signal, { text: note })])
