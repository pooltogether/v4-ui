import classnames from 'classnames'
import ordinal from 'ordinal'
import { useTranslation } from 'react-i18next'
import { Token } from '@pooltogether/hooks'
import { Switch } from '@pooltogether/react-components'
import { Draw, DrawResults, PrizeAwardable, PrizeDistribution } from '@pooltogether/v4-js-client'

import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'
import { sortByBigNumber } from 'lib/utils/sortByBigNumber'
import classNames from 'classnames'
import { DrawData } from 'lib/types/v4'
import { getTimestampStringWithTime } from 'lib/utils/getTimestampString'
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
  const { tiers } = prizeDistribution
  const { amount: amountUnformatted, distributionIndex } = prize

  const { t } = useTranslation()

  const filteredTiers = tiers.filter((tierValue) => tierValue > 0)
  const tierIndex = filteredTiers.indexOf(tiers[distributionIndex])

  const { amountPretty } = roundPrizeAmount(amountUnformatted, ticket.decimals)

  return (
    <li
      className={classnames('flex flex-row text-center rounded-lg text-xxs', {
        'bg-light-purple-10': tierIndex !== 0,
        'pool-gradient-3 ': tierIndex === 0
      })}
    >
      <div
        className={classnames(
          'flex rounded-lg flex-row w-full justify-between space-x-2 py-2 px-4 sm:px-6',
          {
            'bg-actually-black bg-opacity-60': tierIndex === 0
          }
        )}
      >
        <span className='flex items-center '>
          <span className='mr-2'>{amountPretty}</span>{' '}
          <TokenSymbolAndIcon chainId={chainId} token={ticket} />
        </span>
        <span>{`${ordinal(tierIndex + 1)} ${t('tier', 'Tier')}${getEmoji(tierIndex)}`}</span>
      </div>
    </li>
  )
}

const getEmoji = (distributionIndex) => {
  return ' 🏆'

  if (distributionIndex === 0) {
    return ' 🏆'
  } else if (distributionIndex === 1) {
    return ' 🥈'
  } else if (distributionIndex === 2) {
    return ' 🥉'
  }
  return ''
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
        <span className='text-inverse'>{getTimestampStringWithTime(draw.timestamp)}</span>
      </div>
      <div>
        <Switch enabled={enabled} setEnabled={setEnabled} />
      </div>
    </div>
  )
}
