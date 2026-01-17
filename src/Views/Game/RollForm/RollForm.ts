import { DocumentReference } from '@firebase/firestore'
import { removeAt } from '@fun-land/accessor'
import { funState, FunState, merge, mapRead } from '@fun-land/fun-state'
import { Component, enhance, h, hx, on, bindView } from '@fun-land/fun-web'
import { Icon } from '../../../components/Icon'
import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import { Textarea } from '../../../components/Textarea'
import { TextInput } from '../../../components/TextInput'
import { DieColor, DieResult, DieType } from '../../../Models/Die'
import { RollResult } from '../../../Models/GameModel'
import { RollConfig, ValuationType } from '../../../Models/RollConfig'
import { nextColor } from '../Die'
import { DicePool, Rollable } from './DicePool'
import { sendRoll } from './FormCommon'
import { accessDieColor, RollFormState } from './RollForm.state'
import { Sections } from './Sections'
import { styles } from './RollForm.css'

const rollDie = (): number => Math.floor(Math.random() * 6) + 1

const zeroDicePool: Rollable[] = [
  { type: 'd6', color: 'red', id: 'zero_0' },
  { type: 'd6', color: 'red', id: 'zero_1' },
]

const reset = (state: FunState<RollFormState>): void => {
  const currentUsername = state.prop('username').get()
  merge(state)({ note: '', rollType: '', rollState: ['', '', '', '', '', '', '', '', '', ''], dicePool: [] })
  state.prop('username').set(currentUsername)
}

export const roll =
  (gdoc: DocumentReference, uid: string, state: FunState<RollFormState>, userDisplayName: string) => (): void => {
    const { dicePool, rollState, note, rollType, username, valuationType } = state.get()
    const n = dicePool.length
    const isZero = n === 0
    if (isZero && !confirm('Roll 0 dice? (rolls 2 and takes lowest)')) return
    const diceRolled: DieResult[] = (isZero ? zeroDicePool : dicePool).map(({ type: dieType, color: dieColor }) => ({
      dieColor: DieColor[dieColor],
      dieType,
      value: rollDie(),
    })) as DieResult[]
    const lines = rollState
    const roll: Omit<RollResult, 'id'> = {
      note,
      rollType,
      lines,
      username,
      user: userDisplayName,
      isZero,
      diceRolled,
      date: Date.now(),
      kind: 'Roll',
      valuationType,
      uid,
    }
    sendRoll(gdoc, userDisplayName, roll)
    reset(state)
  }

