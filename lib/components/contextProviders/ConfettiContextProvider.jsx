import React from 'react'

import { confetti } from 'lib/services/confetti'

export const ConfettiContext = React.createContext(null)

export const ConfettiContextProvider = function ({ children }) {
  return (
    <ConfettiContext.Provider
      value={{
        confetti
      }}
    >
      {children}
    </ConfettiContext.Provider>
  )
}
