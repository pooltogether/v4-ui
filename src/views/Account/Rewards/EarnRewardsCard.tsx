import { Trans, useTranslation } from 'react-i18next'
import { BigNumber } from 'ethers'
import { ThemedClipSpinner, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { useToken, useNetworkHexColor } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'

// import { POOLStakingCards } from './POOLStakingCards'

import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { PromotionSummary } from '@views/Account/Rewards/PromotionSummary'
import { usePromotion } from '@hooks/v4/TwabRewards/usePromotion'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { useUsersPromotionRewardsAmount } from '@hooks/V4/TwabRewards/useUsersPromotionRewardsAmount'

export const EarnRewardsCard = () => {
  const { t } = useTranslation()

  const queryResults = useAllChainsFilteredPromotions()

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const isError = queryResults.map((queryResult) => queryResult.isError).filter(Boolean)?.length > 0
  const isAny =
    queryResults
      .map((queryResult) => queryResult.data?.promotions)
      .filter((promotions) => promotions?.length > 0).length > 0

  if (!isAny) {
    return null
  }

  return (
    <div className='flex flex-col space-y-2'>
      <CardTitle
        title={t('earnRewards')}
        // secondary={`$${amount.amountPretty}`}
        loading={!isFetched}
      />

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

      {queryResults.map((queryResult) => {
        const { data } = queryResult || {}
        const { chainId } = data || {}
        if (!data?.promotions || data.promotions.length === 0) {
          return null
        }
        return <ChainPromotions key={`chain-promotions-${chainId}`} queryResult={queryResult} />
      })}

      {/* <POOLStakingCards /> */}
    </div>
  )
}

const ChainPromotions = (props) => {
  const { queryResult } = props

  const { data } = queryResult
  const { chainId, promotions } = data || {}

  return promotions.map((promotion) => (
    <PromotionCard
      key={`pcard-${chainId}-${promotion.id}`}
      promotion={promotion}
      chainId={chainId}
    />
  ))
}

const transformHexColor = (color) => {
  // if rinkeby, return ethereum mainnet color
  if (color === '#e09e0a') {
    return '#4b78ff'
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const PromotionCard = (props) => {
  const { promotion, chainId } = props
  const { id, startTimestamp, numberOfEpochs, tokensPerEpoch, epochDuration, token } = promotion

  const backgroundColor = useNetworkHexColor(chainId)
  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))
  const { data: tokenData, isFetched: tokenDataIsFetched } = useToken(chainId, token)

  const { data: promotionData } = usePromotion(chainId, Number(id))
  const usersAddress = useUsersAddress()

  // currentEpochId does not stop when it hits the max # of epochs for a promotion, so use the
  // smaller of the two resulting numbers
  const currentEpochId = Math.min(promotionData?.currentEpochId, numberOfEpochs - 1)
  console.log({ currentEpochId })

  const { data: usersPromotionData } = useUsersPromotionRewardsAmount(
    chainId,
    Number(id),
    currentEpochId,
    usersAddress
  )
  if (usersPromotionData) {
    console.log(usersPromotionData)
  }

  // Yes, you should be able to call the getCurrentEpochId
  // and pass all the epochs before this one to the getRewardsAmount function.

  return (
    <div
      className='rounded-xl text-white py-5 px-6'
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
      <div className='w-full xs:w-10/12'>
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
      <br />
      if currentEpochId is 0, cannot get any rewards amount... estimate?
      <br />
      currentEpochId: {currentEpochId}
    </div>
  )
}
