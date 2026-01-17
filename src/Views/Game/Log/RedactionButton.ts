import { Component, hx } from '@fun-land/fun-web'
import { FunState } from '@fun-land/fun-state'
import { DocumentReference, doc, updateDoc, collection } from '@firebase/firestore'
import * as styles from './RollLog.css'

const redactItem = (gdoc: DocumentReference, itemId: string): void => {
  const itemRef = doc(collection(gdoc, 'rolls'), itemId)
  updateDoc(itemRef, { redacted: true }).catch((e) => {
    console.error(e)
    alert('Failed to redact item')
  })
}

const unredactItem = (gdoc: DocumentReference, itemId: string): void => {
  const itemRef = doc(collection(gdoc, 'rolls'), itemId)
  updateDoc(itemRef, { redacted: false }).catch((e) => {
    console.error(e)
    alert('Failed to unredact item')
  })
}

export const RedactionButton = <T extends { redacted?: boolean }>(): Component<{
  gdoc: DocumentReference
  itemId: string
  itemState: FunState<T>
}> => (signal, { gdoc, itemId, itemState }) => {
  const button = hx(
    'button',
    {
      signal,
      props: { className: styles.redactionButton },
      on: {
        click: (e) => {
          e.stopPropagation()
          const isRedacted = itemState.prop('redacted').get() === true
          if (isRedacted) {
            unredactItem(gdoc, itemId)
          } else {
            redactItem(gdoc, itemId)
          }
        },
      },
    },
    ['✕'],
  )

  itemState.prop('redacted').watch(signal, (isRedacted) => {
    button.title = isRedacted ? 'Unredact (show for everyone)' : 'Redact (hide for everyone)'
  })

  button.title = itemState.prop('redacted').get() === true
    ? 'Unredact (show for everyone)'
    : 'Redact (hide for everyone)'

  return button
}
