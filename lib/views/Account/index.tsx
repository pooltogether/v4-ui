import React from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
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
import { Amount, Token, TokenBalance, useTransaction } from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

import { BackToV3Banner } from 'lib/components/BackToV3Banner'
import { InfoBoxContainer } from 'lib/components/InfoBoxContainer'
import { TxHashRow } from 'lib/components/TxHashRow'
import { WithdrawModal } from 'lib/views/Account/WithdrawModal'
import { getNetworkNiceNameByChainId, numberWithCommas } from '@pooltogether/utilities'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { Player, PrizePool } from '@pooltogether/v4-js-client'
import { useLinkedPrizePool } from 'lib/hooks/Tsunami/LinkedPrizePool/useLinkedPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { usePrizePoolTokenValue } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokenValue'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { ConnectWalletCard } from 'lib/components/ConnectWalletCard'
import { DelegateTicketsSection } from './DelegateTicketsSection'

import PiggyBank from 'assets/images/piggy-bank.svg'
import { useRouter } from 'next/router'

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
      <AccountDeposits player={player} isPlayerFetched={isPlayerFetched} />
      <div className='mt-4'>
        <BackToV3Banner />
      </div>
    </PagePadding>
  )
}

interface AccountDepositsProps {
  player: Player
  isPlayerFetched: boolean
}

const AccountDeposits = (props: AccountDepositsProps) => {
  const { player, isPlayerFetched } = props

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

  const { t } = useTranslation()

  const isFetched = isUsersBalancesFetched && isPrizePoolTokensFetched

  return (
    <li className='w-full flex flex-col mb-4 last:mb-0'>
      <Card>
        <div className='w-full flex flex-row justify-between'>
          <div>
            <div className='flex flex-row'>
              <NetworkIcon className='my-auto' chainId={prizePool.chainId} />
              <span className='ml-2 xs:text-lg'>
                {t('depositsOnNetwork', 'Deposits on {{ network }}', {
                  network: getNetworkNiceNameByChainId(prizePool.chainId)
                })}
              </span>
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
        <ManageBalanceButtons player={player} prizePool={prizePool} />
        <DelegateTicketsSection
          prizePool={prizePool}
          className='mt-4'
          balance={usersBalances?.ticket}
        />
      </Card>
    </li>
  )
}

interface ManageBalanceButtonsProps extends PrizePoolRowProps {}

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

const ManageBalanceButtons = (props: ManageBalanceButtonsProps) => {
  const { player, prizePool } = props

  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()

  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()
  const [, setSelectedNetwork] = useSelectedNetwork()

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const sendTx = useSendTransaction()

  const router = useRouter()

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { reset } = form

  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  const { token } = prizePoolTokens

  const {
    data: usersBalances,
    isFetched: isUsersBalancesFetched,
    refetch: refetchUsersBalances
  } = useUsersPrizePoolBalances(prizePool)

  const sendWithdrawTx = async (e) => {
    e.preventDefault()

    const tokenSymbol = token.symbol

    const txId = await sendTx({
      name: `${t('withdraw')} ${amountToWithdraw?.amountPretty} ${tokenSymbol}`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => player.withdraw(amountToWithdraw?.amountUnformatted),
      callbacks: {
        onSent: () => setCurrentStep(WithdrawalSteps.viewTxReceipt),
        refetch: () => {
          refetchUsersBalances()
        }
      }
    })
    setWithdrawTxId(txId)
  }

  const resetState = () => {
    reset()
    setWithdrawTxId(0)
    setAmountToWithdraw(undefined)
    setCurrentStep(WithdrawalSteps.input)
  }

  const handleWithdrawClick = (e) => {
    if (withdrawTx) {
      resetState()
    } else {
      setSelectedNetwork(prizePool.chainId)
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <WithdrawModal
        isOpen={isModalOpen}
        player={player}
        prizePool={prizePool}
        withdrawTx={withdrawTx}
        currentStep={currentStep}
        prizePoolTokens={prizePoolTokens}
        isPrizePoolTokensFetched={isPrizePoolTokensFetched}
        usersBalances={usersBalances}
        isUsersBalancesFetched={isUsersBalancesFetched}
        amountToWithdraw={amountToWithdraw}
        form={form}
        closeModal={() => setIsModalOpen(false)}
        sendWithdrawTx={sendWithdrawTx}
        setWithdrawTxId={setWithdrawTxId}
        setCurrentStep={setCurrentStep}
        refetchUsersBalances={refetchUsersBalances}
        setAmountToWithdraw={setAmountToWithdraw}
      />

      {withdrawTx && (
        <InfoBoxContainer className='mb-2'>
          <TxHashRow depositTx={withdrawTx} chainId={prizePool.chainId} />
        </InfoBoxContainer>
      )}

      <div className='flex'>
        <SquareButton
          className='w-full mr-2'
          size={SquareButtonSize.sm}
          theme={SquareButtonTheme.purple}
          onClick={handleWithdrawClick}
        >
          {withdrawTx ? t('withdrawAgain', 'Withdraw again') : t('withdraw')}
        </SquareButton>

        <SquareLink
          Link={Link}
          href={{
            pathname: '/deposit',
            query: {
              ...router.query,
              network: prizePool.chainId
            }
          }}
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
        <ThemedClipSpinner className='ml-auto my-1' />
        <BalanceUsdValue className='ml-auto text-accent-1 font-light text-xs' {...props} />
      </BalanceContainer>
    )
  } else if (!isWalletConnected) {
    return (
      <BalanceContainer>
        <span className='ml-auto sm:text-lg font-bold'>--</span>
        <BalanceUsdValue className='ml-auto text-accent-1 font-light text-xs' {...props} />
      </BalanceContainer>
    )
  }

  return (
    <BalanceContainer>
      <span className='ml-auto sm:text-lg font-bold'>
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
