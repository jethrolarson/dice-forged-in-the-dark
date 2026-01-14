import { DocumentReference } from '@firebase/firestore'
import { funState, FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { NewRoll, sendRoll } from '../RollForm/FormCommon'
import { RollType, RollTypes } from './RollTypes'
import { ActionForm } from './ActionForm'
import { AssistForm } from './AssistForm'
import { MessageForm } from '../MessageForm'
import { FortuneForm } from './FortuneForm'
import { QualityForm } from './QualityForm'

type FormState = RollType

export const Form: Component<{
  $: FunState<FormState>
  gdoc: DocumentReference
  uid: string
  userDisplayName: string
  scrollToBottom: () => unknown
}> = (signal, { $, gdoc, uid, userDisplayName, scrollToBottom }) => {
  const roll = (newRoll: NewRoll) => {
    sendRoll(gdoc, userDisplayName, newRoll)
    $.set(RollType.none)
  }

  // Watch roll type changes and scroll to bottom
  $.watch(signal, () => {
    scrollToBottom()
  })

  // Get current roll type for active state
  const rollType = $.get()

  return h('div', {}, [
    ActionForm(signal, { roll, uid, active: rollType == RollType.action }),
    AssistForm(signal, { roll, uid, active: rollType == RollType.assist }),
    QualityForm(signal, { roll, uid, active: rollType == RollType.quality }),
    FortuneForm(signal, { roll, uid, active: rollType == RollType.fortune }),
    MessageForm(signal, { gdoc, active: rollType == RollType.message }),
  ])
}

export const MIForm: Component<{
  gdoc: DocumentReference
  userDisplayName: string
  uid: string
  scrollToBottom: () => unknown
}> = (signal, props) => {
  const $ = funState<FormState>(RollType.none)
  return h('div', {}, [Form(signal, { $, ...props }), RollTypes(signal, { $ })])
}
