import React from 'react'

import { useTranslation } from 'react-i18next'

export function Tagline(props) {
  const { t } = useTranslation()

  return (
    <>
      <div className='text-center mt-12 opacity-60 pb-40'>
        <div className='text-accent-1 text-xxs xs:text-xs sm:text-base'>
          {t('theMoreYouPoolTagline')}
        </div>
      </div>
    </>
  )
}