export const RollForm: Component<{
  rollConfig: RollConfig
  gdoc: DocumentReference
  uid: string
  userDisplayName: string
}> = (signal, { rollConfig, gdoc, uid, userDisplayName }) => {
  const s = funState<RollFormState>({
    note: '',
    rollState: ['', '', '', '', '', '', '', '', '', ''], // TODO don't flatten this. Use a transform of rollConfig instead
    rollType: '',
    username: '',
    valuationType: 'Action',
    dicePool: [],
  })

  const rollTypes = rollConfig.rollTypes ?? []
  const removeDie = (idx: number): void => s.prop('dicePool').mod(removeAt(idx))
  const setDice = (id: string, dice: DieType[], color: keyof typeof DieColor): void => {
    s.prop('dicePool').mod((ds) => {
      const newDice = dice.map((type, idx): Rollable => ({ type, color, id: `${id}_${idx}` }))
      const xs: Rollable[] = ds.filter((d) => !d.id.startsWith(id)).concat(newDice)
      return xs
    })
  }
  const changeColor = (idx: number): void => s.focus(accessDieColor(idx)).mod(nextColor)

  // Create roll type selector
  const rollTypesContainer = h('div', { className: styles.rollTypes }, [])
  const rollTypeButtons = rollTypes.map((rt) => {
    const btn = hx(
      'button',
      {
        signal,
        props: { type: 'button' },
        on: {
          click: () => {
            s.prop('rollType').set(rt.name)
            const vt = rollTypes.find(({ name }) => name === rt.name)?.valuationType
            if (vt) {
              s.prop('valuationType').set(vt === 'Ask' ? 'Action' : vt)
            }
          },
        },
      },
      [rt.name, ' '],
    )
    return btn
  })
  rollTypesContainer.append(...rollTypeButtons)

  // Compute disabled state
  const disabled$ = funState(true)
  s.watch(signal, ({ rollType, username }) => {
    const currentConfig = rollTypes.find((rt) => rt.name === rollType)
    disabled$.set(!currentConfig?.excludeCharacter && !username.length)
  })

  // Create form content container using bindView to prevent memory leaks
  const formContent = bindView(signal, s.prop('rollType'), (regionSignal, rollType) => {
    const currentConfig = rollTypes.find((rt) => rt.name === rollType)

    if (!currentConfig) {
      return h('div', {}, [])
    }

    const backButton = h('button', { className: styles.backButton }, [Icon(regionSignal, { icon: chevronLeft, size: 18 })])
    hx(
      'button',
      {
        signal: regionSignal,
        props: { type: 'button' },
        on: {
          click: (e: Event) => {
            e.preventDefault()
            reset(s)
          },
        },
      },
      [backButton],
    )

    const characterLabel = !currentConfig.excludeCharacter
      ? h('label', { className: styles.character }, [
          TextInput(regionSignal, {
            passThroughProps: {
              placeholder: 'Character',
              type: 'text',
              name: 'username',
              required: true,
            },
            $: s.prop('username'),
          }),
        ])
      : null

    const valuationLabel = h('label', {}, ['Rules: '])
    const valuationSelect =
      currentConfig?.valuationType === 'Ask'
        ? (() => {
            const select = hx(
              'select',
              {
                signal: regionSignal,
                on: {
                  change: (e) => s.prop('valuationType').set(e.currentTarget.value as ValuationType),
                },
                bind: { value: mapRead(s.prop('valuationType'), String) },
              },
              [
                h('option', { value: 'Action' }, ['Action']),
                h('option', { value: 'Resist' }, ['Resist']),
                h('option', { value: 'Sum' }, ['Sum']),
                h('option', { value: 'Highest' }, ['Highest']),
                h('option', { value: 'Lowest' }, ['Lowest']),
              ],
            )
            valuationLabel.appendChild(select)
            return valuationLabel
          })()
        : null
    const textareaEl = enhance(
      Textarea(regionSignal, {
        passThroughProps: {
          placeholder: 'Description',
          className: styles.noteInput,
        },
        $: s.prop('note'),
      }),
      on(
        'input',
        (e: Event) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = `${target.scrollHeight + 2}px` // 2px is combined border width
        },
        regionSignal,
      ),
    )

    return h('div', { className: styles.formWrap }, [
      DicePool(regionSignal, {
        dicePool$: s.prop('dicePool'),
        roll: roll(gdoc, uid, s, userDisplayName),
        disabled$,
        removeDie,
        changeColor,
      }),
      h('div', { className: styles.formGrid }, [
        h('h3', { className: styles.heading }, [backButton, currentConfig.name]),
        Sections(regionSignal, { state: s.prop('rollState'), sections: currentConfig.sections, setDice }),
        characterLabel,
        valuationSelect,
        h('label', { className: styles.note }, [textareaEl]),
      ]),
    ])
  })
  formContent.style.display = 'none'

  // Watch rollType to control visibility
  s.prop('rollType').watch(signal, (rollType) => {
    const currentConfig = rollTypes.find((rt) => rt.name === rollType)
    if (currentConfig) {
      rollTypesContainer.style.display = 'none'
      formContent.style.display = ''
    } else {
      formContent.style.display = 'none'
      rollTypesContainer.style.display = ''
    }
  })

  return hx('form', { signal, on: { submit: (e: Event) => e.preventDefault() } }, [formContent, rollTypesContainer])
}
