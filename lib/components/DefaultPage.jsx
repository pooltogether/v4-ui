import React, { useContext, useEffect, useState } from 'react'
import classnames from 'classnames'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { NETWORK } from '@pooltogether/utilities'
import {
  useOnboard,
  useIsWalletOnNetwork,
  useTokenAllowances,
  useTokenBalances,
  useUsersAddress
} from '@pooltogether/hooks'
import {
  ThemeContext,
  PrizeCountdown,
  Tabs,
  Tab,
  Content,
  ContentPane,
  ThemedClipSpinner
} from '@pooltogether/react-components'

import { Deposit } from 'lib/components/Deposit'

import PrizeWLaurels from 'assets/images/prize-w-laurels@2x.png'
import IconSwim from 'assets/images/icon-swim.png'
import IconLeaf from 'assets/images/icon-leaf.png'

const bn = ethers.BigNumber.from

const MOCK_POOL = {
  config: { chainId: NETWORK.rinkeby },
  prizePool: { address: '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2' },
  tokens: {
    ticket: {
      decimals: 18,
      address: '0x4fb19557fbd8d73ac884efbe291626fd5641c778'
    },
    underlyingToken: {
      decimals: 18,
      address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'
    }
  }
}

export const CONTENT_PANE_STATES = {
  deposit: 'deposit',
  prizes: 'prizes',
  holdings: 'holdings'
}

export const PRIZE_PANE_STATES = {
  initialState: 'initialState',
  loading: 'loading',
  won: 'won',
  didNotWin: 'didNotWin'
}

const TAB_CLASS_NAMES = 'mx-4 px-10 py-2 bg-card rounded-full border'
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

  const setSelected = (newTab) => {
    const { query, pathname } = router
    query.tab = newTab
    router.replace({ pathname, query })
  }
  const selected = router.query.tab || CONTENT_PANE_STATES.deposit

  const depositSelected = selected === CONTENT_PANE_STATES.deposit
  const prizesSelected = selected === CONTENT_PANE_STATES.prizes
  const holdingsSelected = selected === CONTENT_PANE_STATES.holdings

  const selectedProps = { depositSelected, prizesSelected, holdingsSelected }

  return (
    <div className='flex flex-col items-center'>
      <NavTabs {...selectedProps} setSelected={setSelected} />
      <ContentPanes {...selectedProps} setSelected={setSelected} />
    </div>
  )
}

const NavTabs = (props) => {
  const { t } = useTranslation()
  const { depositSelected, prizesSelected, holdingsSelected, setSelected } = props

  return (
    <>
      <Tabs className='mb-4'>
        <Tab
          {...DEFAULT_TAB_PROPS}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.deposit)
          }}
          isSelected={depositSelected}
        >
          {t('deposit')}
        </Tab>
        <Tab
          {...DEFAULT_TAB_PROPS}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.prizes)
          }}
          isSelected={prizesSelected}
        >
          {t('prizes')}
        </Tab>
        <Tab
          {...DEFAULT_TAB_PROPS}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.holdings)
          }}
          isSelected={holdingsSelected}
        >
          {t('holdings')}
        </Tab>
      </Tabs>
    </>
  )
}

const ContentPanes = (props) => {
  const { depositSelected, prizesSelected, holdingsSelected } = props

  return (
    <>
      <ContentPane className='w-full' isSelected={depositSelected}>
        <Content>
          <DepositUI {...props} />
        </Content>
      </ContentPane>
      <ContentPane isSelected={prizesSelected}>
        <Content>
          <PrizesUI {...props} />
        </Content>
      </ContentPane>
      <ContentPane isSelected={holdingsSelected}>
        <Content>
          <HoldingsUI />
        </Content>
      </ContentPane>
    </>
  )
}

const DepositUI = (props) => {
  return (
    <div className='mx-auto my-4 flex flex-col w-full max-w-xl'>
      <UpcomingPrizeDetails />
      <DepositPane {...props} />
      <PrizeBreakdown />
    </div>
  )
}

