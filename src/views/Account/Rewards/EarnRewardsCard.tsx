import { DepositModal } from '@components/Modal/DepositModal'
import { CardTitle } from '@components/Text/CardTitle'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { useChainActiveRewards } from '@hooks/v4/TwabRewards/useChainActiveRewards'
import { Promotion } from '@interfaces/promotions'
import { useToken } from '@pooltogether/hooks'
import { ThemedClipSpinner, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { getChainColorByChainId } from '@pooltogether/wallet-connection'
import { capitalizeFirstLetter } from '@utils/v4/TwabRewards/misc'
import { getPromotionDaysRemaining } from '@utils/v4/TwabRewards/promotionHooks'
import { LoadingList } from '@views/Account/AccountList/LoadingList'
import { PromotionSummary } from '@views/Account/Rewards/PromotionSummary'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { UseQueryResult } from 'react-query'

export const EarnRewardsCard: React.FC<{ className?: string }> = (props) => {
  const { t } = useTranslation()

  const { data: activeChainRewards, isFetched, isError } = useChainActiveRewards()
  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  const openDepositModal = async (prizePool: PrizePool) => {
    setSelectedPrizePoolAddress(prizePool)
    await setIsOpen(true)
  }

  const { queryResults, activeCount } = activeChainRewards
  const zero = activeCount < 1
  const moreThanOnePromotion = activeCount > 1

  if (zero) {
    return null
  }

  return (
    <>
      <div className={classNames(props.className)}>
        {!isFetched && (
          <LoadingList
            listItems={1}
            bgClassName='bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple'
          />
        )}

        {isError && (
          <div>
            Unable to fetch rewards data due to subgraph issue, come back to check your rewards
            later!
          </div>
        )}

        <div
          className={classNames({
            'linear-fade--right': moreThanOnePromotion
          })}
        >
          <div
            className={classNames({
              'flex space-x-4 overflow-x-auto': moreThanOnePromotion,
              'space-y-4': !moreThanOnePromotion
            })}
          >
            {queryResults.map((queryResult) => {
              const { data } = queryResult || {}
              const { chainId } = data || {}

              if (!data?.promotions || data.promotions.length === 0) {
                return null
              }

              return (
                <ChainPromotions
                  key={`chain-promotions-${chainId}`}
                  queryResult={queryResult}
                  moreThanOnePromotion={moreThanOnePromotion}
                  openDepositModal={openDepositModal}
                />
              )
            })}
          </div>
        </div>
      </div>
      <DepositModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}

const ChainPromotions = (props: {
  queryResult: UseQueryResult<
    {
      chainId: number
      promotions: Promotion[]
      hasActivePromotions: boolean
    },
    unknown
  >
  moreThanOnePromotion: boolean
  openDepositModal: (prizePool: PrizePool) => void
}) => {
  const { queryResult } = props

  const { data } = queryResult
  const { chainId, promotions } = data || {}

  return promotions.map((promotion) => (
    <PromotionCard
      {...props}
      key={`pcard-${chainId}-${promotion.id}`}
      promotion={promotion}
      chainId={chainId}
    />
  ))
}

const PromotionCard = (props: {
  chainId: number
  promotion: Promotion
  moreThanOnePromotion: boolean
  openDepositModal: (prizePool: PrizePool) => void
}) => {
  const { promotion, chainId, moreThanOnePromotion, openDepositModal } = props
  const { startTimestamp, numberOfEpochs, tokensPerEpoch, epochDuration, token } = promotion

  // TODO: This assumes there is only one prize pool per chain
  const prizePool = usePrizePoolByChainId(chainId)

  const backgroundColor = getChainColorByChainId(chainId)
  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))
  const { data: tokenData, isFetched: tokenDataIsFetched } = useToken(chainId, token)

  const daysRemaining = getPromotionDaysRemaining(promotion)

  if (daysRemaining < 0) {
    return null
  }

  return (
    <div
      className={classNames('flex-none rounded-xl text-white p-4 text-xxs xs:text-sm', {
        'xs:w-96 w-64': moreThanOnePromotion,
        'xs:w-full': !moreThanOnePromotion
      })}
      style={{ backgroundColor: backgroundColor, minHeight: 100 }}
    >
      <div className='flex items-center justify-between font-bold'>
        <div className='flex items-center mb-2 space-x-2'>
          <span>📣</span>
          {!tokenDataIsFetched ? <ThemedClipSpinner /> : <span>Bonus Rewards</span>}
        </div>
        <div className='relative' style={{ top: -4 }}>
          <NetworkIcon chainId={chainId} sizeClassName='w-5 h-5 xs:w-6 xs:h-6' />
        </div>
      </div>

      <PromotionSummary
        onDepositClick={() => openDepositModal(prizePool)}
        className='mt-2 xs:mt-0'
        chainId={chainId}
        startTimestamp={startTimestamp}
        numberOfEpochs={numberOfEpochs}
        tokensPerEpoch={BigNumber.from(tokensPerEpoch)}
        epochDuration={epochDuration}
        token={token}
        networkName={networkName}
      />
    </div>
  )
}
