import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import { BigNumber } from 'ethers'
import { ThemedClipSpinner, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { useToken, useNetworkHexColor } from '@pooltogether/hooks'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'

import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { PromotionSummary } from '@views/Account/Rewards/PromotionSummary'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { usePromotionDaysRemaining } from '@hooks/v4/TwabRewards/promotionHooks'
import { capitalizeFirstLetter, transformHexColor } from '@utils/TwabRewards/misc'

export const EarnRewardsCard = () => {
  const { t } = useTranslation()

  const queryResults = useAllChainsFilteredPromotions()

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const isError = queryResults.map((queryResult) => queryResult.isError).filter(Boolean)?.length > 0
  const chainPromotions = queryResults.map((queryResult) => queryResult.data?.promotions)

  let count = 0
  chainPromotions?.forEach((promotions) => {
    console.log(promotions)
    promotions?.forEach((promotion) => {
      const daysRemaining = usePromotionDaysRemaining(promotion)

      if (daysRemaining > 0) {
        count += promotions?.length
      }
    })
  })

  const moreThanOnePromotion = count > 1

  if (count < 1) {
    return null
  }

  return (
    <div className='flex flex-col space-y-2'>
      <CardTitle title={t('earnRewards')} loading={!isFetched} />

      {!isFetched && (
        <LoadingList
          listItems={1}
          bgClassName='bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple'
        />
      )}

      {isError && (
        <div>
          Unable to fetch rewards data due to subgraph issue, come back to check your rewards later!
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
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

const ChainPromotions = (props) => {
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

const PromotionCard = (props) => {
  const { promotion, chainId, moreThanOnePromotion } = props
  const { startTimestamp, numberOfEpochs, tokensPerEpoch, epochDuration, token } = promotion

  const backgroundColor = useNetworkHexColor(chainId)
  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))
  const { data: tokenData, isFetched: tokenDataIsFetched } = useToken(chainId, token)

  const daysRemaining = usePromotionDaysRemaining(promotion)

  if (daysRemaining < 0) {
    return null
  }

  return (
    <div
      className={classNames('flex-none rounded-xl text-white p-4 text-xxs xs:text-sm', {
        'xs:w-96 w-64': moreThanOnePromotion,
        'xs:w-full': !moreThanOnePromotion
      })}
      style={{ backgroundColor: transformHexColor(backgroundColor), minHeight: 100 }}
    >
      <div className='flex items-center justify-between font-bold'>
        <div className='flex items-center mb-2'>
          {!tokenDataIsFetched ? (
            <ThemedClipSpinner />
          ) : (
            <Trans
              i18nKey='earnTokenSymbol'
              defaults='<TokenIcon /> Earn {{tokenSymbol}}'
              values={{ tokenSymbol: tokenData?.symbol }}
              components={{
                TokenIcon: (
                  <TokenIcon
                    sizeClassName='w-4 h-4'
                    className='mr-1'
                    chainId={chainId}
                    address={promotion.token}
                  />
                )
              }}
            />
          )}
        </div>
        <div className='relative' style={{ top: -4 }}>
          <NetworkIcon chainId={chainId} sizeClassName='w-5 h-5 xs:w-6 xs:h-6' />
        </div>
      </div>

      <PromotionSummary
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
