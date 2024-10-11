import { useEffect, useRef } from 'react'
import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { stylesheet } from 'typestyle'
import { dieColors, DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Character } from '../../../components/Character'
import { Factor, FactorSelect } from './FactorSelect'
import { init_Power$, Power$, PowerSelect } from './PowerSelect'
import { Approach$, init_Approach$, ApproachSelect } from './ApproachSelect'
import { e, h, div } from '../../../util'
import { DiceSceneRef } from '../../../components/DiceScene/DiceScene'
import { Tier } from './TierSelect'

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
})

interface ActionForm$ {
  approach$: Approach$
  power$: Power$
  factor$: Factor
  dicePool: DicePool$
  note: string
  username: string
  diceResults: number[]
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
  dicePool: init_DicePool$(),
  approach$: init_Approach$,
  note: '',
  power$: init_Power$,
  factor$: Factor.Even,
  username: '',
  diceResults: [],
})

export const ActionForm = ({
  uid,
  roll,
  active,
}: {
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active: boolean
}) => {
  const $ = useFunState<ActionForm$>(init_ActionForm$())
  const { username, note } = $.get()
  const approchTier = $.prop('approach$').prop('tier').get()
  const powerTier = $.prop('power$').prop('tier').get()
  const factor = $.prop('factor$').get()
  const dicePool$ = $.prop('dicePool')
  const diceSceneRef = useRef<DiceSceneRef | null>(null)
  const addDie = (color: number, id?: string) => {
    if (diceSceneRef.current) diceSceneRef.current.addDie(color, id)
  }
  const removeDie = (id: string) => {
    if (diceSceneRef.current) diceSceneRef.current.removeDie(id)
  }
  useEffect(() => {
    username && note ? diceSceneRef.current?.enable() : diceSceneRef.current?.disable()
  }, [username, note])
  useEffect(() => {
    if (!active) return
    if (approchTier === Tier.T0 && powerTier === Tier.T0 && factor === Factor.Disadvantaged) {
      addDie(dieColors.black, 'zero')
      addDie(dieColors.black, 'zero2')
    } else {
      removeDie('zero')
      removeDie('zero2')
    }
  }, [approchTier, powerTier, factor, active])
  return active
    ? div(
        { className: styles.ActionForm },
        e(DicePool, {
          key: 'dicepool',
          ref: diceSceneRef,
          state: dicePool$,
          sendRoll: rollIt(roll, uid, $),
          disableRemove: false,
          disabled: !username || !note,
        }),
        div(
          { key: 'form', className: styles.form },
          e(FormHeading, { key: 'head', title: 'Action Roll' }),
          h('p', { key: 'subhead' }, 'Do something risky or stressful'),
          e(ApproachSelect, {
            key: 'approach',
            $: $.prop('approach$'),
            addDie,
            removeDie,
          }),
          e(PowerSelect, {
            key: 'power',
            $: $.prop('power$'),
            addDie,
            removeDie,
          }),
          e(FactorSelect, {
            key: 'factor',
            $: $.prop('factor$'),
            addDie,
            removeDie,
            active,
          }),
          e(Character, { key: 'character', $: $.prop('username'), passThroughProps: { required: true } }),
          e(Note, { key: 'note', $: $.prop('note'), passThroughProps: { required: true } }),
        ),
      )
    : null
}
