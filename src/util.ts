import { not, viewed } from '@fun-land/accessor'
import { FunRead } from '@fun-land/fun-state'


export const toArray = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x])

export const notAcc = viewed(not, not)

export const hideWhen =
  (state: FunRead<boolean>, signal: AbortSignal) =>
  <E extends Element>(el: E): E => {
    state.watch(signal, (hidden) => (hidden ? el.setAttribute('hidden', 'hidden') : el.removeAttribute('hidden')))
    return el
  }

export const hideUnless = (state: FunRead<boolean>, signal: AbortSignal) => hideWhen(state.focus(notAcc), signal)