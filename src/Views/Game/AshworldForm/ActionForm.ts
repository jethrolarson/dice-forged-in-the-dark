import { Component, h, enhance } from '@fun-land/fun-web'
import { FunState, funState } from '@fun-land/fun-state'
import { DieResult, dieColors } from '../../../Models/Die'
import { Character } from '../../../components/Character'
import { CheckDie, CheckDieState } from '../../../components/CheckDie'
import { DicePool, init_DicePool$ } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { hideUnless } from '../../../util'
import { styles } from './ActionForm.css'

interface ActionForm$ {
  note: string
  gripes: CheckDieState
  knack: CheckDieState
  shit: CheckDieState
  hx: CheckDieState
  upperHand: CheckDieState
  amped: CheckDieState
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<ActionForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, username } = state.get()
    const isZero = diceRolled.length === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    roll({
      note,
      rollType: 'Action',
      lines: ['Action'].filter(Boolean),
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
  gripes: false,
  knack: false,
  shit: false,
  hx: false,
  upperHand: false,
  amped: false,
  note: '',
  username: '',
})

export const ActionForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
}> = (signal, { uid, roll, active$ }) => {
  const $ = funState<ActionForm$>(init_ActionForm$())
  
  // Create a dummy dicePool$ for CheckDie components (they still use deprecated API)
  const dicePool$ = funState(init_DicePool$())
  
  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $),
    disableAdd$: funState(true),
    active$,
  })

  const addDie = (color: number, id: string) => {
    dicePool.$api.addDie(color, id)
  }
  const removeDie = (id: string) => {
    dicePool.$api.removeDie(id)
  }

  // Watch state to manage dice scene enabled/disabled
  $.watch(signal, ({ username, note }) => {
    const shouldEnable = username && note
    shouldEnable ? dicePool.$api.enable() : dicePool.$api.disable()
  })

  // Watch CheckDie states and sync with dice scene
  $.prop('knack').watch(signal, (checked) => {
    checked ? addDie(dieColors.white, 'knack') : removeDie('knack')
  })
  $.prop('shit').watch(signal, (checked) => {
    checked ? addDie(dieColors.white, 'shit') : removeDie('shit')
  })
  $.prop('amped').watch(signal, (checked) => {
    checked ? addDie(dieColors.red, 'amped') : removeDie('amped')
  })
  $.prop('upperHand').watch(signal, (checked) => {
    checked ? addDie(dieColors.white, 'upperHand') : removeDie('upperHand')
  })
  $.prop('gripes').watch(signal, (checked) => {
    checked ? addDie(dieColors.yellow, 'gripes') : removeDie('gripes')
  })

  // Sync dice when scene becomes active
  active$.watch(signal, (active) => {
    if (active) {
      requestAnimationFrame(() => {
        const state = $.get()
        if (state.knack) addDie(dieColors.white, 'knack')
        if (state.shit) addDie(dieColors.white, 'shit')
        if (state.amped) addDie(dieColors.red, 'amped')
        if (state.upperHand) addDie(dieColors.white, 'upperHand')
        if (state.gripes) addDie(dieColors.yellow, 'gripes')
      })
    }
  })

  const container = enhance(
    h('div', { className: styles.ActionForm }, [
      dicePool,
      h('div', { className: styles.form }, [
        FormHeading(signal, { title: 'Action' }),
        h('p', { key: 'subhead' }, ['Try something risky or uncertain']),

        CheckDie(signal, {
          id: 'knack',
          $: $.prop('knack'),
          dicePool$,
          color: 'white',
          label: h('span', null, ['We got a ', h('b', null, 'knack'), ' for this']),
        }),
        CheckDie(signal, {
          id: 'shit',
          $: $.prop('shit'),
          dicePool$,
          color: 'white',
          label: 'We got the right shit',
        }),
        CheckDie(signal, {
          id: 'amped',
          $: $.prop('amped'),
          dicePool$,
          color: 'red',
          label: h('span', null, [`We're `, h('b', null, ['juiced']), ' or in ', h('b', null, 'sync')]),
        }),
        CheckDie(signal, {
          id: 'upperHand',
          $: $.prop('upperHand'),
          dicePool$,
          color: 'white',
          label: "We fuckin' got this (Emcee)",
        }),
        CheckDie(signal, {
          id: 'gripes',
          $: $.prop('gripes'),
          dicePool$,
          color: 'yellow',
          label: h('span', null, [`We're taking a `, h('b', null, ["Devil's Bargain"])]),
        }),
        h('p', {}, ['Emcee tells you ', h('b', null, 'good'), ' and ', h('b', null, 'bad'), ' stuff']),
        Character(signal, { $: $.prop('username') }),
        Note(signal, { $: $.prop('note') }),
      ]),
    ]),
    hideUnless(active$, signal),
  )
  return container
}
