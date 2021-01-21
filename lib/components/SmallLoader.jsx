import React, { useContext } from 'react'
import ContentLoader from 'react-content-loader'

import { ThemeContext } from 'lib/components/contextProviders/ThemeContextProvider'

export const SmallLoader = (props) => {
  if (!window) {
    return null
  }

  const { theme } = useContext(ThemeContext)

  const bgColor = theme === 'light' ? '#ffffff' : '#401C94'
  const foreColor = theme === 'light' ? '#f5f5f5' : '#501C94'

  return (
    <>
      <ContentLoader
        gradientRatio={2.5}
        interval={0.05}
        speed={0.6}
        viewBox='0 0 50 30'
        backgroundColor={bgColor}
        foregroundColor={foreColor}
      >
        <rect x='0' y='0' rx='5' ry='5' width='50' height='30' />
      </ContentLoader>
    </>
  )
}
