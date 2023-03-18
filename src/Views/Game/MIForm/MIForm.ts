import { Fragment, useCallback, useEffect } from 'react'
import { DocumentReference } from '@firebase/firestore'
import useFunState from '@fun-land/use-fun-state'
import { NewRoll, sendRoll } from '../RollForm/FormCommon'
import { RollType, RollTypes } from './RollTypes'
import { ActionForm } from './ActionForm'
import { AssistForm } from './AssistForm'
import { MessageForm } from '../MessageForm'
import { FortuneForm } from './FortuneForm'
import { QualityForm } from './QualityForm'
import { div, e } from '../../../util'
import { FunState } from '@fun-land/fun-state'

type FormState = RollType

export const Form = ({
  $,
  gdoc,
  uid,
  scrollToBottom,
  userDisplayName,
}: {
  $: FunState<FormState>
  gdoc: DocumentReference
  uid: string
  userDisplayName: string
  scrollToBottom: () => unknown
}) => {
  const rollType = $.get()
  const roll = useCallback(
    (newRoll: NewRoll) => {
      sendRoll(gdoc, userDisplayName, newRoll)
    },
    [gdoc],
  )
  useEffect(() => {
    scrollToBottom()
  }, [rollType])
  return e(Fragment, {
    children: [
      e(ActionForm, { key: RollType.action, roll, uid, active: rollType == RollType.action }),
      e(AssistForm, { key: RollType.assist, roll, uid, active: rollType == RollType.assist }),
      e(QualityForm, { key: RollType.quality, roll, uid, active: rollType == RollType.quality }),
      e(FortuneForm, { key: RollType.fortune, roll, uid, active: rollType == RollType.fortune }),
      e(MessageForm, { key: RollType.message, gdoc, active: rollType == RollType.message }),
    ],
  })
}

export const MIForm = (props: {
  gdoc: DocumentReference
  userDisplayName: string
  uid: string
  scrollToBottom: () => unknown
}) => {
  const $ = useFunState<FormState>(RollType.none)
  return div(null, [e(Form, { key: 'form', $, ...props }), e(RollTypes, { key: 'types', $ })])
}
