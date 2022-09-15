import { BalanceBottomSheet, ContractLink } from '@components/BalanceBottomSheet'
import { PrizePoolDepositList } from '@components/PrizePoolDepositList'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { PrizePoolDepositBalance } from '@components/PrizePoolDepositList/PrizePoolDepositBalance'
import { PrizePoolDepositListItem } from '@components/PrizePoolDepositList/PrizePoolDepositListItem'
import { CardTitle } from '@components/Text/CardTitle'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { UsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useAllTwabDelegations } from '@hooks/v4/TwabDelegator/useAllTwabDelegations'
import {
  NetworkIcon,
  SquareButtonSize,
  SquareButtonTheme,
  SquareLink
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTransaction, useUsersAddress } from '@pooltogether/wallet-connection'
import { useIsWalletOnChainId } from '@pooltogether/wallet-connection'
import { buildApproveTx } from '@utils/transactions/buildApproveTx'
import { BigNumber, ethers } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useSigner } from 'wagmi'

import { BalanceDelegatedToItem } from './BalanceDelegatedToItem'
import { DelegateTicketsSection } from './DelegateTicketsSection'
import { DelegateView } from './DelegateView'
import { TwabDelegatorItem } from './TwabDelegatorItem'
import { WithdrawView } from './WithdrawView'

export const V4Deposits = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data } = useAllUsersV4Balances(usersAddress)

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
  const { data, isFetched, refetch } = useAllUsersV4Balances(usersAddress)
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
  const [txId, setTxId] = useState('')
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
  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)
  const onDismiss = () => setIsOpen(false)

  const { refetch: getSigner } = useSigner()
  const sendTx = useSendTransaction()

  const sendRevokeAllowanceTransaction = async () => {
    const { data: signer } = await getSigner()
    const callTransaction = buildApproveTx(
      signer,
      BigNumber.from(0),
      prizePool.address,
      balances.token
    )
    const name = t('revokePoolAllowance', { ticker: balances.token.symbol })

    const txId = await sendTx({
      name,
      callTransaction
    })

    return txId
  }

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
        sendRevokeAllowanceTransaction={sendRevokeAllowanceTransaction}
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
        ticket={balances.ticket}
        token={balances.token}
        balance={balances.ticket}
        balanceUsd={balances.ticket}
        contractLinks={contractLinks}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
      />
    </>
  )
}

const NetworkLabel = (props: { chainId: number }) => (
  <div className='flex'>
    <NetworkIcon chainId={props.chainId} className='mr-2 my-auto' />
    <span className='font-bold'>{getNetworkNiceNameByChainId(props.chainId)}</span>
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
  delegateData: { ticketDelegate: string; usersAddress: string }
): string => {
  const delegateAddress = delegateData?.ticketDelegate
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
  const { data: delegationData, isFetched: isDelegationsFetched } =
    useAllTwabDelegations(usersAddress)

  if (
    (isDelegationsFetched &&
      !delegationData?.totalTokenWithUsdBalance.amountUnformatted.isZero()) ||
    (isAmountDelegatedToFetched && !delegatedToData?.delegatedAmount.amountUnformatted.isZero())
  ) {
    return (
      <li>
        <hr className='m-3' />
      </li>
    )
  }

  return null
}
