import * as E from 'fp-ts/lib/Either'
import { Errors } from 'io-ts'

export const validateTitle =
  <T>(title: string) =>
  (e: E.Either<Errors, T>): E.Either<Errors, T> =>
    title.length ? e : E.left<Errors, T>([{ value: 'title', context: [], message: 'Game Name is required' }])
