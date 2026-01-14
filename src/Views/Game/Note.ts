import { stylesheet } from 'typestyle'
import Markdown from '../../markdown'
import { Component, h } from '@fun-land/fun-web'

const styles = stylesheet({
  Note: {
    $nest: {
      img: {
        maxWidth: '100%',
      },
      'ul, ol': {
        margin: '1em 0',
        padding: '0 0 0 1.9em',
      },
    },
  },
})

export const Note: Component<{ text: string }> = (signal, { text }) => {
  const div = h('div', { className: styles.Note })
  div.innerHTML = Markdown.render(text)
  return div
}
