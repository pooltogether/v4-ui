import React, { useEffect } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  LoadingDots,
  NetworkIcon,
  SquareLink,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { Token, TokenBalance } from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

import { BackToV3Banner } from 'lib/components/BackToV3Banner'
import { WithdrawModal } from 'lib/views/Account/WithdrawModal'
import { getNetworkNiceNameByChainId, numberWithCommas } from '@pooltogether/utilities'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { Player, PrizePool } from '@pooltogether/v4-js-client'
import { useLinkedPrizePool } from 'lib/hooks/Tsunami/LinkedPrizePool/useLinkedPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { usePrizePoolTokenValue } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokenValue'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'

import PiggyBank from 'assets/images/piggy-bank.svg'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { ConnectWalletCard } from 'lib/components/ConnectWalletCard'

export const AccountUI = (props) => {
  const { isWalletConnected } = useOnboard()

  const { data: player, isFetched: isPlayerFetched } = useSelectedNetworkPlayer()

  if (!isWalletConnected) {
    return (
      <PagePadding>
        <Piggy className='mb-8 mx-auto' />
        <ConnectWalletCard />
        <div className='mt-4'>
          <BackToV3Banner />
        </div>
      </PagePadding>
    )
  }

  return (
    <PagePadding>
      <AccountCard player={player} isPlayerFetched={isPlayerFetched} />
      <div className='mt-4'>
        <BackToV3Banner />
      </div>
    </PagePadding>
  )
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
    <>
      <Piggy className='mb-8 mx-auto' />
      <PrizePoolList
        player={player}
        isFetched={isFetched}
        prizePools={linkedPrizePool?.prizePools}
      />
    </>
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
      <div className={classNames(className, 'w-full flex h-60')}>
        <LoadingDots className='m-auto' />
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
    <li className='w-full flex flex-col mb-4 last:mb-0'>
      <Card>
        <div className='w-full flex flex-row justify-between'>
          <div>
            <div className='flex flex-row'>
              <NetworkIcon className='my-auto' chainId={prizePool.chainId} />
              <span className='ml-2 text-base xs:text-lg'>{`${getNetworkNiceNameByChainId(
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
      </Card>
    </li>
  )
}

interface ManageDepositButtonsProps extends PrizePoolRowProps {}

const ManageDepositButtons = (props: ManageDepositButtonsProps) => {
  const { player, prizePool } = props

  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()
  const [, setSelectedNetwork] = useSelectedNetwork()

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
          onClick={() => {
            setSelectedNetwork(prizePool.chainId)
            setIsModalOpen(true)
          }}
        >
          {t('withdraw')}
        </SquareButton>

        <SquareLink
          Link={Link}
          href={`/deposit?network=${prizePool.chainId}`}
          className='w-full text-center ml-2'
          size={SquareButtonSize.sm}
          theme={SquareButtonTheme.teal}
        >
          {t('deposit')}
        </SquareLink>
      </div>
    </>
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
        <BalanceUsdValue className='ml-auto' {...props} />
      </BalanceContainer>
    )
  } else if (!isWalletConnected) {
    return (
      <BalanceContainer>
        <span className='text-base sm:text-lg font-bold'>--</span>
        <BalanceUsdValue className='ml-auto' {...props} />
      </BalanceContainer>
    )
  }

  return (
    <BalanceContainer>
      <span className='ml-auto text-lg font-bold'>
        {balance.amountPretty} {ticket.symbol}
      </span>
      <BalanceUsdValue className='ml-auto text-accent-1 font-light text-xs' {...props} />
    </BalanceContainer>
  )
}

const BalanceContainer = (props) => <div {...props} className='flex flex-col mb-4' />

const BalanceUsdValue = (props: BalanceProps) => {
  const { balance, token, prizePool } = props
  const { data: tokenPrice, isFetched: isTokenValueFetched } = usePrizePoolTokenValue(prizePool)

  if (!balance) {
    return <span className={classNames(props.className)}>($--)</span>
  } else if (!isTokenValueFetched) {
    return <span className={classNames(props.className)}>($--)</span>
  }

  const usdValuePretty = numberWithCommas(balance.amountUnformatted.mul(tokenPrice.usd), {
    decimals: token.decimals
  })

  return <span className={classNames(props.className)}>(${usdValuePretty})</span>
}

const Piggy = (props) => (
  <img src={PiggyBank} alt='piggy bank icon' height={92} width={92} className={props.className} />
)
