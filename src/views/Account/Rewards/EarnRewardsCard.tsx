import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { useNetworkHexColor, useTokenBalance } from '@pooltogether/hooks'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'

// import { POOLStakingCards } from './POOLStakingCards'

import { CHAIN_ID } from '@constants/misc'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'

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

  if (!promotions) {
    return null
  }

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

  const backgroundColor = useNetworkHexColor(chainId)
  const usersAddress = useUsersAddress()
  const { data: tokenBalance, isFetched } = useTokenBalance(chainId, usersAddress, promotion.token)
  const { symbol } = tokenBalance || {}

  return (
    <div className='rounded-xl text-white p-6' style={{ backgroundColor, minHeight: 100 }}>
      {/* <div>promotionId: {promotion.id}</div> */}
      <div className='flex items-center justify-between font-bold'>
        <div className='flex items-center'>
          Earn{' '}
          <TokenIcon
            sizeClassName='w-4 h-4'
            className='ml-2 mr-1'
            chainId={chainId}
            address={promotion.token}
          />{' '}
          {symbol} on{' '}
          <span className='ml-1 capitalize'>{getNetworkNameAliasByChainId(chainId)}</span>
        </div>
        <div>
          <NetworkIcon
            chainId={chainId}
            className='mr-2 border border-pt-purple-bright'
            sizeClassName='w-8 h-8'
          />
        </div>
      </div>
      <div className='w-3/4'>
        $500,000 of AVAX token rewards will be provided over the next 14 days to all depositors on
        Avalanche.
      </div>
    </div>
  )
}
