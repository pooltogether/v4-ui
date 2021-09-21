import {
  ThemedClipSpinner,
  LoadingDots,
  SimpleCountDown,
  SquareButton
} from '@pooltogether/react-components'
import { useTimeout } from 'beautiful-react-hooks'
import React, { useEffect, useState } from 'react'
import IconSwim from 'assets/images/icon-swim.png'
import IconParty from 'assets/images/icon-party.png'
import IconLeaf from 'assets/images/icon-leaf.png'
import PrizeWLaurels from 'assets/images/prize-w-laurels@2x.png'
import { useUsersClaimablePrizes as useUsersClaimablePrizes_OLD } from 'lib/hooks/useUsersClaimablePrizes'
import { ethers } from 'ethers'
import { usePrizePoolTokensWithUsd } from 'lib/hooks/usePrizePoolTokensWithUsd'
import ordinal from 'ordinal'
import { ScreenSize, TokenBalanceWithUsd, useOnboard, useScreenSize } from '@pooltogether/hooks'
import classNames from 'classnames'
import { useCurrentPrizePeriod } from 'lib/hooks/useCurrentPrizePeriod'
import { useLatestDraw } from 'lib/hooks/useLatestDraw'
import { Trans, useTranslation } from 'react-i18next'
import { ClaimablePickPrize, Draw } from 'lib/types/TsunamiTypes'
import { useClaimableDraws as useClaimableDraws_OLD } from 'lib/hooks/useClaimableDraws'
import { numberWithCommas } from '@pooltogether/utilities'
import { useClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useClaimableDraws'
import { useUsersClaimablePrizes } from 'lib/hooks/Tsunami/ClaimableDraws/useUsersClaimablePrizes'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useSelectedNetworkClaimableDraws'
import { ClaimableDraw } from '.yalc/@pooltogether/v4-js-client/dist'
import { useDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useDraws'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = (props) => {
  const { data: claimableDraws, isFetched } = useSelectedNetworkClaimableDraws()
  const { isWalletConnected, connectWallet } = useOnboard()

  if (!isWalletConnected) {
    return <ConnectWalletButton connectWallet={connectWallet} />
  }

  if (!isFetched) {
    return <LoadingDots />
  }

  return (
    <div>
      {claimableDraws.map((claimableDraw) => (
        <ClaimableDrawDrawsList key={claimableDraw.id()} claimableDraw={claimableDraw} />
      ))}
    </div>
  )
}

interface ClaimableDrawProps {
  claimableDraw: ClaimableDraw
}

const ClaimableDrawDrawsList = (props: ClaimableDrawProps) => {
  const { claimableDraw } = props
  useUsersClaimablePrizes(claimableDraw)
  const { data: draws, isFetched } = useDraws(claimableDraw)

  if (!isFetched) {
    return <LoadingDots />
  }

  return (
    <div>
      {claimableDraw.id()}
      {draws.map((draw) => (
        <DrawPeriod
          key={`${claimableDraw.id()}_${draw.drawId}`}
          claimableDraw={claimableDraw}
          draw={draw}
        />
      ))}
    </div>
  )
}

interface DrawPeriodProps extends ClaimableDrawProps {
  draw: Draw
}

const DrawPeriod = (props: DrawPeriodProps) => {
  const { draw } = props
  return <div>{draw.drawId}</div>
}

/////////////////////////////////////

export const PrizesUI_OLD = (props) => {
  // Kick off loading everything immediately
  const { isWalletConnected, connectWallet, address: usersAddress } = useOnboard()
  const { data, isFetched: isClaimablePrizesFetched } = useUsersClaimablePrizes_OLD()
  usePrizePoolTokensWithUsd()
  useCurrentPrizePeriod()
  useClaimableDraws_OLD()

  const claimablePrizes = data?.claimablePrizes
  const totalClaimableAmountUnformatted = data?.totalAmountUnformatted

  const [prizesUIState, setPrizesUIState] = useState(PRIZE_UI_STATES.initialState)
  const [hasUserClickedCheck, setHasUserClickedCheck] = useState(false)

  // Reset on wallet change
  useEffect(() => {
    setPrizesUIState(PRIZE_UI_STATES.initialState)
    setHasUserClickedCheck(false)
  }, [usersAddress])

  if (!isWalletConnected) {
    return (
      <>
        <LatestPrizeToCheck className='mb-8' />
        <ConnectWalletButton connectWallet={connectWallet} />
      </>
    )
  }

  return (
    <>
      <SelectedNetworkToggle />
      <PrizesToCheckPrompt
        claimablePrizes={claimablePrizes}
        isClaimablePrizesFetched={isClaimablePrizesFetched}
        prizesUIState={prizesUIState}
        setPrizesUIState={setPrizesUIState}
      />
      <CheckPrizesButton
        prizesUIState={prizesUIState}
        hasUserClickedCheck={hasUserClickedCheck}
        isClaimablePrizesFetched={isClaimablePrizesFetched}
        setHasUserClickedCheck={setHasUserClickedCheck}
        setPrizesUIState={setPrizesUIState}
      />
      <ClaimablePrizes
        prizesUIState={prizesUIState}
        hasUserClickedCheck={hasUserClickedCheck}
        isClaimablePrizesFetched={isClaimablePrizesFetched}
        amountUnformatted={totalClaimableAmountUnformatted}
      />
    </>
  )
}

const ClaimablePrizes = (props) => {
  const { hasUserClickedCheck, isClaimablePrizesFetched, prizesUIState, amountUnformatted } = props
  const { t } = useTranslation()

  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokensWithUsd()

  if (
    !isClaimablePrizesFetched ||
    !hasUserClickedCheck ||
    !isPrizePoolTokensFetched ||
    prizesUIState === PRIZE_UI_STATES.initialState ||
    prizesUIState === PRIZE_UI_STATES.checkingForPrizes ||
    prizesUIState === PRIZE_UI_STATES.didNotWin
  ) {
    return null
  }

  const claiming = false

  const usd = getUsdAmount(amountUnformatted, prizePoolTokens.ticket)

  return (
    <div className='bg-card px-4 xs:px-12 py-12 rounded-lg w-full'>
      <div className='w-full mx-auto'>
        <img
          src={IconParty}
          alt='icon of party confetti makers'
          height={76}
          width={205}
          className='mx-auto mb-6'
        />

        <div className='text-lg text-center'>{t('itsPartyTime', `It's party time!`)}</div>
        <div className='text-lg font-semibold text-center'>
          <Trans
            i18nKey='youWonAmountOverThisPeriod'
            values={{ amount: `$${numberWithCommas(usd)}` }}
            components={{ div: <span className='text-pt-teal' /> }}
          />
        </div>
        <button
          className='pool-gradient-3 text-pt-purple hover:text-pt-purple font-bold transition-all rounded-full transform hover:scale-105 hover:shadow-xl active:scale-105 active:shadow-xl w-full text-xl mt-4 mb-8 py-2 '
          onClick={() => {}}
          disabled={claiming}
        >
          {t('claimAllPrizes', 'Claim all prizes')}
        </button>

        <PrizeList
          hasUserClickedCheck={hasUserClickedCheck}
          prizePoolTokens={prizePoolTokens}
          isPrizePoolTokensFetched={isPrizePoolTokensFetched}
        />
      </div>
    </div>
  )
}

const ClaimableAmount = (props) => {
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokensWithUsd()
  const { data: claimablePrizes, isFetched } = useUsersClaimablePrizes_OLD()
  const { t } = useTranslation()

  if (!isFetched || !isTokensFetched) {
    return <div className='animate-pulse rounded-lg h-4 w-20' />
  }

  const claimableAmountUnformatted = claimablePrizes.claimablePrizes.reduce(
    (claimableAmount, prize) => claimableAmount.add(prize.amountUnformatted),
    ethers.constants.Zero
  )
  const claimableAmount = ethers.utils.formatUnits(
    claimableAmountUnformatted,
    tokens.underlyingToken.decimals
  )

  return (
    <div className='text-lg font-semibold'>
      {t('youWonAmountOverThisPeriod', { amount: claimableAmount.toLocaleString() })}
    </div>
  )
}

const PrizesToCheckPrompt = (props) => {
  const { prizesUIState } = props

  // TODO: Probably unecessary - will block until prize calcs are done
  // if (!isClaimablePrizesFetched) {
  //   return <PrizesToCheckPromptLoadingState className='mb-8' />
  // }

  if (PRIZE_UI_STATES.checkingForPrizes === prizesUIState) {
    // if (true) {
    return <CheckingForPrizeState className='mb-8' {...props} />
  }

  if (PRIZE_UI_STATES.didNotWin === prizesUIState) {
    return <DidNotWinPrizeState className='mb-8' />
  }

  if (PRIZE_UI_STATES.won === prizesUIState) {
    return <NoPrizesToCheck className='mb-8' />
  }

  return <LatestPrizeToCheck className='mb-8' />
}

const PrizesToCheckPromptLoadingState = (props) => (
  <SmallShapesContainer {...props}>
    <LoadingDots className='mx-auto my-10' />
  </SmallShapesContainer>
)

const CheckingForPrizeState = (props) => {
  const { setPrizesUIState, isClaimablePrizesFetched, claimablePrizes } = props
  const { t } = useTranslation()
  const [minimumTimeComplete, setMinimumTimeComplete] = useState(false)

  useTimeout(() => {
    setMinimumTimeComplete(true)
  }, 1000)

  useEffect(() => {
    if (minimumTimeComplete && isClaimablePrizesFetched) {
      if (claimablePrizes.length) {
        setPrizesUIState(PRIZE_UI_STATES.won)
      } else {
        setPrizesUIState(PRIZE_UI_STATES.didNotWin)
      }
    }
  }, [minimumTimeComplete, isClaimablePrizesFetched])

  return (
    <LargeShapesContainer {...props}>
      <div className='mt-10 mb-10 text-xs max-w-xs mx-auto text-center'>
        {t(
          'swimmingAcrossPacificOceanToCheckTheResultForYou',
          `Swimming across the Pacific to check prize results for you.`
        )}
      </div>

      <img
        src={IconSwim}
        alt='swimming stick man icon'
        height={76}
        width={76}
        className='mx-auto mt-10 mb-10'
      />
    </LargeShapesContainer>
  )
}

const DidNotWinPrizeState = (props) => {
  const { t } = useTranslation()

  return (
    <div
      className={classNames('flex flex-col max-w-sm text-center mx-auto', props.className)}
      style={{ background: 'radial-gradient(rgba(76, 36, 159, 0.7) 0,  rgba(76, 36, 159, 0) 70%)' }}
    >
      <div className='mt-8 mb-10 text-xs max-w-xs mx-auto'>
        {t(
          'youDidntWinButYouAlsoDidntLose',
          `You didn't win, but you also didn't lose! Deposit more savings to increase your odds for next time.`
        )}
      </div>

      <img
        src={IconLeaf}
        alt='icon of a tree leaf'
        height={76}
        width={73}
        className='mx-auto mb-8'
      />
    </div>
  )
}

const NoPrizesToCheck = (props) => {
  const { data: prizePeriod, isFetched } = useCurrentPrizePeriod()

  if (!isFetched) {
    return <PrizesToCheckPromptLoadingState {...props} />
  }

  return (
    <SmallShapesContainer {...props}>
      <div className='mx-auto my-12 flex flex-col text-center'>
        <span>
          Next prize in <SimpleCountDown seconds={prizePeriod._prizePeriodRemainingSeconds} />
        </span>

        <span>Come back soon!</span>
      </div>
    </SmallShapesContainer>
  )
}

const LatestPrizeToCheck = (props) => {
  const { t } = useTranslation()

  const { data: latestDraw, isFetched } = useLatestDraw()

  if (!isFetched) {
    return <PrizesToCheckPromptLoadingState />
  }

  const dateString = getTimestampString(latestDraw.timestamp)

  return (
    <LargeShapesContainer {...props}>
      <div className='text-center mt-2'>
        <Trans
          i18nKey='theResultsFromDateAreAvailable'
          components={{
            div: <div />,
            dateStyle: <div className='text-xl text-highlight-1 my-1' />
          }}
          values={{ date: dateString }}
        />
      </div>
      <img
        src={PrizeWLaurels}
        alt='trophy icon w/ laurels'
        height={133}
        className='mx-auto mt-12 mb-4'
      />
    </LargeShapesContainer>
  )
}

const CheckPrizesButton = (props) => {
  const { t } = useTranslation()
  const { prizesUIState, setHasUserClickedCheck, setPrizesUIState, hasUserClickedCheck } = props

  const checkPrizesButtonLabel = () => {
    if (prizesUIState === PRIZE_UI_STATES.checkingForPrizes) {
      return (
        <>
          <ThemedClipSpinner className='mr-2' size={16} />{' '}
          {t('checkingPrizeResults', 'Checking prize results')} ...
        </>
      )
    } else if (prizesUIState === PRIZE_UI_STATES.didNotWin) {
      return <>{t('depositFunds', 'Deposit funds')}</>
    } else {
      return <>{t('checkIfIWon', 'Check if I won')}</>
    }
  }

  const onClick = () => {
    setHasUserClickedCheck(true)
    setPrizesUIState(PRIZE_UI_STATES.checkingForPrizes)
  }

  if (prizesUIState === PRIZE_UI_STATES.didNotWin || prizesUIState === PRIZE_UI_STATES.won) {
    return null
  }

  return (
    <SquareButton className='w-full mb-8' disabled={hasUserClickedCheck} onClick={onClick}>
      {checkPrizesButtonLabel()}
    </SquareButton>
  )
}

const PrizeList = (props) => {
  const { prizePoolTokens, isPrizePoolTokensFetched } = props
  const { data, isFetched: isClaimablePrizesFetched } = useUsersClaimablePrizes_OLD()
  const { data: draws, isFetched: isDrawsFetched } = useClaimableDraws_OLD()
  const screenSize = useScreenSize()

  const loading = !isPrizePoolTokensFetched || !isClaimablePrizesFetched || !isDrawsFetched
  if (loading) {
    return null
  }

  const { claimablePrizes } = data

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
            ticketToken={prizePoolTokens.ticket}
            underlyingToken={prizePoolTokens.underlyingToken}
            draw={draws[prize.drawId]}
          />
        ))}
      </ul>
    </>
  )
}

