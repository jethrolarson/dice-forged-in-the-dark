import { getAuth, User } from '@firebase/auth'
import { funState, FunState } from '@fun-land/fun-state'

/**
 * Get a FunState that tracks the current Firebase Auth user
 * Watch it to respond to auth state changes
 */
export const getUser = (signal: AbortSignal): FunState<User | null> => {
  const userState = funState<User | null>(getAuth().currentUser)

  const unsubscribe = getAuth().onAuthStateChanged((user) => {
    userState.set(user)
  })

  signal.addEventListener('abort', unsubscribe)

  return userState
}
