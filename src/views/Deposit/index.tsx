import { PagePadding } from '@components/Layout/PagePadding'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { DepositTrigger } from './DepositTrigger'
import { RewardsBanners } from './DepositTrigger/RewardsBanners'
import { PrizePoolNetworkCarousel } from './PrizePoolNetworkCarousel'

export const DepositUI = () => {
  return (
    <PagePadding
      pxClassName=''
      widthClassName=''
      className={classNames('flex flex-col space-y-2 xs:space-y-4 sm:space-y-8 lg:space-y-12')}
      style={{ minHeight: '620px' }}
    >
      {/* TODO: Uncomment next week <RewardsBanners /> */}
      <NewUiBanner />
      <PrizePoolNetworkCarousel />
      <DepositTrigger />
    </PagePadding>
  )
}

const NewUiBanner = () => {
  const { t } = useTranslation()
  return (
    <a
      href='https://medium.com/pooltogether/a-new-look-e2b6dfac9a93'
      rel='noopener noreferrer'
      target='_blank'
      className={classNames(
        'px-2 xs:px-8 bg-actually-black bg-opacity-5 hover:bg-opacity-20 dark:bg-actually-black dark:bg-opacity-50 dark:hover:bg-opacity-100 transition w-full max-w-screen-xs mx-auto xs:rounded-lg py-2 text-pt-purple-darkest dark:text-white flex flex-row items-center justify-center text-center text-xxxs sm:text-xs hover:shadow-md'
      )}
    >
      <span>
        📣 {t('newDesign')} <b className='text-flashy'>{t('readMore')}</b>
        <FeatherIcon
          icon='arrow-up-right'
          className='ml-1 mb-0.5 w-2 h-2 xs:w-3 xs:h-3 inline-block'
        />{' '}
        📣
      </span>
    </a>
  )
}
