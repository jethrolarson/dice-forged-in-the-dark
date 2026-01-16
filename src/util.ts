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

// Helper for combining CSS class names
export const classes = (...args: (string | false | undefined | null)[]): string =>
  args.filter((arg): arg is string => Boolean(arg)).join(' ')