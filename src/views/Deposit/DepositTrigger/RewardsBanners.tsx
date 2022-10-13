import { FILTERED_PROMOTION_IDS } from '@constants/promotions'
import { useAppEnvString } from '@hooks/useAppEnvString'
import { TokenIcon } from '@pooltogether/react-components'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'

const OPTIMISM_OP_ADDRESS = '0x4200000000000000000000000000000000000042'

export const RewardsBanners = (props: { className?: string }) => {
  const { className } = props
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
    <div
      className={classNames(
        'px-2 xs:px-8 bg-actually-black bg-opacity-5 dark:bg-actually-black dark:bg-opacity-50 w-full max-w-screen-xs mx-auto xs:rounded-lg py-2 text-pt-purple-darkest dark:text-white flex space-x-6 justify-center text-center sm:text-left text-xxxs sm:text-xs',
        className
      )}
    >
      <div className='flex-inline space-x-2 items-center'>
        <span>📣</span>
        {/* {t('optimismRewardsNowAvailable', 'Optimism rewards now available')}! */}
        <span>
          Deposit on Optimism for <b>OP</b> <b className='text-flashy'>Bonus Rewards</b>!
        </span>
        <TokenIcon
          chainId={CHAIN_ID.optimism}
          address={OPTIMISM_OP_ADDRESS}
          sizeClassName='w-4 h-4'
        />
        <img className='w-4 h-4 inline-block' src='/beach-with-umbrella.png' />
      </div>

      {/* <div className='text-xxs xs:text-xs flex flex-col xs:flex-row mx-auto items-center justify-center'>
        <div className='my-1 xs:my-0 xs:mr-3'> </div>
      </div> */}
    </div>
  )
}