const PrizesUI = (props) => {
  const { setSelected } = props

  const { t } = useTranslation()

  const [prizePane, setPrizePane] = useState(PRIZE_PANE_STATES.initialState)

  const { theme } = useContext(ThemeContext)

  const checkPrizesButtonLabel = () => {
    if (prizePane === PRIZE_PANE_STATES.loading) {
      return (
        <>
          <ThemedClipSpinner className='mr-2' size={16} />{' '}
          {t('checkingPrizeResults', 'Checking prize results')} ...
        </>
      )
    } else if (prizePane === PRIZE_PANE_STATES.didNotWin) {
      return <>{t('depositFunds', 'Deposit funds')}</>
    } else {
      return <>{t('checkIfIWon', 'Check if I won')}</>
    }
  }

  const simulateNextState = () => {
    if (Math.random() > 0.5) {
      setPrizePane(PRIZE_PANE_STATES.won)
    } else {
      setPrizePane(PRIZE_PANE_STATES.didNotWin)
    }
  }

  const handleCheckPrizesClick = (e) => {
    e.preventDefault()

    if (prizePane === PRIZE_PANE_STATES.didNotWin) {
      setSelected(CONTENT_PANE_STATES.deposit)
      setPrizePane(PRIZE_PANE_STATES.initialState)
    } else if (prizePane === PRIZE_PANE_STATES.initialState) {
      setPrizePane(PRIZE_PANE_STATES.loading)
      setTimeout(simulateNextState, 3500)
    }
  }

  const initialOrLoadingState =
    prizePane === PRIZE_PANE_STATES.initialState || prizePane === PRIZE_PANE_STATES.loading

  return (
    <>
      <div className='flex flex-col'>
        <div
          className='relative pt-12'
          style={{
            background:
              theme === 'light'
                ? ''
                : 'radial-gradient(rgba(76, 36, 159, 0.7) 0,  rgba(76, 36, 159, 0) 70%)',
            width: 579,
            height: 382
          }}
        >
          {initialOrLoadingState && (
            <div
              className='absolute w-full h-full t-0 l-0 r-0 b-0 z-10'
              style={{
                backgroundImage: `url('/prizes-ui-illustration.png')`
              }}
            />
          )}

          <div className='relative font-inter  mt-4 flex flex-col items-center text-center z-20'>
            {prizePane === PRIZE_PANE_STATES.initialState && <InitialPrizePane />}

            {prizePane === PRIZE_PANE_STATES.loading && <LoadingPrizePane />}

            {prizePane === PRIZE_PANE_STATES.didNotWin && <DidNotWinPrizePane />}

            {prizePane === PRIZE_PANE_STATES.won && <WonPrizePane />}
          </div>
        </div>

        {prizePane !== PRIZE_PANE_STATES.won && (
          <button
            className='new-btn rounded-lg w-full text-xl mt-4 py-2 '
            onClick={handleCheckPrizesClick}
            disabled={prizePane === PRIZE_PANE_STATES.loading}
          >
            {checkPrizesButtonLabel()}
          </button>
        )}
      </div>
    </>
  )
}

const LoadingPrizePane = (props) => {
  const { t } = useTranslation()

  return (
    <div className='text-lg max-w-xs'>
      <div className='mt-4 mb-16'>
        {t(
          'swimmingAcrossPacificOceanToCheckTheResultForYou',
          `Swimming across the Pacific to check prize results for you.`
        )}
      </div>

      <img
        src={IconSwim}
        alt='swimming stick man icon'
        height={92}
        width={92}
        className='mx-auto'
      />
    </div>
  )
}

const DidNotWinPrizePane = (props) => {
  const { t } = useTranslation()

  return (
    <div className='text-sm max-w-sm'>
      <div className='mt-4 mb-16'>
        {t(
          'youDidntWinButYouAlsoDidntLose',
          `You didn't win, but you also didn't lose! Deposit more savings to increase your odds for next time.`
        )}
      </div>

      <img src={IconLeaf} alt='icon of a tree leaf' height={76} width={73} className='mx-auto' />
    </div>
  )
}

const WonPrizePane = (props) => {
  const { t } = useTranslation()

  return (
    <>
      {t('itsPartyTime', `It's party time!`)}
      <br />
      {t('youWonAmountOverThisPeriod', `You won total prizes of {{amount}}!`)}
    </>
  )
}

const InitialPrizePane = (props) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className='text-xs'>{t('theResultOfPrizePeriod', 'The result of prize period:')}</div>
      <div className='text-xl text-highlight-1 my-1'>
        Week of August 21<sup>st</sup>, 2021
      </div>
      <div className='text-xs'>
        {t('theResultOfPrizePeriodisAvailable', 'is available. Check if you won!')}
      </div>
      <img
        src={PrizeWLaurels}
        alt='trophy icon w/ laurels'
        height={133}
        width={205}
        className='mx-auto mt-12'
      />
    </div>
  )
}

