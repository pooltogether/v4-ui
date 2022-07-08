import React from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import FeatherIcon from 'feather-icons-react'
import { TokenIcon } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

import { CHAIN_ID } from '@constants/misc'
import { useAppEnvString } from '@hooks/useAppEnvString'
import { FILTERED_PROMOTION_IDS } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'

const OPTIMISM_OP_ADDRESS = '0x4200000000000000000000000000000000000042'

export const RewardsBanners = () => {
  const { t } = useTranslation()

  const page = location.pathname

  // Only show Optimism Rewards banner if we're on testnets with optimism-kovan having a promotion
  // or on mainnets with optimism having a promotion
  const appEnv = useAppEnvString()
  if (appEnv === 'testnets' && FILTERED_PROMOTION_IDS[CHAIN_ID['optimism-kovan']].length < 1) {
    return null
  }
  if (appEnv === 'mainnets' && FILTERED_PROMOTION_IDS[CHAIN_ID.optimism].length < 1) {
    return null
  }

  return (
    <div className='px-8 w-full text-center py-3 z-50 bg-pt-red'>
      <div className='text-xxs xs:text-sm flex flex-col xs:flex-row mx-auto items-center justify-center'>
        <div className='mb-1 xs:mb-0 xs:mr-3'>
          <span className='flex items-center font-bold'>
            <TokenIcon
              chainId={CHAIN_ID.optimism}
              address={OPTIMISM_OP_ADDRESS}
              className='border xs:border-2 border-white mr-1 xs:mr-2'
              sizeClassName='w-4 h-4 xs:w-6 xs:h-6'
            />{' '}
            {t('optimismRewardsNowAvailable', 'Optimism rewards now available')}!
          </span>{' '}
        </div>

        <div
          className={classNames(
            'flex items-center justify-center w-full font-averta-bold space-x-4',
            {
              'xs:w-56': page !== '/account',
              'xs:w-32': page === '/account'
            }
          )}
        >
          <Link href={`https://app.optimism.io/bridge`}>
            <a
              className='flex items-center h-8 uppercase text-white text-opacity-80 hover:text-opacity-100'
              target='_blank'
            >
              {t('bridge')}{' '}
              <FeatherIcon
                icon='external-link'
                className={'relative w-4 h-4 ml-2'}
                style={{ top: -1 }}
              />
            </a>
          </Link>
          {page !== '/account' && (
            <Link href='/account'>
              <a className='flex items-center h-8 uppercase text-white text-opacity-80 hover:text-opacity-100'>
                {t('account')}{' '}
                <FeatherIcon
                  icon='chevron-right'
                  className={'relative w-4 h-4'}
                  style={{ top: -1 }}
                />
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
