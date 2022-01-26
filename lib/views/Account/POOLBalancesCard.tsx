import { Amount, TokenWithUsdBalance } from '.yalc/@pooltogether/hooks/dist'
import { BigNumber } from '@ethersproject/bignumber'
import { NetworkIcon, ThemedClipSpinner, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { LoadingList } from 'lib/components/Loaders/LoadingList'
import { SwapTokensModalTrigger } from 'lib/components/Modal/SwapTokensModal'
import { CardTitle } from 'lib/components/Text/CardTitle'
import { CHAIN_ID } from 'lib/constants/constants'
import { POOL_ADDRESSES } from 'lib/constants/v3'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useUsersV3POOLTokenBalances } from 'lib/hooks/v3/useUsersV3POOLTokenBalances'
import { useTranslation } from 'react-i18next'

export const POOLBalancesCard = () => {
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersV3POOLTokenBalances(usersAddress)

  return (
    <div>
      <CardTitle
        className='mb-2'
        title={t('poolToken', 'POOL Token')}
        secondary={
          isFetched ? (
            `$${data.totalValueUsd.amountPretty}`
          ) : (
            <ThemedClipSpinner sizeClassName='w-3 h-3' />
          )
        }
      />
      <div className='relative bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple rounded-lg px-4 py-4 mb-4'>
        <POOLBalancesList data={data} isFetched={isFetched} />
      </div>
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
    return <LoadingList listItems={2} />
  }

  const chainIds = Object.keys(data.balances).map(Number)

  return (
    <ul className='space-y-4'>
      {chainIds.map((chainId) =>
        data.balances[chainId].flatMap((token) => (
          <POOLTokenBalanceItem
            key={`POOL-balance-${chainId}-${token.address}`}
            chainId={chainId}
            token={token}
          />
        ))
      )}
    </ul>
  )
}

const POOLTokenBalanceItem = (props: { chainId: number; token: TokenWithUsdBalance }) => {
  const { chainId, token } = props
  const { t } = useTranslation()

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
        {!token.hasBalance && (
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
