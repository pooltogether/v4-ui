import React, { useState } from 'react'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-js-client'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useStakingPools, useIsTestnets } from '@pooltogether/hooks'

import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useSelectedChainIdUser } from 'lib/hooks/Tsunami/User/useSelectedChainIdUser'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { ManageBalanceSheet } from './ManageBalanceSheet'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
// import { DelegateTicketsSection } from './DelegateTicketsSection'

// export interface StakingPool {
//   ticket: TokenWithBalance
// }

export const StakingDeposits = () => {
  const { t } = useTranslation()
  return (
    <div id='staking'>
      <h4 className='mb-2'>{t('staking')}</h4>
      <div className='bg-pt-purple-lightest dark:bg-pt-purple rounded-lg p-4'>
        <StakingDepositsList />
      </div>
    </div>
  )
}

const StakingDepositsList = () => {
  const usersAddress = useUsersAddress()
  // const queryResults = useUsersStakingBalances(usersAddress)
  const stakingPools = useStakingPools()

  const user = useSelectedChainIdUser()

  // const { isTestnets } = useIsTestnets()
  // const chainId = isTestnets ? NETWORK.rinkeby : NETWORK.mainnet

  // const queryResults = useUsersV4Balances(usersAddress)
  // const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  // if (!isFetched) {
  //   return <LoadingList />
  // }
  // if (!isFetched) {
  //   return <LoadingList />
  // }

  return (
    <ul className='space-y-4'>
      {stakingPools.map((stakingPool) => (
        <StakingDepositItem
          key={`staking-pool-${stakingPool.prizePool.chainId}-${stakingPool.prizePool.address}`}
          stakingPool={stakingPool}
        />
      ))}
    </ul>
  )
}

// interface StakingDepositItemsProps {
//   stakingPool: StakingPool
//   prizePool: PrizePool
// }

const StakingDepositItem = (props) => {
  const { stakingPool } = props
  const { prizePool } = stakingPool
  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedChainId } = useSelectedChainId()

  console.log({ stakingPool })
  console.log({ prizePool })

  const balances = {
    ticket: {
      address: '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076',
      amount: '4.038629',
      amountPretty: '4.03',
      amountUnformatted: { _hex: '0x3d9fe5', _isBigNumber: true },
      decimals: 6,
      hasBalance: true,
      name: 'PoolTogether aUSDC Ticket',
      symbol: 'PTaUSDC'
    }
  }

  return (
    <li className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg '>
      <button
        className='hover:bg-white hover:bg-opacity-10 rounded-lg transition p-4 w-full flex justify-between items-center'
        onClick={() => {
          setSelectedChainId(prizePool.chainId)
          setIsOpen(true)
        }}
      >
        <NetworkLabel chainId={prizePool.chainId} />
        {/* <StakingDepositBalance {...props} /> */}
      </button>
      <ManageBalanceSheet
        {...props}
        balances={balances}
        prizePool={prizePool}
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
      />
    </li>
  )
}

const NetworkLabel = (props: { chainId: number }) => (
  <div className='flex'>
    <NetworkIcon chainId={props.chainId} className='mr-2 my-auto' />
    <span className='font-bold xs:text-lg'>{getNetworkNiceNameByChainId(props.chainId)}</span>
  </div>
)

// const StakingDepositBalance = (props: StakingDepositItemsProps) => {
//   const { balances, prizePool } = props
//   const { ticket } = balances
//   return (
//     <div className='flex'>
//       <TokenIcon chainId={prizePool.chainId} address={ticket.address} className='mr-2 my-auto' />
//       <span className={classNames('font-bold text-lg mr-3', { 'opacity-50': !ticket.hasBalance })}>
//         ${ticket.amountPretty}
//       </span>
//       <FeatherIcon icon='chevron-right' className='my-auto h-8 w-8 opacity-50' />
//     </div>
//   )
// }

const LoadingList = () => (
  <ul className='space-y-4'>
    <li className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10' />
    <li className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10' />
  </ul>
)
