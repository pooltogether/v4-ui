import { FILTERED_PROMOTION_IDS } from '@constants/promotions'
import { useAppEnvString } from '@hooks/useAppEnvString'
import { TokenIcon } from '@pooltogether/react-components'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'

const OPTIMISM_OP_ADDRESS = '0x4200000000000000000000000000000000000042'

export const RewardsBanners = () => {
  const { t } = useTranslation()

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
    <div className='mb-6 xs:mb-8 px-4 xs:px-8 bg-actually-black bg-opacity-5 dark:bg-actually-black dark:bg-opacity-50 w-full max-w-xl mx-auto xs:rounded-lg py-2 text-pt-purple-darkest dark:text-white flex space-x-6 justify-center'>
      <div className='flex space-x-2 items-center'>
        <TokenIcon
          chainId={CHAIN_ID.optimism}
          address={OPTIMISM_OP_ADDRESS}
          sizeClassName='w-4 h-4'
        />
        <span className='flex items-center font-bold'>
          {t('optimismRewardsNowAvailable', 'Optimism rewards now available')}!
        </span>
      </div>

      <Link href={`https://app.hop.exchange`}>
        <a
          className='flex items-center h-auto xs:h-8 uppercase text-pt-purple-darkest opacity-80 dark:text-white dark:text-opacity-80 hover:text-opacity-100 font-bold'
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

      {/* <div className='text-xxs xs:text-xs flex flex-col xs:flex-row mx-auto items-center justify-center'>
        <div className='my-1 xs:my-0 xs:mr-3'> </div>
      </div> */}
    </div>
  )
}
