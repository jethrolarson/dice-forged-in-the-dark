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

  // Create derived active states for each form
  const actionActive$ = funState(false)
  const assistActive$ = funState(false)
  const qualityActive$ = funState(false)
  const fortuneActive$ = funState(false)
  const messageActive$ = funState(false)

  // Update active states when roll type changes
  $.watch(signal, (rollType) => {
    actionActive$.set(rollType === RollType.action)
    assistActive$.set(rollType === RollType.assist)
    qualityActive$.set(rollType === RollType.quality)
    fortuneActive$.set(rollType === RollType.fortune)
    messageActive$.set(rollType === RollType.message)
  })

  return h('div', {}, [
    ActionForm(signal, { roll, uid, active$: actionActive$ }),
    AssistForm(signal, { roll, uid, active$: assistActive$ }),
    QualityForm(signal, { roll, uid, active$: qualityActive$ }),
    FortuneForm(signal, { roll, uid, active$: fortuneActive$ }),
    MessageForm(signal, { gdoc, active$: messageActive$ }),
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
