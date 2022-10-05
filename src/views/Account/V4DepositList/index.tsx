import { PrizePoolLabel } from '@components/PrizePoolLabel'
import { CardTitle } from '@components/Text/CardTitle'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'
import { UsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { AccountList } from '@views/Account/AccountList'
import { AccountListItem } from '@views/Account/AccountList/AccountListItem'
import { AccountListItemTokenBalance } from '@views/Account/AccountList/AccountListItemTokenBalance'
import { LoadingList } from '@views/Account/AccountList/LoadingList'
import { DepositModal } from '@views/Deposit/DepositTrigger/DepositModal'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { AccentTextButton } from '../AccentTextButton'
import { BalanceModal } from './BalanceModal'
import { DelegateTicketsSection } from './DelegateTicketsSection'

export const V4DepositList = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data } = useAllUsersV4Balances(usersAddress)

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
  const { data } = useAllUsersV4Balances(usersAddress)
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  if (data.balances.length === 0) {
    return <LoadingList />
  }

  return (
    <>
      <BalanceModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
      <AccountList>
        {data.balances.map(({ prizePool, balances }) => (
          <AccountListItem
            key={'deposit-balance-' + prizePool.id()}
            onClick={() => {
              setSelectedPrizePoolAddress(prizePool)
              setIsOpen(true)
            }}
            left={<PrizePoolLabel prizePool={prizePool} />}
            right={
              <AccountListItemTokenBalance chainId={prizePool.chainId} token={balances?.ticket} />
            }
            bottom={<DelegateTicketsSection prizePool={prizePool} balance={balances?.ticket} />}
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
  onClick?: () => void
}

const ExplorePrizePools = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AccentTextButton className='ml-4 mt-8' onClick={() => setIsOpen(true)}>
        Explore Prize Pools
      </AccentTextButton>
      <DepositModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}
