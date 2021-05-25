import React from 'react'

import { ConfettiContextProvider } from 'lib/components/contextProviders/ConfettiContextProvider'
import { ThemeContextProvider } from 'lib/components/contextProviders/ThemeContextProvider'

export function AllContextProviders(props) {
  const { children } = props

  return (
    <ThemeContextProvider>
      <ConfettiContextProvider>{children}</ConfettiContextProvider>
    </ThemeContextProvider>
  )
}
