import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { SquareLink, SquareButtonTheme, SquareButtonSize } from '@pooltogether/react-components'

import { useTranslation } from 'react-i18next'

export const BackToV3Banner = (props) => {
  const { t } = useTranslation()

  return (
    <div className='bg-card flex flex-col xs:flex-row flex-col-reverse items-center text-center w-full rounded-xl px-4 py-3 xs:py-2 text-accent-1'>
      <SquareLink
        size={SquareButtonSize.sm}
        theme={SquareButtonTheme.purpleOutline}
        href='https://app.pooltogether.com'
        className='items-center block xs:inline xs:mr-auto'
      >
        <FeatherIcon
          icon={'arrow-left'}
          className='relative w-4 h-4 mr-1 inline-block'
          style={{ top: -1 }}
        />
        {t('backToV3', 'Back to V3')}
      </SquareLink>
      <h6 className='text-center mb-2 xs:mb-0'>
        {t('thisIsV4', 'This is V4. Previous pools are on V3.')}
      </h6>
    </div>
  )
}
