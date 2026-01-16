import { not, viewed } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'


export const toArray = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x])

//TODO remove when fun-land 5.1 is published
export const bindClass =
  (className: string, state: FunState<boolean>, signal: AbortSignal) =>
  <E extends Element>(el: E): E => {
    state.watch(signal, (active) => el.classList.toggle(className, active))
    return el
  }

export const notAcc = viewed(not, not)

export const hideWhen =
  (state: FunState<boolean>, signal: AbortSignal) =>
  <E extends Element>(el: E): E => {
    state.watch(signal, (hidden) => (hidden ? el.setAttribute('hidden', 'hidden') : el.removeAttribute('hidden')))
    return el
  }

export const hideUnless = (state: FunState<boolean>, signal: AbortSignal) => hideWhen(state.focus(notAcc), signal)