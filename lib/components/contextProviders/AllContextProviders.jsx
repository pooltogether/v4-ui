import React from 'react'
import { ThemeContextProvider } from '@pooltogether/react-components'

import { ConfettiContextProvider } from 'lib/components/contextProviders/ConfettiContextProvider'

export function AllContextProviders(props) {
  const { children } = props

  return (
    <ThemeContextProvider>
      <ConfettiContextProvider>{children}</ConfettiContextProvider>
    </ThemeContextProvider>
  )
}
