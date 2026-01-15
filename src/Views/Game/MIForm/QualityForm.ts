import { funState, FunState } from '@fun-land/fun-state'
import { Component, enhance, h } from '@fun-land/fun-web'
import { stylesheet } from 'typestyle'
import { DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool } from '../../../components/DicePool'
import { Character } from '../../../components/Character'
import { TextInput } from '../../../components/TextInput'
import { FormHeading } from '../../../components/FormHeading'
import { bindClass, hideUnless, notAcc } from '../../../util'

const styles = stylesheet({
  QualityForm: {
    minHeight: 200,
    display: 'grid',
    gap: 12,
    margin: 12,
    $nest: {
      p: {
        margin: 0,
        fontSize: '1rem',
        fontStyle: 'italic',
      },
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  hidden: {
    display: 'none',
  },
})

interface QualityForm$ {
  pool: string
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<QualityForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, pool, username } = state.get()
    const n = diceRolled.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Fortune',
      lines: ['Fortune', pool].filter(Boolean),
      username,
      isZero,
      diceRolled,
      date: Date.now(),
      kind: 'Roll',
      valuationType: 'Action',
      uid,
    })
    state.set(init_QualityForm$())
  }

const init_QualityForm$ = (): QualityForm$ => ({
  note: '',
  pool: '',
  username: '',
})

export const QualityForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
}> = (signal, { uid, roll, active$ }) => {
  const $ = funState<QualityForm$>(init_QualityForm$())

  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $),
    disableAdd$: funState(false),
  })

  const diceApi = dicePool.$api

  // Watch state to manage dice scene enabled/disabled
  $.watch(signal, ({ note }) => {
    note ? diceApi.enable() : diceApi.disable()
  })

  // Create all components once
  const container = enhance(
    h('div', { className: styles.QualityForm }, [
      dicePool,
      h('div', { className: styles.form }, [
        FormHeading(signal, { title: 'Quality Roll' }),
        h('p', {}, ['You succeed but how well?']),
        h('p', {}, ['Roll T dice where T is highest Tier of your remaining dice']),
        h('div', {}, [
          TextInput(signal, {
            $: $.prop('pool'),
            passThroughProps: { name: 'pool', placeholder: 'Approach or Power' },
          }),
        ]),
        Character(signal, { $: $.prop('username') }),
        Note(signal, { $: $.prop('note') }),
      ]),
    ]),
    hideUnless(active$, signal),
  )

  return container
}
