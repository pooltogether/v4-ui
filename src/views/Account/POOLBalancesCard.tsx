import { Amount, TokenWithUsdBalance } from '@pooltogether/hooks'
import { BigNumber } from '@ethersproject/bignumber'
import FeatherIcon from 'feather-icons-react'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useTranslation } from 'react-i18next'

import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { SwapTokensModalTrigger } from '@components/Modal/SwapTokensModal'
import { CardTitle } from '@components/Text/CardTitle'
import { CHAIN_ID } from '@constants/misc'
import { POOL_ADDRESSES } from '@constants/v3'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useUsersV3POOLTokenBalances } from '@hooks/v3/useUsersV3POOLTokenBalances'
import { PrizePoolDepositList } from '@components/PrizePoolDepositList'
import { useMemo } from 'react'
import { useUniswapSupportsNetwork } from '@hooks/useUniswapSupportsNetwork'

export const POOLBalancesCard = () => {
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersV3POOLTokenBalances(usersAddress)
  const uniswapSupportsNetwork = useUniswapSupportsNetwork()
  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <CardTitle
          title={t('poolToken', 'POOL Token')}
          secondary={`$${data?.totalValueUsd.amountPretty}`}
          loading={!isFetched}
        />
        {!uniswapSupportsNetwork && (
          <a
            className='opacity-50 hover:opacity-100 flex items-center transition-opacity'
            target='_blank'
            rel='noopener noreferrer'
            href={`https://app.uniswap.org/#/swap?chain=mainnet&theme=dark&outputCurrency=0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e&inputCurrency=ETH`}
          >
            {t('getPool')}
            <FeatherIcon icon='external-link' className='w-4 h-4 ml-1' />
          </a>
        )}
      </div>
      <POOLBalancesList data={data} isFetched={isFetched} />
    </div>
  )
}

const POOLBalancesList = (props: {
  data: {
    balances: {
      [chainId: number]: TokenWithUsdBalance[]
    }
    totalValueUsdScaled: BigNumber
    totalValueUsd: Amount
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
        data.balances[chainId].flatMap((token) => (
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

const POOLTokenBalanceItem = (props: { chainId: number; token: TokenWithUsdBalance }) => {
  const { chainId, token } = props
  const { t } = useTranslation()

  const uniswapSupportsNetwork = useUniswapSupportsNetwork()
  const showSwapModalTrigger = useMemo(
    () => !token.hasBalance && !uniswapSupportsNetwork,
    [token, uniswapSupportsNetwork]
  )

  return (
    <li className='font-semibold transition bg-white bg-opacity-70 dark:bg-actually-black dark:bg-opacity-10 rounded-lg p-4 w-full flex justify-between items-center'>
      <div className='flex'>
        <NetworkIcon chainId={chainId} className='mr-2 my-auto' />
        <span className='font-bold xs:text-lg'>{getNetworkNiceNameByChainId(chainId)}</span>
      </div>

      <div className='flex items-center xs:text-lg space-x-2'>
        <TokenIcon
          chainId={CHAIN_ID.mainnet}
          address={POOL_ADDRESSES[CHAIN_ID.mainnet].pool}
          className='my-auto'
        />
        <span>{token.amountPretty}</span>
        {showSwapModalTrigger && (
          <SwapTokensModalTrigger
            className='pl-1'
            buttonLabel={t('getPool', 'Get POOL')}
            chainId={chainId}
            outputCurrencyAddress={token.address}
          />
        )}
      </div>
    </li>
  )
}
