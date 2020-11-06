import { gamePath } from './Game'
import * as O from 'fp-ts/lib/Option'
import { constant, pipe } from 'fp-ts/lib/function'
import { DefaultView, defaultView, View, error404View } from './Model'
import { loginPath } from './LoginModel'
import { gameSettingsPath } from './GameSettings'

const rootPath = (path: string): O.Option<DefaultView> => (path === '/' || path === '' ? O.some(defaultView) : O.none)

export const route = (path: string): View =>
  pipe(
    rootPath(path),
    O.alt<View>(() => gamePath(path)),
    O.alt<View>(() => gameSettingsPath(path)),
    O.alt<View>(() => loginPath(path)),
    O.getOrElseW(constant(error404View)),
  )
