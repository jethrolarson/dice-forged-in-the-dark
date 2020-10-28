import { gamePath } from './Game'
import * as O from 'fp-ts/lib/Option'
import { constant, pipe } from 'fp-ts/lib/function'
import { GameView } from './GameModel'
import { DefaultView, defaultView, View, error404View } from './Model'

const rootPath = (path: string): O.Option<DefaultView> => (path === '/' || path === '' ? O.some(defaultView) : O.none)

export const route = (path: string): View =>
  pipe(
    rootPath(path),
    O.alt<GameView | DefaultView>(() => gamePath(path)),
    O.getOrElseW(constant(error404View))
  )
