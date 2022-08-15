import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useRouter } from 'next/router'
import { useTransaction, useUsersAddress } from '@pooltogether/wallet-connection'
import { UsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { useAllUsersV4BalancesWithFiat } from '@hooks/v4/PrizePool/useAllUsersV4BalancesWithFiat'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { DelegateTicketsSection } from './DelegateTicketsSection'
import { CardTitle } from '@components/Text/CardTitle'
import { useIsWalletMetamask } from '@hooks/useIsWalletMetamask'
import { useIsWalletOnChainId } from '@pooltogether/wallet-connection'
import { LoadingList } from '@views/Account/AccountList/LoadingList'
import { AccountList } from '@views/Account/AccountList'
import { AccountListItem } from '@views/Account/AccountList/AccountListItem'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { getAddress } from 'ethers/lib/utils'
import { ethers } from 'ethers'
import { PrizePoolLabel } from '@components/PrizePoolLabel'
import { ContractLink } from '@components/BalanceBottomSheet'
import { AccountListItemTokenBalance } from '@views/Account/AccountList/AccountListItemTokenBalance'
import { AccentTextButton } from '../AccentTextButton'
import { BalanceModal } from './BalanceModal'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { ExplorePrizePoolsModal } from './ExplorePrizePoolsModal'

export const V4DepositList = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data } = useAllUsersV4BalancesWithFiat(usersAddress)

  return (
    <div id='deposits'>
      <CardTitle
        className='mb-2'
        title={'Savings'}
        secondary={`$${data?.totalValueUsd.amountPretty}`}
      />
      <DepositsList />
      <ExplorePrizePools />
    </div>
  )
}

const DepositsList: React.FC = () => {
  const usersAddress = useUsersAddress()
  const [isOpen, setIsOpen] = useState(false)
  const { data, isFetched, refetch } = useAllUsersV4BalancesWithFiat(usersAddress)
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { setSelectedChainId } = useSelectedChainId()

  if (data.balances.length === 0) {
    return <LoadingList />
  }

  return (
    <>
      <BalanceModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
      <AccountList>
        {data.balances.map((balances) => (
          <DepositItem
            key={'deposit-balance-' + balances.prizePool.id()}
            {...balances}
            refetchBalances={refetch}
            onClick={() => {
              setSelectedPrizePoolAddress(balances.prizePool.address)
              setSelectedChainId(balances.prizePool.chainId)
              setIsOpen(true)
            }}
          />
        ))}
      </AccountList>
    </>
  )
}

export interface DepositItemsProps {
  balances: UsersPrizePoolBalances
  prizePool: PrizePool
  refetchBalances: () => void
  onClick: () => void
}

const DepositItem = (props: DepositItemsProps) => {
  const { prizePool, balances, onClick, refetchBalances } = props

  const router = useRouter()
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
  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

  return (
    <>
      <AccountListItem
        onClick={onClick}
        left={<PrizePoolLabel prizePool={prizePool} />}
        right={<AccountListItemTokenBalance chainId={prizePool.chainId} token={balances?.ticket} />}
        bottom={<DelegateTicketsSection prizePool={prizePool} balance={balances?.ticket} />}
      />
    </>
  )
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

const ExplorePrizePools = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AccentTextButton className='ml-4 mt-8' onClick={() => setIsOpen(true)}>
        Explore Prize Pools
      </AccentTextButton>
      <ExplorePrizePoolsModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}
