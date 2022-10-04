import { PrizePoolDepositList } from '@components/PrizePoolDepositList'
import { CardTitle } from '@components/Text/CardTitle'
import { VotingPromptCard } from '@components/VotingPromptCard'
import { getExchangeUrl } from '@constants/config'
import { POOL_TOKEN } from '@constants/misc'
import { useUsersPoolTokenBalances } from '@hooks/useUsersPoolTokenBalances'
import { Amount, TokenBalances, TokenWithBalance } from '@pooltogether/hooks'
import { TokenIconWithNetwork, PoolIcon } from '@pooltogether/react-components'
import {
  CHAIN_ID,
  formatBlockExplorerAddressUrl,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { LoadingList } from '@views/Account/AccountList/LoadingList'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

export const POOLBalancesCard: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { t } = useTranslation()
  const { data, isFetched, isFetching } = useUsersPoolTokenBalances(usersAddress)
  const walletChainId = useWalletChainId()

  const hasNoPoolBalance = useMemo(() => {
    if (!isFetched) return null
    const chainIds = Object.keys(data.balances).map(Number)
    return chainIds.every((chainId) => {
      return Object.values(data.balances[chainId]).every((token) => !token.hasBalance)
    })
  }, [isFetched, isFetching])

  if (!isFetched) return null

  if (hasNoPoolBalance) {
    return (
      <div className='space-y-2'>
        <div className='flex items-center'>
          <CardTitle title={t('poolToken', 'POOL Token')} loading={!isFetched} />
        </div>
        <div className='bg-gradient-to-br from-pt-purple-lightest to-pt-purple-lighter dark:from-pt-purple dark:to-pt-purple-dark rounded-lg p-4'>
          <div className='flex flex-col xs:flex-row justify-between'>
            <div className='flex flex-col'>
              <div className='flex items-center space-x-2'>
                <PoolIcon />
                <span className='font-bold'>POOL</span>
              </div>
              <span className='text-xxs opacity-50 max-w-xs mt-2'>
                {t('shareIdeasOnPoolTogether')}
              </span>
            </div>
            <a
              className='flex justify-end xs:justify-start space-x-2 items-center mt-4 xs:mt-0'
              target='_blank'
              rel='noopener noreferrer'
              href={
                !!walletChainId && !!POOL_TOKEN[walletChainId]
                  ? getExchangeUrl(walletChainId, POOL_TOKEN[walletChainId])
                  : getExchangeUrl(CHAIN_ID.mainnet, POOL_TOKEN[CHAIN_ID.mainnet])
              }
            >
              <span>{t('getPool', 'Get POOL')}</span>
              <FeatherIcon icon='external-link' className='w-4 h-4 opacity-50' />
            </a>
          </div>
        </div>
      </div>
    )
  }

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
    <PrizePoolDepositList
      bgClassName='bg-gradient-to-br from-pt-purple-lightest to-pt-purple-lighter dark:from-pt-purple dark:to-pt-purple-dark'
      className='flex flex-col'
    >
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
    <a
      href={formatBlockExplorerAddressUrl(token.address, chainId)}
      target='_blank'
      rel='noopener noreferrer'
    >
      <li className='font-semibold transition bg-white bg-opacity-70 dark:bg-actually-black dark:bg-opacity-10 rounded-lg px-4 py-2 w-full flex justify-between items-center'>
        <div className='flex space-x-3 items-center'>
          <TokenIconWithNetwork chainId={chainId} address={token.address} />
          <div className='flex flex-col xs:flex-row xs:items-center items-start xs:space-x-2'>
            <span className='font-bold'>{token.symbol}</span>
            <span className='text-xxs opacity-80'>{token.name}</span>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <PoolIcon />
          <span>{token.amountPretty}</span>
          <FeatherIcon icon='external-link' className='w-4 h-4 opacity-50' />
        </div>
      </li>
    </a>
  )
}
