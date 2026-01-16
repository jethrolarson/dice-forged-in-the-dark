import { index } from '@fun-land/accessor'
import { funState, FunState, mapRead } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { hsla } from 'csx'
import { always, not } from 'ramda'
import { stylesheet } from 'typestyle'
import { DieColor, DieType } from '../../../Models/Die'
import { BuilderSection, RollOptionSection, SectionT } from '../../../Models/RollConfig'
import { toArray } from '../../../util'
import { Modifier } from './Modifier'
import { OptGroup } from './OptGroup'

const styles = stylesheet({
  Section: {
    display: 'flex',
    gap: 10,
  },
  Builder: {
    display: 'grid',
    gap: 10,
    border: '1px solid var(--border-color)',
    backgroundColor: hsla(0, 0, 0, 0.3).toString(),
    padding: 5,
  },
  heading: {
    fontWeight: 'normal',
    display: 'block',
    border: 0,
    textAlign: 'left',
    $nest: {
      '&::before': {
        float: 'right',
        content: '"ᐃ"',
        marginRight: -5,
      },
    },
  },
  expander: {
    borderWidth: 1,
    textAlign: 'left',
    $nest: {
      '&::before': {
        float: 'right',
        content: '"ᐁ"',
      },
    },
  },
  sectionRow: {
    display: 'flex',
    gap: 5,
    $nest: {
      '&>*': {
        flexGrow: 1,
      },
    },
  },
  hidden: {
    display: 'none',
  },
})

const Section: Component<{
  state: FunState<string[]>
  section: SectionT
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
}> = (signal, { section, state, setDice }) =>
  h(
    'div',
    { className: styles.Section },
    section.optionGroups.map((og) =>
      OptGroup(signal, { optionGroup: og, state: state.focus(index(og.line)), setDice }),
    ),
  )

const Builder: Component<{
  state: FunState<string>
  section: BuilderSection
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
}> = (signal, { section, state, setDice }) => {
  const builderState = funState({ values: section.optionGroups.map(always('')), isOpen: false })

  const builderDiv = h('div', { className: styles.Builder }, [
    ...section.optionGroups.map((og, i) =>
      OptGroup(signal, { optionGroup: og, state: builderState.prop('values').focus(index(i)), setDice }),
    ),
    hx('button', { signal, props: { type: 'button' }, on: { click: () => builderState.prop('isOpen').set(false) } }, [
      'Done',
    ]),
  ])

  const expanderButton = hx(
    'button',
    {
      signal,
      props: { className: styles.expander },
      bind: { textContent: mapRead(state, (value) => value || section.name) },
      on: { click: () => builderState.prop('isOpen').set(true) },
    },
    [],
  )

  builderDiv.classList.add(styles.hidden)

  // Watch builder state
  builderState.watch(signal, ({ values, isOpen }) => {
    const dieColor = section.dieColor ?? 'white'
    if (values.every(Boolean)) {
      state.set(values.join(section.separator ?? ' '))
      section.addDieWhenSelected && setDice(section.name, toArray(section.addDieWhenSelected), dieColor)
    } else {
      section.addDieWhenSelected && setDice(section.name, [], dieColor)
    }

    // Update UI based on open state
    if (isOpen) {
      builderDiv.classList.remove(styles.hidden)
      expanderButton.classList.add(styles.hidden)
      // Update done button disabled state
      const doneButton = builderDiv.querySelector('button:last-child') as HTMLButtonElement
      if (doneButton) {
        doneButton.disabled = values.some(Boolean) && values.some(not)
      }
    } else {
      builderDiv.classList.add(styles.hidden)
      expanderButton.classList.remove(styles.hidden)
    }
  })

  return h('div', {}, [builderDiv, expanderButton])
}

export const Sections: Component<{
  state: FunState<string[]>
  sections: RollOptionSection[]
  setDice: (id: string, dice: DieType[], color: keyof typeof DieColor) => void
}> = (signal, { sections, state, setDice }) =>
  h(
    'div',
    { style: { display: 'contents' } },
    sections.map((section) =>
      section.sectionType === 'builder'
        ? Builder(signal, { state: state.focus(index(section.line)), section, setDice })
        : section.sectionType === 'modifier'
          ? Modifier(signal, {
              section,
              setDice,
              state: typeof section.line === 'undefined' ? undefined : state.focus(index(section.line)),
            })
          : section.sectionType === 'row'
            ? h('div', { className: styles.sectionRow }, [
                Sections(signal, { state, sections: section.sections, setDice }),
              ])
            : Section(signal, { state, section, setDice }),
    ),
  )
