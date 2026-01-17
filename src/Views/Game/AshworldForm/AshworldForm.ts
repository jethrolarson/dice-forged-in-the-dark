import { DocumentReference } from '@firebase/firestore'
import { NewRoll, sendRoll } from '../RollForm/FormCommon'
import { RollType, RollTypes } from './RollTypes'
import { ActionForm } from './ActionForm'
import { MessageForm } from '../MessageForm'
import { funState, FunState } from '@fun-land/fun-state'
import { ResistForm } from './ResistForm'
import { FortuneForm } from './FortuneForm'
import { h, Component } from '@fun-land/fun-web'

type FormState = RollType

export const Form: Component<{
  $: FunState<FormState>
  gdoc: DocumentReference
  uid: string
  scrollToBottom: () => unknown
  userDisplayName: string
}> = (signal, { $, gdoc, uid, scrollToBottom, userDisplayName }) => {
  const roll = (newRoll: NewRoll) => {
    sendRoll(gdoc, userDisplayName, newRoll)
    $.set(RollType.none)
  }

  // Shared username state across all forms
  const sharedUsername$ = funState('')

  // Watch roll type changes and scroll to bottom
  $.watch(signal, () => {
    scrollToBottom()
  })

  // Create derived active states for each form
  const actionActive$ = funState(false)
  const resistActive$ = funState(false)
  const fortuneActive$ = funState(false)
  const messageActive$ = funState(false)

  // Update active states when roll type changes
  $.watch(signal, (rollType) => {
    actionActive$.set(rollType === RollType.action)
    resistActive$.set(rollType === RollType.resist)
    fortuneActive$.set(rollType === RollType.fortune)
    messageActive$.set(rollType === RollType.message)
  })

  return h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } }, [
    ActionForm(signal, { roll, uid, active$: actionActive$, username$: sharedUsername$ }),
    ResistForm(signal, { roll, uid, active$: resistActive$, username$: sharedUsername$ }),
    FortuneForm(signal, { roll, uid, active$: fortuneActive$, username$: sharedUsername$ }),
    MessageForm(signal, { gdoc, active$: messageActive$, username$: sharedUsername$, userDisplayName, uid }),
  ])
}

export const AshworldForm: Component<{
  gdoc: DocumentReference
  uid: string
  scrollToBottom: () => unknown
  userDisplayName: string
}> = (signal, props) => {
  const $ = funState<FormState>(RollType.none)
  return h('div', {}, [RollTypes(signal, { $ }), Form(signal, { $, ...props })])
}
