import React from 'react'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { SquareLink, SquareButtonTheme, SquareButtonSize } from '@pooltogether/react-components'

import { useTranslation } from 'react-i18next'

export const BackToV3Banner = (props) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col justify-center w-full rounded-xl px-4 py-6 xs:py-8 text-accent-1'>
      <h6 className='text-center mb-2 mx-auto opacity-70'>
        {t('thisIsV4', 'This is V4. Previous pools are on V3.')}
      </h6>

      <div className='opacity-70 hover:opacity-100 transition inline-block mx-auto mt-2'>
        <SquareLink
          Link={Link}
          size={SquareButtonSize.sm}
          theme={SquareButtonTheme.purpleOutline}
          href='https://app.pooltogether.com'
        >
          <FeatherIcon
            icon={'arrow-left'}
            className='relative w-4 h-4 mr-1 inline-block'
            style={{ top: -1 }}
          />
          {t('backToV3', 'Back to V3')}
        </SquareLink>
      </div>
    </div>
  )
}
