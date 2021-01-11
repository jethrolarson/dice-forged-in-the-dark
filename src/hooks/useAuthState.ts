import fireApp from 'firebase/app'
import { useEffect, useState } from 'react'

export const useUser = (): fireApp.User | null => {
  const [user, setUser] = useState<fireApp.User | null>(null)
  useEffect(
    () =>
      fireApp.auth().onAuthStateChanged((user) => {
        if (user) {
          setUser(user)
        } else {
          setUser(null)
        }
      }),
    [],
  )
  return user
}
