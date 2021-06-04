import React from 'react'

import { ConfettiContextProvider } from 'lib/components/contextProviders/ConfettiContextProvider'
import { ThemeContextProvider } from '@pooltogether/react-components'

export function AllContextProviders(props) {
  const { children } = props

  return (
    <ThemeContextProvider>
      <ConfettiContextProvider>{children}</ConfettiContextProvider>
    </ThemeContextProvider>
  )
}
