import { Trans, useTranslation } from 'react-i18next'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import classNames from 'classnames'
import { ThemedClipSpinner, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { useToken, useNetworkHexColor } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { numberWithCommas, getNetworkNameAliasByChainId } from '@pooltogether/utilities'

import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { PromotionSummary } from '@views/Account/Rewards/PromotionSummary'
import { usePromotion } from '@hooks/v4/TwabRewards/usePromotion'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { useUsersPromotionRewardsAmount } from '@hooks/V4/TwabRewards/useUsersPromotionRewardsAmount'

export const RewardsCard = () => {
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
        title={t('rewards')}
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

  const backgroundColor = useNetworkHexColor(chainId)
  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))

  return (
    <div
      className='rounded-xl text-white py-5 px-6'
      style={{ backgroundColor: transformHexColor(backgroundColor), minHeight: 100 }}
    >
      <div className='flex items-center font-bold mb-4'>
        <NetworkIcon chainId={chainId} className='mr-2' sizeClassName='w-5 h-5' />
        <Trans i18nKey='chainPoolParty' defaults='pool party' values={{ networkName }} />
      </div>
      <PromotionsList chainId={chainId} promotions={promotions} />
    </div>
  )
}

const PromotionsList = (props) => {
  const { chainId, promotions } = props

  return (
    <PromotionList>
      {promotions.map((promotion) => (
        <PromotionRow
          key={`pcard-${chainId}-${promotion.id}`}
          promotion={promotion}
          chainId={chainId}
        />
      ))}
    </PromotionList>
  )
}

const transformHexColor = (color) => {
  // if rinkeby, return ethereum mainnet color
  if (color === '#e09e0a') {
    return '#4b78ff'
  }
}

const darkenHexColor = (color) => {
  // if rinkeby, return ethereum mainnet color
  if (color === '#e09e0a') {
    return '#2b58bf'
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const PromotionRow = (props) => {
  const { promotion, chainId } = props
  const { id, startTimestamp, numberOfEpochs, tokensPerEpoch, epochDuration, token } = promotion

  const { t } = useTranslation()

  const backgroundColor = useNetworkHexColor(chainId)
  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))
  const { data: tokenData, isFetched: tokenDataIsFetched } = useToken(chainId, token)

  const { data: promotionData } = usePromotion(chainId, Number(id))
  const usersAddress = useUsersAddress()

  // currentEpochId does not stop when it hits the max # of epochs for a promotion, so use the
  // smaller of the two resulting numbers
  const currentEpochId = Math.min(promotionData?.currentEpochId, numberOfEpochs - 1)

  const { data: usersPromotionData } = useUsersPromotionRewardsAmount(
    chainId,
    Number(id),
    currentEpochId,
    usersAddress
  )

  // Yes, you should be able to call the getCurrentEpochId
  // and pass all the epochs before this one to the getRewardsAmount function.

  return (
    <>
      {!tokenDataIsFetched ? (
        <ThemedClipSpinner />
      ) : (
        <>
          <PromotionListItem
            chainId={chainId}
            onClick={() => {
              // setSelectedChainId(chainId)
              // setIsOpen(true)
            }}
            left={
              <div className='flex items-center'>
                <img className='w-5 mr-2' src='beach-with-umbrella.png' /> {tokenData.symbol}{' '}
                {t('rewards')}
              </div>
            }
            right={
              <div className='flex items-center'>
                <TokenIcon
                  chainId={chainId}
                  address={token}
                  sizeClassName='w-5 h-5'
                  className='mr-2'
                />
                <RewardsBalance usersPromotionData={usersPromotionData} tokenData={tokenData} />
              </div>
            }
          />
        </>
      )}
    </>
  )
}

const RewardsBalance = (props) => {
  const { usersPromotionData, tokenData } = props
  const { decimals } = tokenData

  let claimable = BigNumber.from(0)
  if (usersPromotionData) {
    usersPromotionData.rewardsAmount.split(',').forEach((numString) => {
      const amountUnformatted = BigNumber.from(numString)
      claimable = claimable.add(amountUnformatted)
    })
  }

  return (
    <div
      className={classNames('leading-none font-bold mr-3', {
        'opacity-50': claimable.isZero()
      })}
    >
      {numberWithCommas(formatUnits(claimable, decimals))}
    </div>
  )
}

{
  /* 
<BalanceBottomSheet
            title={t('depositsOnNetwork', { network: getNetworkNiceNameByChainId(chainId) })}
            open={isOpen}
            label={`Manage deposits for ${prizePool.id()}`}
            onDismiss={onDismiss}
            chainId={chainId}
            delegate={delegate}
            internalLinks={
              <Link href={{ pathname: '/deposit', query: router.query }}>
                <SquareLink
                  size={SquareButtonSize.md}
                  theme={SquareButtonTheme.teal}
                  className='w-full'
                >
                  {t('deposit')}
                </SquareLink>
              </Link>
            }
            views={[
              {
                id: 'withdraw',
                view: () => (
                  <WithdrawView
                    usersAddress={usersAddress}
                    prizePool={prizePool}
                    balances={balances}
                    setWithdrawTxId={setTxId}
                    onDismiss={onDismiss}
                    refetchBalances={refetchBalances}
                  />
                ),
                label: t('withdraw'),
                theme: SquareButtonTheme.tealOutline
              }
            ]}
            moreInfoViews={[
              {
                id: 'delegate',
                view: () => (
                  <DelegateView
                    prizePool={prizePool}
                    balances={balances}
                    refetchBalances={refetchBalances}
                  />
                ),
                icon: 'gift',
                label: t('delegateDeposit', 'Delegate deposit'),
                theme: SquareButtonTheme.teal
              }
            ]}
            token={balances.ticket}
            balance={balances.ticket}
            balanceUsd={balances.ticket}
            t={t}
            contractLinks={contractLinks}
            isWalletOnProperNetwork={isWalletOnProperNetwork}
            isWalletMetaMask={isWalletMetaMask}
          />
        </>
      )} */
}

interface PromotionListItemProps {
  chainId: number
  left: React.ReactNode
  right: React.ReactNode
  onClick: () => void
}

const PromotionListItem = (props: PromotionListItemProps) => {
  const { chainId, onClick, left, right } = props

  const backgroundColor = useNetworkHexColor(chainId)

  // return (
  //   <div className='rounded-lg mb-2' style={{ backgroundColor: darkenHexColor(backgroundColor) }}>
  //     asdf
  //   </div>
  // )

  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg '>
      <button className='px-4 py-2 w-full flex justify-between items-center' onClick={onClick}>
        {left}
        {right}
      </button>
    </li>
  )
}

const PromotionList = (props: {
  className?: string
  bgClassName?: string
  children: React.ReactNode
}) => (
  <ul className={classNames('rounded-lg space-y-2', props.bgClassName, props.className)}>
    {props.children}
  </ul>
)

PromotionList.defaultProps = {}
