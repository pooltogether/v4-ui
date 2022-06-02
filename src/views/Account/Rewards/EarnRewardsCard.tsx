import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'

// import { POOLStakingCards } from './POOLStakingCards'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'

export const EarnRewardsCard = () => {
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  const queryResults = useAllChainsFilteredPromotions()

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const isError = queryResults.map((queryResult) => queryResult.isError).filter(Boolean)?.length > 0
  console.log(queryResults)
  console.log(queryResults.map((queryResult) => queryResult.isError))
  console.log({ isError })

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
        return <ChainPromotions queryResult={queryResult} />
      })}

      {/* <POOLStakingCards /> */}
    </div>
  )
}

const ChainPromotions = (props) => {
  const { queryResult } = props
  console.log({ queryResult })

  const { data } = queryResult
  const { chainId, promotions } = data || {}
  console.log({ promotions })

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

  return (
    <>
      <div>promotionId: {promotion.id}</div>
      <div>token: {promotion.token}</div>

      <NetworkIcon chainId={chainId} className='mr-2' sizeClassName='w-4 h-4' />

      <TokenIcon
        sizeClassName='w-6 h-6'
        className='mr-2'
        chainId={chainId}
        address={promotion.token}
      />
    </>
  )
}
