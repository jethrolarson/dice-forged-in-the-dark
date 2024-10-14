import { stylesheet } from 'typestyle'
import Markdown from '../../markdown'
import { e } from '../../util'

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

export const Note = ({ text }: { text: string }) =>
  e('div', { className: styles.Note, dangerouslySetInnerHTML: { __html: Markdown.render(text) } })
