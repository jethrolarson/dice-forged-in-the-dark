import { Fragment, useCallback, useEffect } from 'react'
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
  userDisplayName,
}: {
  $: FunState<FormState>
  gdoc: DocumentReference
  uid: string
  scrollToBottom: () => unknown
  userDisplayName: string
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
  return e(Fragment, null, [
    e(ActionForm, { key: RollType.action, roll, uid, active: rollType === RollType.action }),
    e(ResistForm, { key: RollType.resist, roll, uid, active: rollType === RollType.resist }),
    e(FortuneForm, { key: RollType.fortune, roll, uid, active: rollType === RollType.fortune }),
    e(MessageForm, { key: RollType.message, gdoc, active: rollType === RollType.message }),
  ])
}

export const AshworldForm = (props: {
  gdoc: DocumentReference
  uid: string
  scrollToBottom: () => unknown
  userDisplayName: string
}) => {
  const $ = useFunState<FormState>(RollType.none)
  return div(null, [e(RollTypes, { key: 'types', $ }), e(Form, { key: 'form', $, ...props })])
}
