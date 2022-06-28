import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import {
  ContractLink,
  BalanceBottomSheet,
  ThemedClipSpinner,
  NetworkIcon,
  TokenIcon,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { useToken, useNetworkHexColor, useCoingeckoTokenPrices } from '@pooltogether/hooks'
import { useUsersAddress, useIsWalletOnChainId } from '@pooltogether/wallet-connection'
import {
  displayPercentage,
  numberWithCommas,
  getNetworkNameAliasByChainId
} from '@pooltogether/utilities'

import { useIsWalletMetamask } from '@hooks/useIsWalletMetamask'
import { useUsersChainTwabPercentage } from '@hooks/v4/TwabRewards/useUsersChainTwabPercentage'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { useUsersPromotionRewardsAmount } from '@hooks/v4/TwabRewards/useUsersPromotionRewardsAmount'
import { capitalizeFirstLetter, transformHexColor } from '@utils/TwabRewards/misc'
import { loopXTimes } from '@utils/loopXTimes'

// PREDICTION / ESTIMATE:
// (user twab balance for epoch / twab total supply for epoch) * tokensPerEpoch

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
      <CardTitle title={t('rewards')} loading={!isFetched} />

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
    </div>
  )
}

const ChainPromotions = (props) => {
  const { queryResult } = props

  const { t } = useTranslation()

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
        {t('chainPoolParty', { networkName })}
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

const PromotionRow = (props) => {
  const { promotion, chainId } = props
  const { id, maxCompletedEpochId, token } = promotion

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)

  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

  const { data: tokenData, isFetched: tokenDataIsFetched } = useToken(chainId, token)

  const usersAddress = useUsersAddress()

  const { data: usersPromotionData } = useUsersPromotionRewardsAmount(
    chainId,
    Number(id),
    maxCompletedEpochId,
    usersAddress
  )

  // TODO: Contract links necessary?
  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: '0xface'
    }
  ]
  const onDismiss = () => setIsOpen(false)

  const balances = {
    ticket: {
      address: '0xface',
      symbol: 'PTSD',
      name: 'PT SD',
      decimals: '18',
      amount: '321',
      amountUnformatted: BigNumber.from(0),
      amountPretty: '1234'
    }
  }

  return (
    <>
      {!tokenDataIsFetched ? (
        <RewardsCardLoadingList listItems={1} />
      ) : (
        <>
          <PromotionListItem
            onClick={() => {
              // setSelectedChainId(chainId)
              setIsOpen(true)
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
                <RewardsBalance
                  promotion={promotion}
                  usersPromotionData={usersPromotionData}
                  tokenData={tokenData}
                  chainId={chainId}
                />{' '}
                <FeatherIcon icon='chevron-right' className='my-auto w-6 h-6 opacity-50' />
              </div>
            }
          />

          <BalanceBottomSheet
            title={'rewards'}
            open={isOpen}
            label={`mng rewards`}
            onDismiss={onDismiss}
            chainId={chainId}
            // internalLinks={
            //   <Link href={{ pathname: '/deposit', query: router.query }}>
            //     <SquareLink
            //       size={SquareButtonSize.md}
            //       theme={SquareButtonTheme.teal}
            //       className='w-full'
            //     >
            //       {t('deposit')}
            //     </SquareLink>
            //   </Link>
            // }
            views={[
              {
                id: 'claim',
                view: () => (
                  <div></div>
                  // <WithdrawView
                  //   usersAddress={usersAddress}
                  //   prizePool={prizePool}
                  //   balances={balances}
                  //   setWithdrawTxId={setTxId}
                  //   onDismiss={onDismiss}
                  //   refetchBalances={refetchBalances}
                  // />
                ),
                label: t('claim'),
                theme: SquareButtonTheme.rainbow
              }
            ]}
            moreInfoViews={[
              {
                id: 'delegate',
                view: () => (
                  <div>hello</div>

                  // <DelegateView
                  //   prizePool={prizePool}
                  //   balances={balances}
                  //   refetchBalances={refetchBalances}
                  // />
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
      )}
    </>
  )
}

// (user twab balance for epoch / twab total supply for epoch) * tokensPerEpoch
// my twab: 200 for epoch 1
// twab total supply (currently for 1 chain): 1000 for epoch 1
// 200/1000 (or 20%) is my vApr
// 30 tokens given away for epoch 1
// = I get 6 tokens for epoch 1
// remaining epochs: 8
// 6 * 8 = 48
// I'll get 48 tokens over the entire time if nothing changes

const RewardsBalance = (props) => {
  const { usersPromotionData, tokenData, chainId, promotion } = props
  const { decimals } = tokenData
  const { tokensPerEpoch, remainingEpochs } = promotion

  let claimable = BigNumber.from(0)
  if (usersPromotionData) {
    usersPromotionData.rewardsAmount.split(',').forEach((numString) => {
      const amountUnformatted = BigNumber.from(numString)
      claimable = claimable.add(amountUnformatted)
    })
  }

  const { data: tokenPrices } = useCoingeckoTokenPrices(chainId, [tokenData.address])

  let claimableUsd
  if (tokenPrices?.[tokenData.address]) {
    claimableUsd = Number(formatUnits(claimable, decimals)) * tokenPrices[tokenData.address].usd
  }

  const usersAddress = useUsersAddress()

  const { data: usersChainRewardsTwabPercentage, isFetched } = useUsersChainTwabPercentage(
    chainId,
    usersAddress
  )

  const percentage = usersChainRewardsTwabPercentage

  const estimate = percentage * parseFloat(formatUnits(tokensPerEpoch, decimals)) * remainingEpochs
  // TODO: Proper USD conversions
  const estimateUsd = 4124

  const estimateAndClaimableUsd = estimate + claimableUsd

  // $1.53
  // $181.92

  return (
    <div
      className={classNames('flex items-center leading-none font-bold mr-3', {
        'opacity-50': estimateAndClaimableUsd <= 0
      })}
    >
      {isFetched ? (
        <>${numberWithCommas(estimateAndClaimableUsd)}</>
      ) : (
        <ThemedClipSpinner sizeClassName='w-4 h-4' className='opacity-70' />
      )}
    </div>
  )
}

interface PromotionListItemProps {
  left: React.ReactNode
  right: React.ReactNode
  onClick: () => void
}

const PromotionListItem = (props: PromotionListItemProps) => {
  const { onClick, left, right } = props

  return (
    <li className='transition bg-white bg-opacity-10 hover:bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg'>
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

export const RewardsCardLoadingList = (props: {
  listItems: number
  bgClassName?: string
  className?: string
}) => (
  <ul>
    {loopXTimes(props.listItems, (i) => (
      <li
        key={`loading-list-${i}`}
        className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10'
      />
    ))}
  </ul>
)

RewardsCardLoadingList.defaultProps = {
  listItems: 1
}
