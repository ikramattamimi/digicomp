import { createContext, useContext } from 'react'

export const UserContext = createContext()

export const useUserContext = () => {
  let context = useContext(UserContext)
  if (Object.keys(context).length === 0) {
    context = null;
  }

  // if (!context) {
  //   throw new Error('useUserContext must be used within a UserProvider')
  // }
  return context
}