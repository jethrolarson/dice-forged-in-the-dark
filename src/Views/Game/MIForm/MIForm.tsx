import React, { useCallback } from 'react'
import { stylesheet } from 'typestyle'
import { DocumentReference } from '@firebase/firestore'
import useFunState from '@fun-land/use-fun-state'
import { NewRoll, sendRoll } from '../RollForm/FormCommon'
import { RollType, RollTypes } from './RollTypes'
import { ActionForm } from './ActionForm'
import { AssistForm } from './AssistForm'
import { MessageForm } from '../MessageForm'
import { FortuneForm } from './FortuneForm'
import { QualityForm } from './QualityForm'

const styles = stylesheet({
  form: {
    padding: '0',
  },
})

interface FormState {
  rollType: RollType
}

const FormSwitch = ({ gdoc, uid }: { gdoc: DocumentReference; uid: string }) => {
  const state = useFunState<FormState>({ rollType: RollType.none })
  const { rollType } = state.get()
  const back = () => state.prop('rollType').set(RollType.none)
  const roll = useCallback(
    (newRoll: NewRoll) => {
      sendRoll(gdoc, newRoll)
    },
    [gdoc],
  )
  switch (rollType) {
    case RollType.none:
      return <RollTypes $={state.prop('rollType')} />
    case RollType.action:
      return <ActionForm roll={roll} uid={uid} back={back} />
    case RollType.assist:
      return <AssistForm roll={roll} uid={uid} back={back} />
    case RollType.quality:
      return <QualityForm roll={roll} uid={uid} back={back} />
    case RollType.fortune:
      return <FortuneForm roll={roll} uid={uid} back={back} />
    case RollType.message:
      return <MessageForm gdoc={gdoc} back={back} />
  }
}

export const MIForm = ({ gdoc, uid }: { gdoc: DocumentReference; uid: string }) => {
  return (
    <div className={styles.form}>
      <FormSwitch gdoc={gdoc} uid={uid} />
    </div>
  )
}
