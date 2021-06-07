import React from 'react'

import { useTranslation } from 'react-i18next'

export function ErrorPage() {
  const { t } = useTranslation()

  return (
    <>
      <div
        className='flex flex-col w-full'
        style={{
          minHeight: '100vh'
        }}
      >
        <div className='content mx-auto' style={{ maxWidth: 700 }}>
          <div className='my-0 text-inverse pt-32 px-6 xs:pt-32 xs:px-20'>
            <h4>{t('anErrorOccurredAndWeveBeenNotified')}</h4>
            <h6>{t('pleaseTryAgainSoon')}</h6>
          </div>
        </div>
      </div>
    </>
  )
}
