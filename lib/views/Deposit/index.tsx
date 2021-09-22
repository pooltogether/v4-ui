import { useIsWalletOnNetwork, useOnboard } from '.yalc/@pooltogether/hooks/dist'
import { LoadingDots } from '.yalc/@pooltogether/react-components/dist'
import { numberWithCommas, safeParseUnits } from '@pooltogether/utilities'
import classnames from 'classnames'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { useUsersDepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { ContentPanesProps, QuantityDetails } from 'lib/views/DefaultPage'
import { Deposit } from 'lib/views/Deposit/Deposit'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import PrizeWLaurels from 'assets/images/prize-w-laurels@2x.png'

export const DepositUI = (props: ContentPanesProps) => {
  return (
    <>
      <UpcomingPrizeDetails />
      <DepositPane {...props} />
      <PrizeBreakdown />
    </>
  )
}

const UpcomingPrizeDetails = (props) => {
  const { t } = useTranslation()

  if (false) {
    return (
      <div className='bg-card hover:bg-secondary trans rounded-lg w-full p-10 flex flex-col mb-4 items-center'>
        <LoadingDots className='mx-auto my-20' />
      </div>
    )
  }

  return (
    <div className='bg-card hover:bg-secondary trans rounded-lg w-full p-10 flex flex-col mb-4 items-center'>
      <div className='font-inter uppercase text-accent-1'>{t('weeklyPrize')}</div>
      <div className='font-bold text-5xl xs:text-9xl'>$100,000.23</div>
      {/* <div className='font-inter text-accent-1 my-4'>{t('awardIn')}</div> */}
      {/* <PrizeCountdown
        textSize='text-xl'
        t={t}
        prizePeriodSeconds={data.prizePeriodSeconds}
        prizePeriodStartedAt={data.prizePeriodStartedAt}
        isRngRequested={data.isRngRequested}
        canStartAward={data.canStartAward}
        canCompleteAward={data.canCompleteAward}
      /> */}
    </div>
  )
}

const DepositPane = (props: ContentPanesProps) => {
  const { t } = useTranslation()

  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  const { data: player, isFetched: isPlayerFetched } = useSelectedNetworkPlayer()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const {
    data: usersBalances,
    refetch: refetchUsersBalances,
    isFetched: isUsersBalancesFetched
  } = useUsersPrizePoolBalances(prizePool)
  const {
    data: usersDepositAllowance,
    refetch: refetchUsersDepositAllowance,
    isFetched: isUsersDepositAllowanceFetched
  } = useUsersDepositAllowance(prizePool)

  const { isWalletConnected } = useOnboard()
  const walletOnCorrectNetwork = useIsWalletOnNetwork(prizePool?.chainId)

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const refetchOnApprove = () => refetchUsersDepositAllowance()
  const refetchOnDeposit = () => refetchUsersBalances()
  const hideWrongNetworkOverlay =
    !isWalletConnected || (isWalletConnected && walletOnCorrectNetwork)

  const quantity = form.watch('quantity') || ''
  const quantityDetails: QuantityDetails = {
    quantity,
    quantityUnformatted: safeParseUnits(quantity || '0', prizePoolTokens?.token.decimals),
    quantityPretty: numberWithCommas(quantity) as string
  }

  return (
    <>
      <div className='relative bg-card rounded-lg w-full flex flex-col items-center mb-4 px-4 sm:px-8 py-10 xs:p-10'>
        <Deposit
          {...props}
          player={player}
          prizePool={prizePool}
          form={form}
          isPrizePoolFetched={isPrizePoolFetched}
          isPrizePoolTokensFetched={isPrizePoolTokensFetched}
          isPlayerFetched={isPlayerFetched}
          isUsersBalancesFetched={isUsersBalancesFetched}
          isUsersDepositAllowanceFetched={isUsersDepositAllowanceFetched}
          tokenBalance={usersBalances?.token}
          ticketBalance={usersBalances?.ticket}
          token={prizePoolTokens?.token}
          ticket={prizePoolTokens?.ticket}
          depositAllowance={usersDepositAllowance}
          quantityDetails={quantityDetails}
          refetchOnApprove={refetchOnApprove}
          refetchOnDeposit={refetchOnDeposit}
        />
      </div>
    </>
  )
}

const PrizeBreakdown = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='bg-card rounded-lg w-full flex flex-col items-center mb-4 px-8 xs:px-20 p-10'>
        <img
          src={PrizeWLaurels}
          alt='trophy icon w/ laurels'
          height={60}
          width={88}
          className='mx-auto'
        />
        <div className='font-inter font-semibold text-sm capitalize text-accent-1 my-3'>
          {t('prizeBreakdown')}
        </div>

        <hr className='border-accent-3' style={{ width: '100%' }} />

        <div className='flex flex-col w-full'>
          <div className='flex justify-between'>
            {/* <PrizeTableHeader>{t('prize')}</PrizeTableHeader> */}
            <PrizeTableHeader widthClasses='w-1/3 xs:w-32'>{t('amount')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-1/3 xs:w-32'>{t('winners')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-24'>{t('odds')}</PrizeTableHeader>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell
              className='font-inter font-bold text-sm xs:text-lg capitalize text-accent-1 my-1 w-1/3 xs:w-32'
              isFlashy
            >
              $50,000
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-sm xs:text-lg capitalize text-accent-1 my-1 w-1/3 xs:w-32'
              isFlashy
            >
              1
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-sm xs:text-lg capitalize text-accent-1 my-1 w-24'
              isFlashy
            >
              1/50,000
            </PrizeTableCell>
          </div>
          <div className='flex justify-between'>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>$2,500</PrizeTableCell>
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>10</PrizeTableCell>
            <PrizeTableCell widthClasses='w-24'>1/1,000</PrizeTableCell>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell widthClasses='w-1/3 xs:w-32'>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>$250</PrizeTableCell>
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>100</PrizeTableCell>
            <PrizeTableCell widthClasses='w-24'>1/100</PrizeTableCell>
          </div>
        </div>
      </div>
    </>
  )
}

const PrizeTableHeader = (props) => {
  return (
    <div
      className={classnames(
        'font-inter text-xxs capitalize text-accent-1 mt-8 mb-2 opacity-60',
        props.widthClasses
      )}
    >
      {props.children}
    </div>
  )
}

const PrizeTableCell = (props) => {
  return (
    <div
      className={classnames(props.className, props.widthClasses, {
        'text-flashy': props.isFlashy
      })}
    >
      {props.children}
    </div>
  )
}

PrizeTableCell.defaultProps = {
  className: 'font-inter text-sm xs:text-lg capitalize text-accent-1 my-1 opacity-60'
}
