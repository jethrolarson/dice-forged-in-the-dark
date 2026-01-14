import { DocumentReference } from '@firebase/firestore'
import { NewRoll, sendRoll } from '../RollForm/FormCommon'
import { RollType, RollTypes } from './RollTypes'
import { ActionForm } from './ActionForm'
import { MessageForm } from '../MessageForm'
import { funState, FunState } from '@fun-land/fun-state'
import { ResistForm } from './ResistForm'
import { FortuneForm } from './FortuneForm'
import { renderWhen, h, Component } from '@fun-land/fun-web'

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
  }
  requestAnimationFrame(scrollToBottom)
  return h('div', { style: { display: 'contents' } }, [
    renderWhen({
      signal,
      state: $,
      props: { roll, uid },
      predicate: (rt) => rt === RollType.action,
      component: ActionForm,
    }),
    renderWhen({
      signal,
      component: ResistForm,
      state: $,
      props: { roll, uid },
      predicate: (rt) => rt === RollType.resist,
    }),
    renderWhen({
      signal,
      component: FortuneForm,
      state: $,
      props: { roll, uid },
      predicate: (rt) => rt === RollType.fortune,
    }),
    renderWhen({
      signal,
      component: MessageForm,
      state: $,
      props: { gdoc },
      predicate: (rt) => rt === RollType.message,
    }),
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
