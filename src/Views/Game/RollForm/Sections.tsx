import { index } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { hsla } from 'csx'
import { always, not } from 'ramda'
import React, { FC, useEffect } from 'react'
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
})

const Section: FC<{
  state: FunState<string[]>
  section: SectionT
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
}> = ({ section, state, setDice }) => (
  <div key={section.name} className={styles.Section}>
    {section.optionGroups.map((og) => (
      <OptGroup key={og.name} optionGroup={og} state={state.focus(index(og.line))} setDice={setDice} />
    ))}
  </div>
)

const Builder: FC<{
  state: FunState<string>
  section: BuilderSection
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
}> = ({ section, state, setDice }) => {
  const builderState = useFunState({ values: section.optionGroups.map(always('')), isOpen: false })
  const { values, isOpen } = builderState.get()
  const setOpen = builderState.prop('isOpen').set
  useEffect(() => {
    const dieColor = section.dieColor ?? 'white'
    if (values.every(Boolean)) {
      state.set(values.join(section.separator ?? ' '))
      section.addDieWhenSelected && setDice(section.name, toArray(section.addDieWhenSelected), dieColor)
    } else {
      section.addDieWhenSelected && setDice(section.name, [], dieColor)
    }
  }, values)
  return isOpen ? (
    <div key={section.name} className={styles.Builder}>
      {section.optionGroups.map((og, i) => (
        <OptGroup
          key={og.name}
          optionGroup={og}
          state={builderState.prop('values').focus(index(i))}
          setDice={setDice}
        />
      ))}
      <button onClick={(): void => setOpen(false)} disabled={values.some(Boolean) && values.some(not)}>
        Done
      </button>
    </div>
  ) : (
    <button className={styles.expander} onClick={() => setOpen(true)}>
      {state.get() || section.name}
    </button>
  )
}

export const Sections: FC<{
  state: FunState<string[]>
  sections: RollOptionSection[]
  setDice: (id: string, dice: DieType[], color: keyof typeof DieColor) => void
}> = ({ sections, state, setDice }) => (
  <>
    {sections.map((section, i) =>
      section.sectionType === 'builder' ? (
        <Builder key={section.name} state={state.focus(index(section.line))} section={section} setDice={setDice} />
      ) : section.sectionType === 'modifier' ? (
        <Modifier
          key={section.name}
          section={section}
          setDice={setDice}
          state={typeof section.line === 'undefined' ? undefined : state.focus(index(section.line))}
        />
      ) : section.sectionType === 'row' ? (
        <div className={styles.sectionRow} key={`row${i}`}>
          <Sections state={state} sections={section.sections} setDice={setDice} />
        </div>
      ) : (
        <Section key={section.name} state={state} section={section} setDice={setDice} />
      ),
    )}
  </>
)
