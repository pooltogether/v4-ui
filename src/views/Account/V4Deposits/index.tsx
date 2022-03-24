import { useState } from 'react'
import {
  BalanceBottomSheet,
  ContractLink,
  NetworkIcon,
  SquareButtonSize,
  SquareButtonTheme,
  SquareLink
} from '@pooltogether/react-components'

import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTransaction } from '@pooltogether/hooks'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { UsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useUsersV4Balances } from '@hooks/v4/PrizePool/useUsersV4Balances'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { DelegateTicketsSection } from './DelegateTicketsSection'
import { CardTitle } from '@components/Text/CardTitle'
import { BalanceDelegatedToItem } from './BalanceDelegatedToItem'
import { WithdrawView } from './WithdrawView'
import { useIsWalletMetamask } from '@hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from '@hooks/useIsWalletOnNetwork'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { PrizePoolDepositList } from '@components/PrizePoolDepositList'
import { PrizePoolDepositListItem } from '@components/PrizePoolDepositList/PrizePoolDepositListItem'
import { PrizePoolDepositBalance } from '@components/PrizePoolDepositList/PrizePoolDepositBalance'
import { DelegateView } from './DelegateView'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { getAddress } from 'ethers/lib/utils'
import { ethers } from 'ethers'
import { TwabDelegatorItem, useAllDelegations } from './TwabDelegatorItem'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'

export const V4Deposits = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data } = useUsersV4Balances(usersAddress)

  return (
    <div id='deposits'>
      <CardTitle
        className='mb-2'
        title={t('deposits')}
        secondary={`$${data?.totalValueUsd.amountPretty}`}
      />
      <DepositsList />
    </div>
  )
}

const DepositsList = () => {
  const usersAddress = useUsersAddress()
  const { data, isFetched, refetch } = useUsersV4Balances(usersAddress)
  if (!isFetched) {
    return <LoadingList />
  }
  return (
    <PrizePoolDepositList>
      {data.balances.map((balances) => (
        <DepositItem
          key={'deposit-balance-' + balances.prizePool.id()}
          {...balances}
          refetchBalances={refetch}
        />
      ))}

      <Divider usersAddress={usersAddress} />
      <BalanceDelegatedToItem usersAddress={usersAddress} />
      <TwabDelegatorItem delegator={usersAddress} />
    </PrizePoolDepositList>
  )
}

export interface DepositItemsProps {
  balances: UsersPrizePoolBalances
  prizePool: PrizePool
  refetchBalances: () => void
}

const DepositItem = (props: DepositItemsProps) => {
  const { prizePool, balances, refetchBalances } = props

  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedChainId } = useSelectedChainId()
  const { t } = useTranslation()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)
  const usersAddress = useUsersAddress()
  const { data: delegateData } = useUsersTicketDelegate(usersAddress, prizePool)
  const delegate = getDelegateAddress(usersAddress, delegateData)

  const chainId = prizePool.chainId
  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: prizePool.address
    },
    {
      i18nKey: 'token',
      chainId,
      address: balances.ticket.address
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: balances.token.address
    }
  ]
  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)
  const onDismiss = () => setIsOpen(false)

  return (
    <>
      <PrizePoolDepositListItem
        onClick={() => {
          setSelectedChainId(chainId)
          setIsOpen(true)
        }}
        left={<NetworkLabel chainId={chainId} />}
        right={<DepositBalance {...props} />}
        bottom={<DelegateTicketsSection prizePool={prizePool} balance={balances?.ticket} />}
      />
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
        tx={tx}
        token={balances.ticket}
        balance={balances.ticket}
        balanceUsd={balances.ticket}
        t={t}
        contractLinks={contractLinks}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        isWalletMetaMask={isWalletMetaMask}
      />
    </>
  )
}

const NetworkLabel = (props: { chainId: number }) => (
  <div className='flex'>
    <NetworkIcon chainId={props.chainId} className='mr-2 my-auto' />
    <span className='font-bold xs:text-lg'>{getNetworkNiceNameByChainId(props.chainId)}</span>
  </div>
)

const DepositBalance = (props: DepositItemsProps) => {
  const { balances, prizePool } = props
  const { ticket } = balances
  return <PrizePoolDepositBalance chainId={prizePool.chainId} token={ticket} />
}

/**
 * Returns the delegate address if it has been set manually.
 * @param usersAddress
 * @param delegateData
 * @returns
 */
const getDelegateAddress = (
  usersAddress: string,
  delegateData: { [usersAddress: string]: string }
): string => {
  const delegateAddress = delegateData?.[usersAddress]
  if (
    !delegateAddress ||
    getAddress(usersAddress) === delegateAddress ||
    ethers.constants.AddressZero === delegateAddress
  ) {
    return null
  } else {
    return delegateAddress
  }
}

const Divider: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data: delegatedToData, isFetched: isAmountDelegatedToFetched } =
    useTotalAmountDelegatedTo(usersAddress)
  const { data: delegationData, isFetched: isDelegationsFetched } = useAllDelegations(usersAddress)

  if (
    (isDelegationsFetched && !delegationData.totalTokenWithUsdBalance.amountUnformatted.isZero()) ||
    (isAmountDelegatedToFetched && !delegatedToData.delegatedAmount.amountUnformatted.isZero())
  ) {
    return (
      <li>
        <hr />
      </li>
    )
  }

  return null
}
