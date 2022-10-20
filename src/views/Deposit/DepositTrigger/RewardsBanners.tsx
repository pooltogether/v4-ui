import { DepositModal } from '@components/Modal/DepositModal'
import { FILTERED_PROMOTION_IDS } from '@constants/promotions'
import { useAppEnvString } from '@hooks/useAppEnvString'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { TokenIcon } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

const OPTIMISM_OP_ADDRESS = '0x4200000000000000000000000000000000000042'

/**
 * NOTE: This is a temporary component to allow users to deposit into the Optimism Prize Pool and notify them of ongoing rewards
 * @param props
 * @returns
 */
export const RewardsBanners = (props: { className?: string }) => {
  const { className } = props
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  const optimismPrizePool = usePrizePoolByChainId(CHAIN_ID.optimism)

  const onPrizePoolSelect = async () => {
    setSelectedPrizePoolAddress(optimismPrizePool)
    await setIsOpen(true)
  }

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
    <>
      <button
        onClick={() => onPrizePoolSelect()}
        className={classNames(
          'px-2 xs:px-8 bg-actually-black bg-opacity-5 hover:bg-opacity-20 dark:bg-actually-black dark:bg-opacity-50 dark:hover:bg-opacity-100 transition w-full max-w-screen-xs mx-auto xs:rounded-lg py-2 text-pt-purple-darkest dark:text-white flex space-x-6 justify-center text-center sm:text-left text-xxxs sm:text-xs hover:shadow-md',
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
      </button>
      <DepositModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}
