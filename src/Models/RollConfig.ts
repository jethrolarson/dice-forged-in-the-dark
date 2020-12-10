import { flow } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as T from 'io-ts'

export const RollOptionGroupC = T.intersection([
  T.type({
    name: T.string,
  }),
  T.partial({
    rollOptions: T.array(T.string),
  }),
])

export type RollOptionGroup = T.TypeOf<typeof RollOptionGroupC>

export const RollTypeC = T.intersection([
  T.type({
    name: T.string,
  }),
  T.partial({
    optionGroups: T.array(RollOptionGroupC),
  }),
])

export type RollType = T.TypeOf<typeof RollTypeC>

export const RollConfigC = T.type({
  rollTypes: T.array(RollTypeC),
})

export type RollConfig = T.TypeOf<typeof RollConfigC>

export const parseRollConfig = flow((str: string): E.Either<T.Errors, unknown> => {
  try {
    return E.right(JSON.parse(str))
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return E.left([{ context: [], message: `json parse failed: ${e}`, value: '' }])
  }
}, E.chain(RollConfigC.decode))

const fortune = {
  name: 'Fortune',
}

const engagement = {
  name: 'Engagement',
}

const healing = {
  name: 'Healing',
}

const other = {
  name: 'Other',
  optionGroups: [
    {
      name: 'Roll Type',
    },
    {
      name: '',
    },
    {
      name: '',
    },
  ],
}

export const initialRollConfig: RollConfig = {
  rollTypes: [
    {
      name: 'Action',
      optionGroups: [
        {
          name: 'Action',
          rollOptions: [
            'None',
            'Attune',
            'Command',
            'Consort',
            'Finesse',
            'Hunt',
            'Prowl',
            'Skirmish',
            'Study',
            'Survey',
            'Sway',
            'Tinker',
            'Wreck',
          ],
        },
        { name: 'Position', rollOptions: ['Controlled', 'Risky', 'Desperate'] },
        { name: 'Effect', rollOptions: ['None', 'Limited', 'Standard', 'Great', 'Extreme'] },
      ],
    },
    {
      name: 'Resist',
      optionGroups: [
        {
          name: 'Attribute',
          rollOptions: ['Insight', 'Prowess', 'Resolve'],
        },
      ],
    },
    fortune,
    engagement,
    healing,
    other,
  ],
}

export const nocturneRollConfig: RollConfig = {
  rollTypes: [
    {
      name: 'Action',
      optionGroups: [
        {
          name: 'Action',
          rollOptions: [
            'Fight',
            'Hunt',
            'Pilot',
            'Scramble',
            'Command',
            'Consort',
            'Sneak',
            'Sway',
            'Analyse',
            'Operate',
            'Scan',
            'Hack',
          ],
        },
        { name: 'Position', rollOptions: ['Controlled', 'Risky', 'Desperate', 'Dire'] },
        { name: 'Effect', rollOptions: ['None', 'Limited', 'Standard', 'Great', 'Extreme', 'Transcendant'] },
      ],
    },
    {
      name: 'Resist',
      optionGroups: [
        {
          name: 'Attribute',
          rollOptions: ['Guts', 'Savvy', 'Systems'],
        },
      ],
    },
    fortune,
    engagement,
    healing,
    other,
  ],
}
