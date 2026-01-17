import { Message } from '../../../Models/GameModel'
import { Component, h, hx, bindView } from '@fun-land/fun-web'
import { Note } from '../Note'
import { messageStyle, messageWrap, redactedMessageStyle } from './Message.css'
import * as rollLogStyles from './RollLog.css'
import { FunState } from '@fun-land/fun-state'
import { DocumentReference } from '@firebase/firestore'
import { RedactionButton } from './RedactionButton'
import { Timestamp } from './Timestamp'

export const RollMessage: Component<{
  result: Message
  gdoc: DocumentReference
  rollState: FunState<Message>
}> = (signal, { result: { username, note, id, date, user }, gdoc, rollState }) => {
  const redactionButton = RedactionButton(signal, { gdoc, itemId: id, itemState: rollState })

  return bindView(signal, rollState.prop('redacted'), (_contentSignal, redactedValue) => {
    const isRedacted = redactedValue === true
    return h('div', { className: messageWrap }, [
      h('div', { className: isRedacted ? `${messageStyle} ${redactedMessageStyle}` : messageStyle }, [
        redactionButton,
        isRedacted ? h('span', {}, ['[Redacted]']) : h('span', {}, [username, ':', Note(signal, { text: note })]),
      ]),
      Timestamp(signal, { user, date }),
    ])
  })
}
