import { not, viewed } from '@fun-land/accessor'
import { type StateEngine, type Listener, type Unsubscribe, pureState, FunState } from '@fun-land/fun-state'


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

type Unwrap<S> = S extends FunState<infer T> ? T : never
type UnwrapTuple<T extends readonly FunState<any>[]> = { [I in keyof T]: Unwrap<T[I]> }

// -------- core implementation --------

function deriveFromTuple<States extends readonly FunState<any>[], Out>(
  states: readonly [...States],
  mergeFn: (...values: UnwrapTuple<States>) => Out,
): FunState<Out> {
  const engine: StateEngine<Out> = {
    getState: () => {
      const values = states.map((s) => s.get()) as unknown as UnwrapTuple<States>
      return mergeFn(...values)
    },

    modState: () => {
      throw new Error('derive: cannot mod a derived state')
    },

    subscribe: (listener: Listener<Out>): Unsubscribe => {
      // Fan-in: when any input state changes, notify the derived engine listener.
      // Important: FunState.watch calls the callback immediately, but StateEngine.subscribe
      // should NOT. So we skip the first emission per input.
      const ctrls = states.map(() => new AbortController())

      const emit = (): void => {
        listener(engine.getState())
      }

      for (let i = 0; i < states.length; i++) {
        let first = true
        states[i].watch(ctrls[i].signal, () => {
          if (first) {
            first = false
            return
          }
          emit()
        })
      }

      return () => {
        for (const c of ctrls) c.abort()
      }
    },
  }

  return pureState(engine)
}

export function derive<States extends readonly FunState<any>[], Out>(
  ...args: [...states: States, mergeFn: (...values: UnwrapTuple<States>) => Out]
): FunState<Out> {
  const mergeFn = args[args.length - 1] as (...values: UnwrapTuple<States>) => Out
  const states = args.slice(0, -1) as unknown as readonly [...States]
  return deriveFromTuple(states, mergeFn)
}
