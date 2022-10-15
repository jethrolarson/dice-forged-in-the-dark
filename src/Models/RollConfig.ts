import { flow } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as T from 'io-ts'

const WithTooltip = T.partial({
  tooltip: T.string,
})

const DieTypeC = T.literal('d6')

export const RollOptionC = T.union([
  T.string,
  T.intersection([
    T.type({
      name: T.string,
    }),
    T.partial({
      addDieWhenSelected: T.array(DieTypeC),
    }),
  ]),
])

export type RollOption = T.TypeOf<typeof RollOptionC>

export const BuilderOptionGroupC = T.intersection([
  T.type({
    name: T.string,
  }),
  T.partial({
    rollOptions: T.array(RollOptionC),
    columns: T.number,
    showLabel: T.boolean,
    fixedOptions: T.boolean,
  }),
  WithTooltip,
])

export type BuilderOptionGroup = T.TypeOf<typeof BuilderOptionGroupC>

export const RollOptionGroupC = T.intersection([
  BuilderOptionGroupC,
  T.type({
    line: T.number,
  }),
])

export type RollOptionGroup = T.TypeOf<typeof RollOptionGroupC>

const ValuationTypeC = T.union([
  T.literal('Action'),
  T.literal('Resist'),
  T.literal('Sum'),
  T.literal('Highest'),
  T.literal('Lowest'),
  T.literal('Ask'),
  T.literal('Quality'),
])

export type ValuationType = T.TypeOf<typeof ValuationTypeC>

const DieColorC = T.union([
  T.literal('green'),
  T.literal('purple'),
  T.literal('red'),
  T.literal('white'),
  T.literal('yellow'),
])

export const BuilderSectionC = T.intersection([
  T.type({
    name: T.string,
    line: T.number,
    sectionType: T.literal('builder'),
    optionGroups: T.array(BuilderOptionGroupC),
  }),
  T.partial({
    addDieWhenSelected: T.union([DieTypeC, T.array(DieTypeC)]), // can add others once we support more dice sizes
    dieColor: DieColorC,
    separator: T.string,
  }),
])

export type BuilderSection = T.TypeOf<typeof BuilderSectionC>

export const SectionC = T.type({
  sectionType: T.literal('normal'),
  name: T.string,
  optionGroups: T.array(RollOptionGroupC),
})

export const ModifierC = T.intersection([
  WithTooltip,
  T.type({
    sectionType: T.literal('modifier'),
    name: T.string,
    dieColor: DieColorC,
    dieType: DieTypeC,
    baseModifier: T.number,
    max: T.number,
    min: T.number,
    showLabel: T.boolean,
  }),
  T.partial({
    line: T.number,
  }),
])

export const RowC = T.type({
  sectionType: T.literal('row'),
  sections: T.array(T.union([SectionC, BuilderSectionC, ModifierC])),
})

export type ModifierT = T.TypeOf<typeof ModifierC>

export type SectionT = T.TypeOf<typeof SectionC>

export const RollOptionSectionC = T.union([SectionC, BuilderSectionC, ModifierC, RowC])

export type RollOptionSection = T.TypeOf<typeof RollOptionSectionC>

export const RollTypeC = T.intersection([
  T.type({
    name: T.string,
    valuationType: ValuationTypeC,
    sections: T.array(RollOptionSectionC),
  }),
  T.partial({
    hideDice: T.boolean,
    excludeCharacter: T.boolean,
  }),
])

export type RollType = T.TypeOf<typeof RollTypeC>

export const RollConfigC = T.intersection([
  T.type({
    system: T.string,
  }),
  T.partial({
    rollTypes: T.array(RollTypeC),
  }),
])

export type RollConfig = T.TypeOf<typeof RollConfigC>

export const parseRollConfig = flow((str: string): E.Either<T.Errors, unknown> => {
  try {
    return E.right(JSON.parse(str))
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return E.left([{ context: [], message: `json parse failed: ${e}`, value: '' }])
  }
}, E.chain(RollConfigC.decode))
