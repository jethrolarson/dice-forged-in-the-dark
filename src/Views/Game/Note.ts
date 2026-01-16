import Markdown from '../../markdown'
import { Component, h } from '@fun-land/fun-web'
import { styles } from './Note.css'

export const Note: Component<{ text: string }> = (signal, { text }) => {
  const div = h('div', { className: styles.Note })
  div.innerHTML = Markdown.render(text)
  return div
}
