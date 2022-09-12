import React from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import FeatherIcon from 'feather-icons-react'
import { TokenIcon } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { useAppEnvString } from '@hooks/useAppEnvString'
import { FILTERED_PROMOTION_IDS } from '@constants/promotions'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

const OPTIMISM_OP_ADDRESS = '0x4200000000000000000000000000000000000042'

export const RewardsBanners = () => {
  const { t } = useTranslation()

  const page = location.pathname

  // Only show Optimism Rewards banner if we're on testnets with optimism-goerli having a promotion
  // or on mainnets with optimism having a promotion
  const appEnv = useAppEnvString()
  const optimismGoerliPromotions = FILTERED_PROMOTION_IDS[CHAIN_ID['optimism-goerli']]
  if (appEnv === 'testnets' && optimismGoerliPromotions.length < 1) {
    return null
  }

  const optimismPromotions = FILTERED_PROMOTION_IDS[CHAIN_ID.optimism]
  if (appEnv === 'mainnets' && optimismPromotions.length < 1) {
    return null
  }

  return (
    <div className='px-8 bg-actually-black w-full text-center py-2 z-50 text-white'>
      <div className='text-xxs xs:text-xs flex flex-col xs:flex-row mx-auto items-center justify-center'>
        <div className='my-1 xs:my-0 xs:mr-3'>
          <span className='flex items-center font-bold'>
            <TokenIcon
              chainId={CHAIN_ID.optimism}
              address={OPTIMISM_OP_ADDRESS}
              className='mr-1 xs:mr-2'
              sizeClassName='w-4 h-4'
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
          <Link href={`https://app.hop.exchange`}>
            <a
              className='flex items-center h-auto xs:h-8 uppercase text-white text-opacity-80 hover:text-opacity-100'
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
              <a className='flex items-center h-auto xs:h-8 uppercase text-white text-opacity-80 hover:text-opacity-100'>
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
