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

const ValuationTypeC = T.union([
  T.literal('Action'),
  T.literal('Resist'),
  T.literal('Sum'),
  T.literal('Highest'),
  T.literal('Lowest'),
  T.literal('Ask'),
])

export type ValuationType = T.TypeOf<typeof ValuationTypeC>

export const RollTypeC = T.intersection([
  T.type({
    name: T.string,
  }),
  T.partial({
    optionGroups: T.array(RollOptionGroupC),
    valuationType: ValuationTypeC,
  }),
])

export type RollType = T.TypeOf<typeof RollTypeC>

export const RollConfigC = T.intersection([
  T.type({
    rollTypes: T.array(RollTypeC),
  }),
  T.partial({
    system: T.string,
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
