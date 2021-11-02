import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'

import { DISCORD_INVITE_URL } from '../constants/constants'

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
        <div className='content mx-auto max-w-sm' style={{ maxWidth: 700 }}>
          <div className='my-0 text-inverse pt-32 px-6 xs:pt-32 xs:px-20 space-y-4'>
            <h1 className='text-4xl'>👋</h1>
            <h4 className='text-lg'>{t('anErrorOccurredAndWeveBeenNotified')}</h4>
            <h6 className='text-accent-1'>{t('pleaseTryAgainSoon')}</h6>
            <div className='flex space-x-8'>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={'https://pooltogether.com'}
                className='flex'
              >
                {t('home', 'Home')}{' '}
                <FeatherIcon icon={'external-link'} className='w-4 h-4 ml-2 my-auto' />
              </a>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={'https://app.pooltogether.com'}
                className='flex'
              >
                {t('app', 'App')}
                <FeatherIcon icon={'external-link'} className='w-4 h-4 ml-2 my-auto' />
              </a>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={DISCORD_INVITE_URL}
                className='flex'
              >
                Discord <FeatherIcon icon={'external-link'} className='w-4 h-4 ml-2 my-auto' />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
