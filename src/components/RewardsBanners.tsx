import React from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import FeatherIcon from 'feather-icons-react'
import { TokenIcon } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

import { CHAIN_ID } from '@constants/misc'

const OPTIMISM_OP_ADDRESS = '0x4200000000000000000000000000000000000042'

export const RewardsBanners = () => {
  const { t } = useTranslation()

  const page = location.pathname

  return (
    <div className='px-8 w-full text-center py-3 z-50 bg-pt-red bg-opacity-80'>
      <div className='text-xxs xs:text-xs flex flex-col xs:flex-row mx-auto items-center justify-center'>
        <div className='mb-1 xs:mb-0 xs:mr-3'>
          <span className='font-bold'>
            <TokenIcon chainId={CHAIN_ID.optimism} address={OPTIMISM_OP_ADDRESS} /> Optimism rewards
            now available!
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
          <Link
            href={`https://app.hop.exchange/#/send?token=ETH&sourceNetwork=ethereum&destNetwork=optimism`}
          >
            <a
              className='flex items-center h-8 uppercase text-white text-opacity-70 hover:text-opacity-100'
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
              <a className='flex items-center h-8 uppercase text-white text-opacity-70 hover:text-opacity-100'>
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
