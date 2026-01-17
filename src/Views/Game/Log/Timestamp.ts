import { Component, h } from '@fun-land/fun-web'
import * as styles from './RollLog.css'

const isToday = (ms: number): boolean => new Date(ms).toDateString() === new Date().toDateString()

export const Timestamp: Component<{ user: string; date: number }> = (signal, { user, date }) =>
  h('em', { className: styles.time }, [
    user,
    ' ',
    !isToday(date) ? new Date(date).toLocaleDateString() : '',
    ' ',
    new Date(date).toLocaleTimeString(),
  ])
