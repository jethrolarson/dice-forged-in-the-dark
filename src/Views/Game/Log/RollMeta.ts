import { Component, h, ElementChild } from '@fun-land/fun-web'
import { Note } from '../Note'
import * as styles from './RollLog.css'

export const RollMeta: Component<{
  username?: string
  title: string
  moreLines: string[]
  note?: string
  redactionButton: ElementChild
}> = (signal, { username, title, moreLines, note, redactionButton }) =>
  h('div', { className: styles.meta }, [
    redactionButton,
    username && h('span', { className: styles.name }, [username, ':']),
    h('div', { className: title.length > 12 ? styles.smallRollType : styles.rollType }, [title]),
    ...moreLines.map((line) => h('div', { className: styles.line }, [line])),
    note && Note(signal, { text: note }),
  ])
