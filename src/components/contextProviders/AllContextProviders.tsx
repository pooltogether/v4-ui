import React from 'react'
import { ThemeContextProvider } from '@pooltogether/react-components'

export function AllContextProviders(props) {
  const { children } = props

  return <ThemeContextProvider>{children}</ThemeContextProvider>
}
