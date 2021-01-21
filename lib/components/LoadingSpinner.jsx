import React, { useContext } from 'react'

import { ThemeContext } from 'lib/components/contextProviders/ThemeContextProvider'

export const LoadingSpinner = ({}) => {
  const { theme } = useContext(ThemeContext)

  const lightClass = theme === 'dark' && 'white'

  return <span className={`inline-block loader01 ${lightClass}`}></span>
}
