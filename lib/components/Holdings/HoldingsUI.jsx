import { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { SquareButton, SquareButtonTheme, ThemedClipSpinner } from '@pooltogether/react-components'
import { useOnboard } from '@pooltogether/hooks'
import React from 'react'
import Link from 'next/link'

import { useUsersTokenHoldings } from 'lib/hooks/useUsersTokenHoldings'
import { usePrizePool } from 'lib/hooks/usePrizePool'
import { WithdrawModal } from 'lib/components/Holdings/WithdrawModal'
import PiggyBank from 'assets/images/piggy-bank.svg'

export const HoldingsUI = (props) => {
  const { isWalletConnected } = useOnboard()

  if (!isWalletConnected) {
    return (
      <>
        <HoldingsCard />
        <ConnectWalletButton />
      </>
    )
  }

  return (
    <>
      <HoldingsCard />
      <ManageDepositButtons />
    </>
  )
}

const HoldingsCard = (props) => {
  const { data: usersTokens, isFetched } = useUsersTokenHoldings()
  const prizePool = usePrizePool()

  const balance = usersTokens?.[prizePool.tokens.ticket.address].amountPretty
  const symbol = usersTokens?.[prizePool.tokens.ticket.address].symbol

  return (
    <Card>
      <Piggy />
      <span className='text-xxs font-semibold text-accent-1'>My balance</span>
      <Balance balance={balance} symbol={symbol} isFetched={isFetched} />
      <span className='text-xxs text-accent-1'>Value: $1,000</span>
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

  return (
    <>
      <WithdrawModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
      <div className='flex'>
        <SquareButton
          className='w-full mr-2'
          theme={SquareButtonTheme.purple}
          onClick={() => setIsModalOpen(true)}
        >
          Withdraw
        </SquareButton>
        <Link href='/?tab=deposit'>
          <a className='w-full ml-2'>
            <SquareButton className='w-full' theme={SquareButtonTheme.teal}>
              Increase my odds
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
