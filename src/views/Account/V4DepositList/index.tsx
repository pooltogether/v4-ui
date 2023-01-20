import { formatCurrencyValue } from '@components/CurrencyValue'
import { ListItem } from '@components/List/ListItem'
import { PrizePoolLabel } from '@components/PrizePool/PrizePoolLabel'
import { CardTitle } from '@components/Text/CardTitle'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'
import { TokenWithUsdBalance, useCoingeckoExchangeRates } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { AccountList } from '@views/Account/AccountList'
import { AccountListItemTokenBalance } from '@views/Account/AccountList/AccountListItemTokenBalance'
import { LoadingList } from '@views/Account/AccountList/LoadingList'
import { DepositModal } from '@views/Deposit/DepositTrigger/DepositModal'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { AccentTextButton } from '../AccentTextButton'
import { BalanceModal } from './BalanceModal'
import { DelegateTicketsSection } from './DelegateTicketsSection'

export const V4DepositList = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data } = useAllUsersV4Balances(usersAddress)
  const { data: exchangeRates } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()

  return (
    <div id='deposits'>
      <CardTitle
        className='mb-2'
        title={t('savings')}
        secondary={formatCurrencyValue(data?.totalValueUsd.amount, currency, exchangeRates)}
      />
      <DepositsList />
      <ExplorePrizePools />
    </div>
  )
}

const DepositsList: React.FC = () => {
  const usersAddress = useUsersAddress()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
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
          <ListItem
            key={'deposit-balance-' + prizePool.id()}
            onClick={async () => {
              setSelectedPrizePoolAddress(prizePool)
              await setIsOpen(true)
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
  balances: {
    ticket: TokenWithUsdBalance
    token: TokenWithUsdBalance
  }
  prizePool: PrizePool
  refetchBalances: () => void
  onClick?: () => void
}

const ExplorePrizePools = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  return (
    <>
      <AccentTextButton className='mt-8' onClick={() => setIsOpen(true)}>
        {t('explorePrizePools')}
      </AccentTextButton>
      <DepositModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}
