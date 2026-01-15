import { funState, FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { stylesheet } from 'typestyle'
import { dieColors, DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Character } from '../../../components/Character'
import { Factor, FactorSelect } from './FactorSelect'
import { init_Power$, Power$, PowerSelect } from './PowerSelect'
import { Approach$, init_Approach$, ApproachSelect } from './ApproachSelect'
import { Tier } from './TierSelect'
import { hideUnless } from '../../../util'

const styles = stylesheet({
  ActionForm: {
    minHeight: 200,
    display: 'grid',
    gap: 12,
    margin: 12,
    $nest: {
      p: {
        margin: 0,
        fontSize: '1.17rem',
        fontStyle: 'italic',
      },
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  hidden: {
    display: 'none',
  },
})

interface ActionForm$ {
  approach$: Approach$
  power$: Power$
  factor$: Factor
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<ActionForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, approach$, power$, username } = state.get()

    const isZero = diceRolled.some((d) => d.dieColor === 'black')
    roll({
      note,
      rollType: 'Action',
      lines: [
        'Action',
        approach$.approach ? `${approach$.tier} ${approach$.approach}` : '',
        power$.power ? `${power$.tier} ${power$.power}` : '',
      ].filter(Boolean),
      username,
      isZero,
      diceRolled,
      date: Date.now(),
      kind: 'Roll',
      valuationType: 'Action',
      uid,
    })
    state.set(init_ActionForm$())
  }

const init_ActionForm$ = (): ActionForm$ => ({
  approach$: init_Approach$,
  note: '',
  power$: init_Power$,
  factor$: Factor.Even,
  username: '',
})

export const ActionForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
}> = (signal, { uid, roll, active$ }) => {
  const $ = funState<ActionForm$>(init_ActionForm$())

  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $),
    disableAdd$: funState(false),
  })

  const diceApi = dicePool.$api

  const addDie = (color: number, id?: string) => {
    diceApi.addDie(color, id)
  }
  const removeDie = (id: string) => {
    diceApi.removeDie(id)
  }

  // Watch state to manage dice scene enabled/disabled and zero dice
  $.watch(signal, ({ username, note, approach$, power$, factor$ }) => {
    const shouldEnable = username && note
    shouldEnable ? diceApi.enable() : diceApi.disable()

    // Manage zero dice (only when active)
    if (active$.get()) {
      if (approach$.tier === Tier.T0 && power$.tier === Tier.T0 && factor$ === Factor.Disadvantaged) {
        addDie(dieColors.black, 'zero')
        addDie(dieColors.black, 'zero2')
      } else {
        removeDie('zero')
        removeDie('zero2')
      }
    }
  })

  // Create all components once
  const container = hideUnless(
    active$,
    signal,
  )(
    h('div', { className: styles.ActionForm }, [
      dicePool,
      h('div', { className: styles.form }, [
        FormHeading(signal, { title: 'Action Roll' }),
        h('p', {}, ['Do something risky or stressful']),
        ApproachSelect(signal, {
          $: $.prop('approach$'),
          addDie,
          removeDie,
        }),
        PowerSelect(signal, {
          $: $.prop('power$'),
          addDie,
          removeDie,
        }),
        FactorSelect(signal, {
          $: $.prop('factor$'),
          addDie,
          removeDie,
        }),
        Character(signal, { $: $.prop('username'), passThroughProps: { required: true } }),
        Note(signal, { $: $.prop('note'), passThroughProps: { required: true } }),
      ]),
    ]),
  )

  return container
}
