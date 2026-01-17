import { funState, FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { dieColors, DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Character } from '../../../components/Character'
import { Factor, FactorSelect } from './FactorSelect'
import { init_Power$, Power$, PowerSelect } from './PowerSelect'
import { Approach$, init_Approach$, ApproachSelect } from './ApproachSelect'
import { Tier, tierColor } from './TierSelect'
import { hideUnless } from '../../../util'
import { styles } from './ActionForm.css'

interface ActionForm$ {
  approach$: Approach$
  power$: Power$
  factor$: Factor
  note: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<ActionForm$>, username$: FunState<string>) =>
  (diceRolled: DieResult[]): void => {
    const { note, approach$, power$ } = state.get()
    const username = username$.get()

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
})

export const ActionForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
  username$: FunState<string>
}> = (signal, { uid, roll, active$, username$ }) => {
  const $ = funState<ActionForm$>(init_ActionForm$())

  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $, username$),
    disableAdd$: funState(false),
    active$,
  })

  const addDie = (color: number, id?: string) => {
    dicePool.$api.addDie(color, id)
  }
  const removeDie = (id: string) => {
    dicePool.$api.removeDie(id)
  }

  // Watch state to manage dice scene enabled/disabled and zero dice
  $.watch(signal, ({ note, approach$, power$, factor$ }) => {
    const username = username$.get()
    const shouldEnable = username && note
    shouldEnable ? dicePool.$api.enable() : dicePool.$api.disable()
  
    if (approach$.tier === Tier.T0 && power$.tier === Tier.T0 && factor$ === Factor.Disadvantaged) {
      addDie(dieColors.black, 'zero')
      addDie(dieColors.black, 'zero2')
    } else {
      removeDie('zero')
      removeDie('zero2')
    }
  })
  
  // Sync Select component dice when scene becomes active
  active$.watch(signal, (active) => {
    if (active) {
      // Defer sync to ensure scene is created (may be async if dimensions not ready)
      requestAnimationFrame(() => {
        const { approach$, power$, factor$ } = $.get()
        
        // Approach dice
        approach$.tier !== Tier.T0 ? addDie(tierColor(approach$.tier), 'approach') : removeDie('approach')
        
        // Power dice
        power$.tier !== Tier.T0 ? addDie(tierColor(power$.tier), 'power') : removeDie('power')
        
        // Factor dice
        switch (factor$) {
          case Factor.Even:
            addDie(0xffffff, 'factor1')
            removeDie('factor2')
            break
          case Factor.Dominant:
            addDie(0xffffff, 'factor1')
            addDie(0xffffff, 'factor2')
            break
          case Factor.Disadvantaged:
            removeDie('factor1')
            removeDie('factor2')
        }
        
        // Zero dice
        if (approach$.tier === Tier.T0 && power$.tier === Tier.T0 && factor$ === Factor.Disadvantaged) {
          addDie(dieColors.black, 'zero')
          addDie(dieColors.black, 'zero2')
        } else {
          removeDie('zero')
          removeDie('zero2')
        }
      })
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
        Character(signal, { $: username$, passThroughProps: { required: true } }),
        Note(signal, { $: $.prop('note'), passThroughProps: { required: true } }),
      ]),
    ]),
  )

  return container
}
