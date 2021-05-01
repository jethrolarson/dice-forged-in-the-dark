import { FC } from 'react'
import { stylesheet } from 'typestyle'
import Markdown from '../../markdown'

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

export const Note: FC<{ text: string }> = ({ text }) => (
  <div className={styles.Note} dangerouslySetInnerHTML={{ __html: Markdown.render(text) }} />
)