const HoldingsUI = (props) => {
  return <>holdings</>
}

const UpcomingPrizeDetails = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='bg-card hover:bg-secondary trans rounded-lg w-full p-10 flex flex-col mb-4 items-center'>
        <div className='font-inter uppercase text-accent-1'>{t('weeklyPrize')}</div>
        <div className='font-bold text-9xl'>$100,000.23</div>
        <div className='font-inter text-accent-1 my-4'>{t('awardIn')}</div>
        <PrizeCountdown
          textSize='text-xl'
          prizePeriodSeconds={bn(86400)}
          prizePeriodStartedAt={bn(1627514627)}
        />
      </div>
    </>
  )
}

const DepositPane = (props) => {
  const { t } = useTranslation()

  const { isWalletConnected } = useOnboard()

  const contractAddress = MOCK_POOL?.prizePool?.address
  const chainId = MOCK_POOL?.config?.chainId
  const underlyingToken = MOCK_POOL?.tokens?.underlyingToken
  const tokenAddress = underlyingToken.address
  const ticketAddress = MOCK_POOL?.tokens?.ticket.address

  const router = useRouter()
  const quantity = router.query.quantity || ''

  const walletOnCorrectNetwork = useIsWalletOnNetwork(chainId)

  const usersAddress = useUsersAddress()
  const { data: tokenBalances, isFetched: isTokenBalancesFetched } = useTokenBalances(
    chainId,
    usersAddress,
    [tokenAddress, ticketAddress]
  )

  const form = useForm({
    mode: 'all',
    reValidateMode: 'onChange'
  })

  const {
    data: tokenAllowances,
    isFetched: tokenAllowancesIsFetched,
    refetch: tokenAllowancesRefetch
  } = useTokenAllowances(chainId, usersAddress, contractAddress, [tokenAddress])

  const hideWrongNetworkOverlay =
    !isWalletConnected || (isWalletConnected && walletOnCorrectNetwork)

  return (
    <>
      <div className='relative bg-card rounded-lg w-full flex flex-col items-center mb-4 p-10'>
        <div
          className={classnames(
            'rounded-lg bg-overlay w-full h-full absolute t-0 b-0 l-0 r-0 z-20 trans bg-blur flex items-center justify-center p-20 text-center',
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
        </div>

        <Deposit
          {...props}
          key={0}
          ticketAddress={ticketAddress}
          underlyingToken={underlyingToken}
          tokenAddress={tokenAddress}
          tokenSymbol={tokenBalances?.[tokenAddress].symbol}
          usersTicketBalance={tokenBalances?.[ticketAddress].amount}
          usersUnderlyingBalance={tokenBalances?.[tokenAddress].amount}
          usersTokenAllowance={tokenAllowances?.[tokenAddress]?.allowanceUnformatted}
          tokenAllowancesRefetch={tokenAllowancesRefetch}
          tokenAllowancesIsFetched={tokenAllowancesIsFetched}
          contractAddress={contractAddress}
          quantity={quantity}
          // prevTicketBalance={prevTicketBalance}
          // prevUnderlyingBalance={prevUnderlyingBalance}
          chainId={chainId}
          form={form}
        />
      </div>
    </>
  )
}

const PrizeBreakdown = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='bg-card rounded-lg w-full flex flex-col items-center mb-4 px-20 p-10'>
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
            <PrizeTableHeader widthClasses='w-32'>{t('amount')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-32'>{t('winners')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-24'>{t('odds')}</PrizeTableHeader>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell
              className='font-inter font-bold text-lg capitalize text-accent-1 my-1 w-32'
              isFlashy
            >
              $50,000
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-lg capitalize text-accent-1 my-1 w-32'
              isFlashy
            >
              1
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-lg capitalize text-accent-1 my-1 w-24'
              isFlashy
            >
              1/50,000
            </PrizeTableCell>
          </div>
          <div className='flex justify-between'>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-32'>$2,500</PrizeTableCell>
            <PrizeTableCell widthClasses='w-32'>10</PrizeTableCell>
            <PrizeTableCell widthClasses='w-24'>1/1,000</PrizeTableCell>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell widthClasses='w-32'>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-32'>$250</PrizeTableCell>
            <PrizeTableCell widthClasses='w-32'>100</PrizeTableCell>
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
  className: 'font-inter text-lg capitalize text-accent-1 my-1 opacity-60'
}
