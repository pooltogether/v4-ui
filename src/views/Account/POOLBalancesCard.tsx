import React, { useState, useMemo } from 'react'
import FeatherIcon from 'feather-icons-react'
import { Amount, TokenWithUsdBalance } from '@pooltogether/hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { Modal, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useTranslation } from 'react-i18next'

import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { CHAIN_ID } from '@constants/misc'
import { POOL_ADDRESSES } from '@constants/v3'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useUsersV3POOLTokenBalances } from '@hooks/v3/useUsersV3POOLTokenBalances'
import { PrizePoolDepositList } from '@components/PrizePoolDepositList'
import { UniswapWidgetCard } from '@views/UniswapWidgetCard'
import { VotingPromptCard } from '@components/VotingPromptCard'

export const POOLBalancesCard = () => {
  const { t } = useTranslation()
  // const [showSwapModal, setShowSwapModal] = useState(false)

  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersV3POOLTokenBalances(usersAddress)

  // const openModal = () => {
  //   setShowSwapModal(true)
  // }

  // const closeModal = () => {
  //   setShowSwapModal(false)
  // }

  return (
    <div className='space-y-2'>
      <div className='flex items-center'>
        <CardTitle
          title={t('poolToken', 'POOL Token')}
          secondary={`$${data?.totalValueUsd.amountPretty}`}
          loading={!isFetched}
        />
        {/* <Modal label={'hi'} isOpen={showSwapModal} closeModal={closeModal}>
          <UniswapWidgetCard />
        </Modal>
        <button
          onClick={openModal}
          className='opacity-50 hover:opacity-100 flex items-center transition-opacity'
        >
          <FeatherIcon
            icon={'refresh-cw'}
            className='relative w-3 h-3 mr-2 inline-block'
            style={{ top: 1 }}
          />{' '}
          {t('getPool')}
        </button> */}
      </div>
      <POOLBalancesList data={data} isFetched={isFetched} />
      <VotingPromptCard />
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
      </div>
    </li>
  )
}
