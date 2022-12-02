import { TokenSymbolAndIcon } from '@components/TokenSymbolAndIcon'
import { DrawData } from '@interfaces/v4'
import { Token } from '@pooltogether/hooks'
import { Switch } from '@pooltogether/react-components'
import { DrawResults, PrizeAwardable } from '@pooltogether/v4-client-js'
import { calculatePrizeForTierPercentage } from '@pooltogether/v4-utils-js'
import { getTimestampStringWithTime } from '@utils/getTimestampString'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { sortByBigNumber } from '@utils/sortByBigNumber'
import classNames from 'classnames'
import classnames from 'classnames'
import { useTranslation } from 'next-i18next'
import ordinal from 'ordinal'
import React from 'react'

interface PrizeListProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
  chainId: number
  drawData: DrawData
  drawResults: DrawResults
  ticket: Token
  token: Token
  drawIdsToNotClaim: Set<number>
  addDrawIdToClaim: (drawId: number) => void
  removeDrawIdToClaim: (drawId: number) => void
}

export const PrizeList = (props: PrizeListProps) => {
  const {
    drawResults,
    ticket,
    token,
    className,
    drawData,
    drawIdsToNotClaim,
    chainId,
    addDrawIdToClaim,
    removeDrawIdToClaim,
    ...ulProps
  } = props
  const { prizes, drawId } = drawResults
  const isNotClaiming = drawIdsToNotClaim.has(drawId)

  return (
    <div className={classNames({ 'opacity-50': isNotClaiming })}>
      <PrizeListHeader
        drawResults={drawResults}
        drawData={drawData}
        className='mb-2'
        drawIdsToNotClaim={drawIdsToNotClaim}
        addDrawIdToClaim={addDrawIdToClaim}
        removeDrawIdToClaim={removeDrawIdToClaim}
      />
      <ul
        {...ulProps}
        className={classnames(className, 'text-inverse max-h-80 overflow-y-auto space-y-2 pr-2')}
      >
        {!prizes &&
          Array.from(Array(3)).map((_, i) => <LoadingPrizeRow key={`prize-loading-row-${i}`} />)}
        {prizes?.sort(sortByPrizeAmountDesc).map((prize) => (
          <PrizeRow
            {...props}
            key={prize.pick.toString()}
            prize={prize}
            token={token}
            ticket={ticket}
            drawData={drawData}
          />
        ))}
      </ul>
    </div>
  )
}

const sortByPrizeAmountDesc = (a: PrizeAwardable, b: PrizeAwardable) =>
  sortByBigNumber(b.amount, a.amount)

interface PrizeRowProps {
  chainId: number
  prize: PrizeAwardable
  ticket: Token
  token: Token
  drawData: DrawData
}

const PrizeRow = (props: PrizeRowProps) => {
  const { chainId, prize, ticket, drawData } = props
  const { prizeDistribution } = drawData
  const { tiers, bitRangeSize, prize: drawPrizeTotalValue } = prizeDistribution
  const { amount: amountUnformatted, tierIndex: _tierIndex } = prize

  const { t } = useTranslation()

  const prizeValues = tiers.map((tierPercentage, index) =>
    calculatePrizeForTierPercentage(index, tierPercentage, bitRangeSize, drawPrizeTotalValue)
  )
  const largestPrizeValue = prizeValues.reduce((a, b) => (a.gt(b) ? a : b), prizeValues[0])
  const isGrandPrize = largestPrizeValue.eq(amountUnformatted)
  const { amountPretty } = roundPrizeAmount(amountUnformatted, ticket.decimals)

  return (
    <li
      className={classnames('flex flex-row text-center rounded-lg text-xxs', {
        'bg-light-purple-10': !isGrandPrize,
        'pool-gradient-3 ': isGrandPrize
      })}
    >
      <div
        className={classnames(
          'flex rounded-lg flex-row w-full justify-between space-x-2 py-2 px-4 sm:px-6',
          {
            'bg-actually-black bg-opacity-60': isGrandPrize
          }
        )}
      >
        <span className='flex items-center '>
          <span className='mr-2'>{amountPretty}</span>{' '}
          <TokenSymbolAndIcon chainId={chainId} token={ticket} />
        </span>
        <span>{`${ordinal(_tierIndex + 1)} ${t('tier', 'Tier')} 🏆`}</span>
      </div>
    </li>
  )
}

const LoadingPrizeRow = () => <li className='w-full h-6 animate-pulse bg-darkened rounded-xl' />

const PrizeListHeader = (props: {
  drawData: DrawData
  drawResults: DrawResults
  drawIdsToNotClaim: Set<number>
  addDrawIdToClaim: (drawId: number) => void
  removeDrawIdToClaim: (drawId: number) => void
  className?: string
}) => {
  const {
    drawResults,
    className,
    drawData,
    drawIdsToNotClaim,
    addDrawIdToClaim,
    removeDrawIdToClaim
  } = props
  const { drawId } = drawResults
  const { draw } = drawData

  const enabled = !drawIdsToNotClaim.has(drawId)
  const setEnabled = (enabled: boolean) => {
    if (enabled) {
      removeDrawIdToClaim(drawId)
    } else {
      addDrawIdToClaim(drawId)
    }
  }

  const { t } = useTranslation()
  return (
    <div className='flex w-full justify-between'>
      <div className={classNames(className, 'flex flex-col space-y-1 text-xs font-bold')}>
        <span className='text-accent-1 uppercase'>{t('drawNumber', { number: drawId })}</span>
        <span className='text-inverse'>
          {getTimestampStringWithTime(
            draw.beaconPeriodStartedAt.toNumber() + draw.beaconPeriodSeconds
          )}
        </span>
      </div>
      <div>
        <Switch enabled={enabled} setEnabled={setEnabled} />
      </div>
    </div>
  )
}
