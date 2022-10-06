import { useCallback, useEffect } from 'react'
import { DocumentReference } from '@firebase/firestore'
import useFunState from '@fun-land/use-fun-state'
import { NewRoll, sendRoll } from '../RollForm/FormCommon'
import { RollType, RollTypes } from './RollTypes'
import { ActionForm } from './ActionForm'
import { MessageForm } from '../MessageForm'
import { div, e } from '../../../util'
import { FunState } from '@fun-land/fun-state'
import { ResistForm } from './ResistForm'
import { FortuneForm } from './FortuneForm'

type FormState = RollType

export const Form = ({
  $,
  gdoc,
  uid,
  scrollToBottom,
}: {
  $: FunState<FormState>
  gdoc: DocumentReference
  uid: string
  scrollToBottom: () => unknown
}) => {
  const rollType = $.get()
  const roll = useCallback(
    (newRoll: NewRoll) => {
      sendRoll(gdoc, newRoll)
    },
    [gdoc],
  )
  useEffect(() => {
    scrollToBottom()
  }, [rollType])
  switch (rollType) {
    case RollType.none:
      return null
    case RollType.action:
      return e(ActionForm, { roll, uid })
    case RollType.resist:
      return e(ResistForm, { roll, uid })
    case RollType.fortune:
      return e(FortuneForm, { roll, uid })
    case RollType.message:
      return e(MessageForm, { gdoc })
  }
}

export const AshworldForm = (props: { gdoc: DocumentReference; uid: string; scrollToBottom: () => unknown }) => {
  const $ = useFunState<FormState>(RollType.none)
  return div(null, [e(RollTypes, { key: 'types', $ }), e(Form, { key: 'form', $, ...props })])
}
