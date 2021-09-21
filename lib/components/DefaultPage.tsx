import React, { useContext, useEffect, useState } from 'react'
import classnames from 'classnames'
import { BigNumber, ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useOnboard, useIsWalletOnNetwork, usePrizePeriod } from '@pooltogether/hooks'
import {
  PrizeCountdown,
  Tabs,
  Tab,
  Content,
  ContentPane,
  LoadingDots,
  NetworkIcon
} from '@pooltogether/react-components'

import { Deposit } from 'lib/components/Deposit'

import PrizeWLaurels from 'assets/images/prize-w-laurels@2x.png'

import { AccountUI } from 'lib/components/Account/AccountUI'
import { usePrizePool } from 'lib/hooks/usePrizePool'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'
import { PrizesUI } from 'lib/components/Prizes/PrizesUI'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useUsersDepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { numberWithCommas, safeParseUnits } from '@pooltogether/utilities'
import { URL_QUERY_KEY } from 'lib/constants/urlQueryKeys'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useClaimableDraws'

export enum ContentPaneState {
  deposit = 'deposit',
  prizes = 'prizes',
  account = 'account'
}

const TAB_CLASS_NAMES = 'px-5 xs:px-10 py-2 bg-card rounded-full border'
const TAB_DESELECTED_CLASS_NAMES =
  'text-accent-1 hover:text-inverse border-transparent hover:border-highlight-2 hover:bg-card-selected'
const TAB_SELECTED_CLASS_NAMES = 'text-accent-3 border-default bg-card-selected'

const DEFAULT_TAB_PROPS = {
  tabDeselectedClassName: TAB_DESELECTED_CLASS_NAMES,
  tabSelectedClassName: TAB_SELECTED_CLASS_NAMES,
  className: TAB_CLASS_NAMES
}

export const DefaultPage = (props) => {
  const router = useRouter()

  useSelectedNetworkPlayer()
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  const { isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  const setSelectedPage = (newTab: ContentPaneState) => {
    const { query, pathname } = router
    query[URL_QUERY_KEY.tab] = newTab
    router.replace({ pathname, query })
  }
  const selected = router.query[URL_QUERY_KEY.tab] || ContentPaneState.deposit

  const depositSelected = selected === ContentPaneState.deposit
  const prizesSelected = selected === ContentPaneState.prizes
  const accountSelected = selected === ContentPaneState.account

  const selectedProps = { depositSelected, prizesSelected, accountSelected }

  if (!isPrizePoolFetched || !isPrizePoolTokensFetched) {
    return (
      <div className='w-full h-full flex'>
        <LoadingDots className='m-auto' />
      </div>
    )
  }

  return (
    <>
      <NavTabs {...selectedProps} setSelectedPage={setSelectedPage} className='mx-auto mb-6' />
      <div className='max-w-xl mx-auto'>
        <ContentPanes {...selectedProps} setSelectedPage={setSelectedPage} />
      </div>
    </>
  )
}

const NavTabs = (props) => {
  const { t } = useTranslation()
  const { className, depositSelected, prizesSelected, accountSelected, setSelectedPage } = props

  return (
    <nav className={classnames(className, 'max-w-max flex flex-row rounded bg-darkened px-2 py-1')}>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.deposit}
        isSelected={depositSelected}
      >
        {t('deposit')}
      </NavTab>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.prizes}
        isSelected={prizesSelected}
      >
        {t('prizes')}
      </NavTab>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.account}
        isSelected={accountSelected}
      >
        {t('account')}
      </NavTab>
    </nav>
  )
}

const NavTab = (props) => {
  const { setSelectedPage, page, isSelected, ...buttonProps } = props
  return (
    <a
      {...buttonProps}
      className={classnames(
        'transition mx-1 first:ml-0 last:mr-0 rounded px-2 flex flex-row hover:bg-light-purple-10 active:bg-tertiary',
        { 'bg-tertiary': isSelected }
      )}
      onClick={() => setSelectedPage(page)}
    />
  )
}

const CONTENT_PANE_CLASSNAME = 'pt-4 w-full'

export interface ContentPanesProps {
  depositSelected: boolean
  prizesSelected: boolean
  accountSelected: boolean
  setSelectedPage: (page: ContentPaneState) => void
}

const ContentPanes = (props: ContentPanesProps) => {
  const { depositSelected, prizesSelected, accountSelected } = props

  return (
    <>
      <ContentPane className={CONTENT_PANE_CLASSNAME} isSelected={depositSelected}>
        <Content>
          <DepositUI {...props} />
        </Content>
      </ContentPane>
      <ContentPane className={CONTENT_PANE_CLASSNAME} isSelected={prizesSelected}>
        <Content>
          <PrizesUI {...props} />
        </Content>
      </ContentPane>
      <ContentPane className={CONTENT_PANE_CLASSNAME} isSelected={accountSelected}>
        <Content>
          <AccountUI {...props} />
        </Content>
      </ContentPane>
    </>
  )
}

const DepositUI = (props: ContentPanesProps) => {
  return (
    <>
      <UpcomingPrizeDetails />
      <DepositPane {...props} />
      <PrizeBreakdown />
    </>
  )
}

export interface QuantityDetails {
  quantity: string
  quantityUnformatted: BigNumber
  quantityPretty: string
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

const UpcomingPrizeDetails = (props) => {
  const { t } = useTranslation()
  const prizePool = usePrizePool()
  const chainId = usePoolChainId()
  const { data, isFetched } = usePrizePeriod(chainId, prizePool.prizeStrategy.address)

  if (!isFetched) {
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
      <div className='font-inter text-accent-1 my-4'>{t('awardIn')}</div>
      <PrizeCountdown
        textSize='text-xl'
        t={t}
        prizePeriodSeconds={data.prizePeriodSeconds}
        prizePeriodStartedAt={data.prizePeriodStartedAt}
        isRngRequested={data.isRngRequested}
        canStartAward={data.canStartAward}
        canCompleteAward={data.canCompleteAward}
      />
    </div>
  )
}

{
  /* <div
className={classnames(
  'rounded-lg bg-overlay w-full h-full absolute t-0 b-0 l-0 r-0 z-30 trans bg-blur flex items-center justify-center p-20 text-center',
  {
    'opacity-0 pointer-events-none': hideWrongNetworkOverlay
  }
)}
style={{
  textShadow: '2px 2px 20px black'
}}
>
<div className='text-lg -mt-10'>
  {t(
    'tsunamiWrongNetworkMsg',
    `To use Tsunami please set your wallet's network to Rinkeby`
  )}
</div>
</div> */
}
