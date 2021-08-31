import { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { SquareButton, SquareButtonTheme, ThemedClipSpinner } from '@pooltogether/react-components'
import { useOnboard } from '@pooltogether/hooks'
import React from 'react'
import Link from 'next/link'

import { useUsersTokenHoldings } from 'lib/hooks/useUsersTokenHoldings'
import { usePrizePool } from 'lib/hooks/usePrizePool'
import { WithdrawModal } from 'lib/components/Account/WithdrawModal'
import PiggyBank from 'assets/images/piggy-bank.svg'
import { usePrizePoolTokensWithUsd } from 'lib/hooks/usePrizePoolTokensWithUsd'
import { getUsdAmount } from 'lib/components/Prizes/PrizesUI'
import { numberWithCommas } from '@pooltogether/utilities'

export const AccountUI = (props) => {
  const { isWalletConnected } = useOnboard()

  if (!isWalletConnected) {
    return (
      <>
        <AccountCard />
        <ConnectWalletButton />
      </>
    )
  }

  return (
    <>
      <AccountCard />
      <ManageDepositButtons />
    </>
  )
}

// TODO: Balances across chains?
const AccountCard = (props) => {
  const { data: usersTokens, isFetched: isTokenHoldingsFetched } = useUsersTokenHoldings()
  const { data: tokensWithUsd, isFetched: isTokensWithUsdFetched } = usePrizePoolTokensWithUsd()
  const prizePool = usePrizePool()
  const { t } = useTranslation()

  let balance,
    symbol,
    usd = '--'
  if (isTokensWithUsdFetched && isTokenHoldingsFetched) {
    const ticketToken = usersTokens[prizePool.tokens.ticket.address]
    const usdAmount = getUsdAmount(ticketToken.amountUnformatted, tokensWithUsd.ticket)
    usd = `$${numberWithCommas(usdAmount)}`
    balance = ticketToken.amountPretty
    symbol = ticketToken.symbol
  }

  return (
    <Card>
      <Piggy />
      <span className='text-xxs font-semibold text-accent-1 font-inter mt-2 mb-4'>
        {t('myBalance')}
      </span>
      <Balance balance={balance} symbol={symbol} isFetched={isTokenHoldingsFetched} />
      <span className='text-xxs text-accent-1 font-inter'>
        {t('value')}: {usd}
      </span>
    </Card>
  )
}

const Balance = (props) => {
  const { isFetched, balance, symbol } = props
  const { isWalletConnected } = useOnboard()

  if (!isFetched) {
    return <ThemedClipSpinner className='my-1' />
  } else if (!isWalletConnected) {
    return <span className='text-lg font-bold'>-- {symbol}</span>
  }
  return (
    <span className='text-lg font-bold'>
      {balance} {symbol}
    </span>
  )
}

const ManageDepositButtons = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <WithdrawModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
      <div className='flex'>
        <SquareButton
          className='w-full mr-2'
          theme={SquareButtonTheme.purple}
          onClick={() => setIsModalOpen(true)}
        >
          {t('withdraw')}
        </SquareButton>
        <Link href='/?tab=deposit'>
          <a className='w-full ml-2'>
            <SquareButton className='w-full' theme={SquareButtonTheme.teal}>
              {t('deposit')}
            </SquareButton>
          </a>
        </Link>
      </div>
    </>
  )
}

const Piggy = () => (
  <img src={PiggyBank} alt='piggy bank icon' height={92} width={92} className='mx-auto mb-6' />
)
const Card = (props) => (
  <div
    {...props}
    className={classNames(
      'bg-card hover:bg-secondary trans rounded-lg w-full p-10 flex flex-col mb-4 items-center',
      props.className
    )}
  />
)

const ConnectWalletButton = () => {
  const { connectWallet } = useOnboard()
  const { t } = useTranslation()
  return (
    <SquareButton className='w-full' onClick={() => connectWallet()}>
      {t('connectWallet')}
    </SquareButton>
  )
}
