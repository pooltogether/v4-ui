import { useUsersAddress } from '@pooltogether/wallet-connection'
import { Trans, useTranslation } from 'react-i18next'
import { BigNumber } from 'ethers'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { useNetworkHexColor, useTokenBalance } from '@pooltogether/hooks'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'

// import { POOLStakingCards } from './POOLStakingCards'

import { CHAIN_ID } from '@constants/misc'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { PromotionSummary } from '@views/Account/Rewards/PromotionSummary'

export const EarnRewardsCard = () => {
  const { t } = useTranslation()

  const queryResults = useAllChainsFilteredPromotions()

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const isError = queryResults.map((queryResult) => queryResult.isError).filter(Boolean)?.length > 0

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
        console.log(data)
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

const PromotionCard = (props) => {
  const { promotion, chainId } = props
  console.log(promotion)

  const { t } = useTranslation()

  const backgroundColor = useNetworkHexColor(chainId)
  const usersAddress = useUsersAddress()
  const { data: tokenBalance, isFetched } = useTokenBalance(chainId, usersAddress, promotion.token)
  const { symbol } = tokenBalance || {}

  const { startTimestamp, numberOfEpochs, tokensPerEpoch, epochDuration, token } = promotion

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))

  return (
    <div className='rounded-xl text-white py-5 px-6' style={{ backgroundColor, minHeight: 100 }}>
      <div className='flex items-center justify-between font-bold'>
        <div className='flex items-center'>
          <Trans
            i18nKey='earnTokenOnChain'
            values={{ networkName }}
            components={{
              TokenIcon: (
                <TokenIcon
                  sizeClassName='w-4 h-4'
                  className='mx-1'
                  chainId={chainId}
                  address={promotion.token}
                />
              )
            }}
          />
        </div>
        <div>
          <NetworkIcon chainId={chainId} className='border-2' sizeClassName='w-8 h-8' />
        </div>
      </div>
      <div className='w-3/4'>
        <PromotionSummary
          isIndex
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
    </div>
  )
}
