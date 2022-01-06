import { getAuth, User } from '@firebase/auth'
import React, { useEffect, useState } from 'react'

export const useUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null)
  useEffect(
    () =>
      getAuth().onAuthStateChanged((user) => {
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
