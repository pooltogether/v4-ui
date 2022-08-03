import React, { useMemo } from 'react'
import { Amount, TokenBalances, TokenWithBalance } from '@pooltogether/hooks'
import { TokenIconWithNetwork, TokenIcon, PoolIcon } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { CHAIN_ID } from '@constants/misc'
import { POOL_ADDRESSES } from '@constants/v3'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { PrizePoolDepositList } from '@components/PrizePoolDepositList'
import { VotingPromptCard } from '@components/VotingPromptCard'
import { useUsersPoolTokenBalances } from '@hooks/useUsersPoolTokenBalances'

export const POOLBalancesCard = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data, isFetched, isFetching } = useUsersPoolTokenBalances(usersAddress)

  const hasNoPoolBalance = useMemo(() => {
    if (!isFetched) return null
    const chainIds = Object.keys(data.balances).map(Number)
    return chainIds.every((chainId) => {
      return Object.values(data.balances[chainId]).every((token) => !token.hasBalance)
    })
  }, [isFetching])

  if (!isFetched || hasNoPoolBalance) return null

  return (
    <div className='space-y-2'>
      <div className='flex items-center'>
        <CardTitle title={t('poolToken', 'POOL Token')} loading={!isFetched} />
      </div>
      <POOLBalancesList data={data} isFetched={isFetched} />
      <VotingPromptCard persist />
    </div>
  )
}

const POOLBalancesList = (props: {
  data: {
    balances: { [chainId: number]: TokenBalances }
    total: Amount
  }
  isFetched: boolean
}) => {
  const { data, isFetched } = props

  if (!isFetched) {
    return (
      <LoadingList
        listItems={2}
        bgClassName='bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple'
      />
    )
  }
  const chainIds = Object.keys(data.balances).map(Number)

  return (
    <PrizePoolDepositList bgClassName='bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple'>
      {chainIds.map((chainId) =>
        Object.values(data.balances[chainId]).map((token) => (
          <POOLTokenBalanceItem
            key={`POOL-balance-${chainId}-${token.address}`}
            chainId={chainId}
            token={token}
          />
        ))
      )}
    </PrizePoolDepositList>
  )
}

const POOLTokenBalanceItem = (props: { chainId: number; token: TokenWithBalance }) => {
  const { chainId, token } = props

  if (!token.hasBalance) return null

  return (
    <li className='font-semibold transition bg-white bg-opacity-70 dark:bg-actually-black dark:bg-opacity-10 rounded-lg px-4 py-2 w-full flex justify-between items-center'>
      <div className='flex space-x-2 items-center'>
        <TokenIconWithNetwork chainId={chainId} address={token.address} />
        <span className='font-bold'>{token.symbol}</span>
        <span className='text-xxs opacity-80'>{token.name}</span>
      </div>

      <div className='flex items-center space-x-2'>
        <PoolIcon />
        <span>{token.amountPretty}</span>
      </div>
    </li>
  )
}
