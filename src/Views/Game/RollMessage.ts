import { Message } from '../../Models/GameModel'
import { Component, h, hx, bindView } from '@fun-land/fun-web'
import { Note } from './Note'
import { messageStyle, redactedMessageStyle } from './RollMessage.css'
import * as rollLogStyles from './RollLog.css'
import { DocumentReference, doc, updateDoc, collection } from '@firebase/firestore'
import { FunState } from '@fun-land/fun-state'

const redactMessage = (gdoc: DocumentReference, messageId: string): void => {
  const msgRef = doc(collection(gdoc, 'rolls'), messageId)
  updateDoc(msgRef, { redacted: true }).catch((e) => {
    console.error(e)
    alert('Failed to redact message')
  })
}

const unredactMessage = (gdoc: DocumentReference, messageId: string): void => {
  const msgRef = doc(collection(gdoc, 'rolls'), messageId)
  updateDoc(msgRef, { redacted: false }).catch((e) => {
    console.error(e)
    alert('Failed to unredact message')
  })
}

export const RollMessage: Component<{
  result: Message
  gdoc: DocumentReference
  rollState: FunState<Message>
}> = (signal, { result: { username, note, id }, gdoc, rollState }) => {
  const redactionButton = hx(
    'button',
    {
      signal,
      props: { className: rollLogStyles.redactionButton },
      on: {
        click: (e) => {
          e.stopPropagation()
          const isRedacted = rollState.prop('redacted').get() === true
          if (isRedacted) {
            unredactMessage(gdoc, id)
          } else {
            redactMessage(gdoc, id)
          }
        },
      },
    },
    ['✕'],
  )

  rollState.prop('redacted').watch(signal, (isRedacted) => {
    redactionButton.title = isRedacted ? 'Unredact (show for everyone)' : 'Redact (hide for everyone)'
  })

  redactionButton.title =
    rollState.prop('redacted').get() === true ? 'Unredact (show for everyone)' : 'Redact (hide for everyone)'

  return bindView(signal, rollState.prop('redacted'), (_contentSignal, redactedValue) => {
    const isRedacted = redactedValue === true
    return h(
      'div',
      { className: isRedacted ? `${messageStyle} ${redactedMessageStyle}` : messageStyle },
      [
        redactionButton,
        isRedacted ? h('span', {}, ['[Redacted]']) : h('span', {}, [username, ':', Note(signal, { text: note })]),
      ],
    )
  })
}
