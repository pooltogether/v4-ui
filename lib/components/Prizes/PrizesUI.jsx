import { ThemedClipSpinner, ThemeContext, LoadingDots } from '@pooltogether/react-components'
import { CONTENT_PANE_STATES } from 'lib/components/DefaultPage'
import React from 'react'
import IconSwim from 'assets/images/icon-swim.png'
import IconParty from 'assets/images/icon-party.png'
import IconLeaf from 'assets/images/icon-leaf.png'
import PrizeWLaurels from 'assets/images/prize-w-laurels@2x.png'
import { useAllUsersClaimablePrizes } from 'lib/hooks/useAllUsersClaimablePrizes'
import { ethers } from 'ethers'
import { usePrizePoolTokensWithUsd } from 'lib/hooks/usePrizePoolTokensWithUsd'
import { usePrizePool } from 'lib/hooks/usePrizePool'
import ordinal from 'ordinal'
import { ScreenSize, useScreenSize } from '.yalc/@pooltogether/hooks/dist'
import classNames from 'classnames'

const { useState, useContext } = require('react')
const { useTranslation } = require('react-i18next')

export const PRIZE_PANE_STATES = {
  initialState: 'initialState',
  loading: 'loading',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = (props) => {
  const { setSelectedPage } = props

  usePrizePoolTokensWithUsd()

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
    // if (Math.random() > 0.5) {
    setPrizePane(PRIZE_PANE_STATES.won)
    // } else {
    // setPrizePane(PRIZE_PANE_STATES.didNotWin)
    // }
  }

  const handleCheckPrizesClick = (e) => {
    e.preventDefault()

    if (prizePane === PRIZE_PANE_STATES.didNotWin) {
      setSelectedPage(CONTENT_PANE_STATES.deposit)
      setPrizePane(PRIZE_PANE_STATES.initialState)
    } else if (prizePane === PRIZE_PANE_STATES.initialState) {
      setPrizePane(PRIZE_PANE_STATES.loading)
      setTimeout(simulateNextState, 1500)
    }
  }

  const initialOrLoadingState =
    prizePane === PRIZE_PANE_STATES.initialState || prizePane === PRIZE_PANE_STATES.loading

  const background =
    theme === 'dark' &&
    prizePane !== PRIZE_PANE_STATES.won &&
    'radial-gradient(rgba(76, 36, 159, 0.7) 0,  rgba(76, 36, 159, 0) 70%)'

  return (
    <>
      <div
        className='relative pt-12'
        style={{
          background,
          height: 382
        }}
      >
        {initialOrLoadingState && (
          <div
            className='absolute w-full h-full t-0 l-0 r-0 b-0 z-10'
            style={{
              backgroundImage: `url('/shapes-illustration.svg')`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        <div className='relative font-inter  mt-4 flex flex-col items-center text-center z-20'>
          {prizePane === PRIZE_PANE_STATES.initialState && <PreviousPrizePane />}

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

  const claiming = false

  return (
    <>
      <div className='bg-card px-4 xs:px-12 py-12 rounded-lg w-full'>
        <div className='w-full mx-auto'>
          <img
            src={IconParty}
            alt='icon of party confetti makers'
            height={76}
            width={205}
            className='mx-auto mb-6'
          />

          <div className='text-lg'>{t('itsPartyTime', `It's party time!`)}</div>
          <div className='text-lg font-semibold'>
            {t('youWonAmountOverThisPeriod', { amount: '$32,948.54' })}
          </div>
          <button
            className='pool-gradient-3 text-pt-purple hover:text-pt-purple font-bold transition-all rounded-full transform hover:scale-105 hover:shadow-xl w-full text-xl mt-4 mb-8 py-2 '
            onClick={() => {}}
            disabled={claiming}
          >
            {t('claimAllPrizes', 'Claim all prizes')}
          </button>

          <PrizeList />
        </div>
      </div>
    </>
  )
}

const PreviousPrizePane = (props) => {
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
        className='mx-auto mt-12'
      />
    </div>
  )
}

const PrizeList = (props) => {
  const prizePool = usePrizePool()
  const { data: claimablePrizes, isFetched: isClaimablePrizesFetched } =
    useAllUsersClaimablePrizes()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokensWithUsd()
  const screenSize = useScreenSize()

  const loading = !isPrizePoolTokensFetched || !isClaimablePrizesFetched
  if (loading) {
    return <LoadingDots />
  }

  const noPrizes = claimablePrizes.length === 0
  if (noPrizes) {
    return null
  }

  return (
    <>
      <div className='flex flex-row w-full py-2 px-4 text-accent-1 text-xxxs text-center'>
        <span className='w-full text-left'>Amount (USD)</span>
        <span className='w-full'>Prize</span>
        {screenSize !== ScreenSize.xs && <span className='w-full'>Draw</span>}
        <span className='w-full'>Date</span>
      </div>
      <ul className='max-h-80 overflow-y-auto'>
        {claimablePrizes.map((prize) => (
          <PrizeItem
            key={`${prize.drawId}-${prize.pickIndex}`}
            prize={prize}
            ticketToken={prizePoolTokens[prizePool.tokens.underlyingToken.address]}
          />
        ))}
      </ul>
    </>
  )
}

const PrizeItem = (props) => {
  const { prize, ticketToken } = props

  const screenSize = useScreenSize()

  const { distributionIndex, drawId, amountUnformatted, timestamp } = prize

  const amount = ethers.utils.formatUnits(amountUnformatted, ticketToken.decimals)
  const usd = getUsdAmount(amountUnformatted, ticketToken)

  let emoji = ''
  if (distributionIndex === 0) {
    emoji = ' 🏆'
  } else if (distributionIndex === 1) {
    emoji = ' 🥈'
  } else if (distributionIndex === 2) {
    emoji = ' 🥉'
  }

  return (
    <li
      className={classNames(
        'flex flex-row text-center p-px bg-light-purple-10 rounded-lg mb-2 last:mb-0 text-xxs',
        {
          'bg-light-purple-10': distributionIndex !== 0,
          'pool-gradient-3 ': distributionIndex === 0
        }
      )}
    >
      <div
        className={classNames('flex rounded-lg flex-row w-full py-2 px-4 sm:px-6', {
          'bg-actually-black bg-opacity-60': distributionIndex === 0
        })}
      >
        <div className='w-full flex flex-col text-left'>
          <span className='font-bold text-white'>${usd}</span>
          <span>{`${amount} ${ticketToken.symbol}`}</span>
        </div>
        <div className='w-full text-center xs:text-left pl-1 sm:pl-0'>{`${ordinal(
          distributionIndex + 1
        )}${screenSize !== ScreenSize.xs ? ' Prize' : ''}${emoji}`}</div>
        {screenSize !== ScreenSize.xs && <div className='w-full'>{`# ${drawId}`}</div>}
        <div className='w-full'>{timestamp}</div>
      </div>
    </li>
  )
}

const PrizeChecker = () => {
  // 1. Get claimable prize periods (draw ids)
  // 2. Check if user has checked for these prize periods
  // 3. Get prizes the user has checked but hasn't claimed

  // "Check the results"
  // 1. Use list of claimable prize periods (draw ids)
  // 2. Add to list of prizes the user hasn't claimed & replace UI with "You won $2000"

  const loading = false
  if (loading) {
    return <LoadingDots />
  }

  const noPrizesToCheck = false
  if (noPrizesToCheck) {
    return <NoPrizesToCheck />
  }

  return <></>
}

const NoPrizesToCheck = () => {
  return null
}

const getUsdAmount = (amount, prizeToken) => {
  return ethers.utils.formatUnits(
    amount.mul(ethers.utils.parseUnits(prizeToken.usd.toString(), 2)),
    prizeToken.decimals + 2
  )
}
