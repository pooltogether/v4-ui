import { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import {
  LoadingDots,
  NetworkIcon,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { Token, TokenBalance, useOnboard } from '@pooltogether/hooks'
import React from 'react'
import Link from 'next/link'

import { WithdrawModal } from 'lib/views/Account/WithdrawModal'
import PiggyBank from 'assets/images/piggy-bank.svg'
import { getNetworkNiceNameByChainId, numberWithCommas } from '@pooltogether/utilities'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { Player, PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { useLinkedPrizePool } from 'lib/hooks/Tsunami/LinkedPrizePool/useLinkedPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { usePrizePoolTokenValue } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokenValue'

export const AccountUI = (props) => {
  const { isWalletConnected } = useOnboard()

  const { data: player, isFetched: isPlayerFetched } = useSelectedNetworkPlayer()

  if (!isWalletConnected) {
    return <NoWalletAccountCard />
  }

  return <AccountCard player={player} isPlayerFetched={isPlayerFetched} />
}

interface AccountCardProps {
  player: Player
  isPlayerFetched: boolean
}

const AccountCard = (props: AccountCardProps) => {
  const { player, isPlayerFetched } = props
  const { t } = useTranslation()

  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()

  const isFetched = isPlayerFetched && isLinkedPrizePoolFetched

  return (
    <Card>
      <Piggy />
      <span className='text-xxs font-semibold text-accent-1 font-inter mt-2 mb-4'>
        {t('myBalance')}
      </span>
      <PrizePoolList
        className='mt-4'
        player={player}
        isFetched={isFetched}
        prizePools={linkedPrizePool?.prizePools}
      />
    </Card>
  )
}

interface PrizePoolListProps {
  className?: string
  prizePools: PrizePool[]
  player: Player
  isFetched: boolean
}

const PrizePoolList = (props: PrizePoolListProps) => {
  const { player, prizePools, isFetched, className } = props

  if (!isFetched) {
    return (
      <div className={className}>
        <LoadingDots />
      </div>
    )
  }

  return (
    <ul className={classNames(className, 'w-full')}>
      {prizePools.map((prizePool) => (
        <PrizePoolRow key={prizePool.id()} player={player} prizePool={prizePool} />
      ))}
    </ul>
  )
}

interface PrizePoolRowProps {
  prizePool: PrizePool
  player: Player
}

const PrizePoolRow = (props: PrizePoolRowProps) => {
  const { prizePool, player } = props
  const { data: usersBalances, isFetched: isUsersBalancesFetched } =
    useUsersPrizePoolBalances(prizePool)
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  const isFetched = isUsersBalancesFetched && isPrizePoolTokensFetched

  return (
    <li className='w-full flex flex-col pb-4 mb-4 last:pb-0 last:mb-0 border-primary border-b last:border-transparent'>
      <div className='w-full flex flex-row justify-between'>
        <div>
          <div className='flex flex-row'>
            <NetworkIcon className='my-auto' chainId={prizePool.chainId} />
            <span className='ml-2 text-lg'>{`${getNetworkNiceNameByChainId(
              prizePool.chainId
            )} Prize Pool`}</span>
          </div>
        </div>
        <Balance
          prizePool={prizePool}
          isFetched={isFetched}
          balance={usersBalances?.ticket}
          ticket={prizePoolTokens?.ticket}
          token={prizePoolTokens?.token}
        />
      </div>
      <ManageDepositButtons player={player} prizePool={prizePool} />
    </li>
  )
}

interface ManageDepositButtonsProps extends PrizePoolRowProps {}

const ManageDepositButtons = (props: ManageDepositButtonsProps) => {
  const { player, prizePool } = props

  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <WithdrawModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        player={player}
        prizePool={prizePool}
      />
      <div className='flex'>
        <SquareButton
          className='w-full mr-2'
          size={SquareButtonSize.sm}
          theme={SquareButtonTheme.purple}
          onClick={() => setIsModalOpen(true)}
        >
          {t('withdraw')}
        </SquareButton>
        <Link href={`/?tab=deposit&network=${prizePool.chainId}`}>
          <a className='w-full ml-2'>
            <SquareButton
              className='w-full'
              size={SquareButtonSize.sm}
              theme={SquareButtonTheme.teal}
            >
              {t('deposit')}
            </SquareButton>
          </a>
        </Link>
      </div>
    </>
  )
}

const NoWalletAccountCard = () => {
  const { t } = useTranslation()

  return (
    <Card>
      <Piggy />
      <span className='text-xxs font-semibold text-accent-1 font-inter mt-2 mb-4'>
        Connect a wallet to view your balances and manage deposits
      </span>
      <ConnectWalletButton />
    </Card>
  )
}

interface BalanceProps {
  className?: string
  isFetched: boolean
  balance: TokenBalance
  ticket: Token
  token: Token
  prizePool: PrizePool
}

const Balance = (props: BalanceProps) => {
  const { isFetched, balance, ticket } = props
  const { isWalletConnected } = useOnboard()

  if (!isFetched) {
    return (
      <BalanceContainer>
        <ThemedClipSpinner className='my-1' />
      </BalanceContainer>
    )
  } else if (!isWalletConnected) {
    return (
      <BalanceContainer>
        <span className='text-lg font-bold'>--</span>
      </BalanceContainer>
    )
  }

  return (
    <BalanceContainer>
      <span className='ml-auto text-lg font-bold'>
        {balance.amountPretty} {ticket.symbol}
      </span>
      <BalanceUsdValue className='ml-auto' {...props} />
    </BalanceContainer>
  )
}

const BalanceContainer = (props) => <div {...props} className='flex flex-col mb-4' />

const BalanceUsdValue = (props: BalanceProps) => {
  const { balance, token, prizePool } = props
  const { data: tokenPrice, isFetched: tokenPrizeIsFetched } = usePrizePoolTokenValue(prizePool)

  if (!balance) {
    return <span className={classNames(props.className, 'font-light')}>$--</span>
  } else if (!tokenPrizeIsFetched) {
    return <span className={classNames(props.className, 'font-light')}>$--</span>
  }

  const usdValuePretty = numberWithCommas(balance.amountUnformatted.mul(tokenPrice.usd), {
    decimals: token.decimals
  })

  return <span className={classNames(props.className, 'font-light')}>${usdValuePretty}</span>
}

const Piggy = () => (
  <img src={PiggyBank} alt='piggy bank icon' height={92} width={92} className='mx-auto mb-6' />
)
const Card = (props) => (
  <div
    {...props}
    className={classNames(
      'bg-card shadow trans rounded-lg w-full py-10 px-4 sm:p-10 flex flex-col mb-4 items-center',
      props.className
    )}
  />
)

const ConnectWalletButton = () => {
  const { connectWallet } = useOnboard()
  const { t } = useTranslation()
  return (
    <SquareButton className='w-full' onClick={() => connectWallet(null)}>
      {t('connectWallet')}
    </SquareButton>
  )
}