interface PrizeItemProps {
  prize: ClaimablePickPrize
  ticketToken: TokenBalanceWithUsd
  underlyingToken: TokenBalanceWithUsd
  draw: Draw
}

const PrizeItem = (props: PrizeItemProps) => {
  const { prize, ticketToken, underlyingToken, draw } = props

  const screenSize = useScreenSize()

  const { distributionIndex, drawId, amountUnformatted } = prize
  const { timestamp } = draw

  const amount = ethers.utils.formatUnits(amountUnformatted, ticketToken.decimals)
  const usd = getUsdAmount(amountUnformatted, ticketToken)
  const dateString = getTimestampString(timestamp, { day: 'numeric', month: 'long' })

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
          <span>{`${amount} ${underlyingToken.symbol}`}</span>
        </div>
        <div className='w-full text-center xs:text-left pl-1 sm:pl-0'>{`${ordinal(
          distributionIndex + 1
        )}${screenSize !== ScreenSize.xs ? ' Prize' : ''}${emoji}`}</div>
        {screenSize !== ScreenSize.xs && <div className='w-full'>{`# ${drawId}`}</div>}
        <div className='w-full'>{dateString}</div>
      </div>
    </li>
  )
}

const ShapesContainer = (props) => {
  return (
    <div
      className={classNames(
        'flex flex-col justify-center bg-contain bg-no-repeat bg-center',
        props.className
      )}
      style={{
        backgroundImage: props.backgroundImage
      }}
    >
      <div
        className='flex flex-col justify-center'
        style={{
          background: 'radial-gradient(rgba(76, 36, 159, 0.7) 0,  rgba(76, 36, 159, 0) 70%)'
        }}
      >
        {props.children}
      </div>
    </div>
  )
}

const LargeShapesContainer = (props) => (
  <ShapesContainer {...props} backgroundImage={`url('/shapes-illustration.svg')`} />
)
const SmallShapesContainer = (props) => (
  <ShapesContainer {...props} backgroundImage={`url('/small-shapes-illustration.svg')`} />
)

const ConnectWalletButton = (props) => {
  const { connectWallet } = props
  const { t } = useTranslation()
  return (
    <SquareButton className='w-full mb-8' onClick={connectWallet}>
      {t('connectWallet')}
    </SquareButton>
  )
}

export const getUsdAmount = (amount, prizeToken) => {
  return ethers.utils.formatUnits(
    amount.mul(ethers.utils.parseUnits(prizeToken.usd.toString(), 2)),
    prizeToken.decimals + 2
  )
}

export const getTimestampString = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }
) => new Date(timestamp * 1000).toLocaleDateString('en-US', options)
