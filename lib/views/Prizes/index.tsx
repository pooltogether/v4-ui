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
import { ethers } from 'ethers'
import { usePrizePoolTokenValue } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokenValue'
import ordinal from 'ordinal'
import { ScreenSize, TokenBalanceWithUsd, useOnboard, useScreenSize } from '@pooltogether/hooks'
import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import { PrizeAwardable, Draw } from '@pooltogether/draw-calculator-js-sdk'
import { numberWithCommas } from '@pooltogether/utilities'
import { useUsersClaimablePrizes } from 'lib/hooks/Tsunami/ClaimableDraws/useUsersClaimablePrizes'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useSelectedNetworkClaimableDraws'
import { ClaimableDraw } from '.yalc/@pooltogether/v4-js-client/dist'
import { useValidDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useValidDraws'

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
  // TODO: Fetch the users claimable prizes
  // useUsersClaimablePrizes(claimableDraw)
  const { data: draws, isFetched } = useValidDraws(claimableDraw)

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

const ConnectWalletButton = (props) => {
  const { connectWallet } = props
  const { t } = useTranslation()
  return (
    <SquareButton className='w-full mb-8' onClick={connectWallet}>
      {t('connectWallet')}
    </SquareButton>
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
