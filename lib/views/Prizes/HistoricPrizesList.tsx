import { Amount } from '@pooltogether/hooks'
import { Card } from '@pooltogether/react-components'
import { DrawPrize, PrizePool } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useClaimableDrawsAndPrizeDistributions } from 'lib/hooks/Tsunami/DrawPrizes/useClaimableDrawsAndPrizeDistributions'
import { usePastDrawsForUser } from 'lib/hooks/Tsunami/DrawPrizes/usePastDrawsForUser'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getStoredDrawResult } from 'lib/utils/drawResultsStorage'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  DrawDate,
  DrawDetailsProps,
  DrawId,
  DrawPrizeTotal,
  ViewPrizesTrigger
} from './DrawCard/DrawDetails'

export const HistoricPrizesList = (props: { drawPrize: DrawPrize; prizePool: PrizePool }) => {
  const { prizePool, drawPrize } = props
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: pastDraws, isFetched: isDrawsAndPrizeDistributionsFetched } = usePastDrawsForUser(
    drawPrize,
    prizePoolTokens?.token
  )

  if (!isPrizePoolTokensFetched || !isDrawsAndPrizeDistributionsFetched) {
    return (
      <>
        <HistoricPrizesListHeader className='mb-4' />
        <ul className='space-y-4'>
          <LoadingRow />
          <LoadingRow />
          <LoadingRow />
        </ul>
      </>
    )
  }
  return (
    <>
      <HistoricPrizesListHeader className='mb-4' />{' '}
      <ul className='space-y-4'>
        {pastDraws.map((pastDraw) => (
          <PastPrizeListItem
            key={`past-prize-list-${pastDraw.draw.drawId}-${drawPrize.id()}`}
            {...pastDraw}
            drawPrize={drawPrize}
            token={prizePoolTokens.token}
          />
        ))}
      </ul>
    </>
  )
}

interface PastPrizeListItemProps extends DrawDetailsProps {
  claimedAmount: Amount
  drawPrize: DrawPrize
}

const PastPrizeListItem = (props: PastPrizeListItemProps) => (
  <li>
    <Card>
      <div className='flex flex-row space-x-2 mb-1'>
        <DrawId {...props} />
        <DrawDate {...props} />
      </div>
      <div className='flex justify-between'>
        <DrawPrizeTotal {...props} numberClassName='font-bold text-xl' />
        <ViewPrizesTrigger {...props} />
      </div>
      <ClaimedAmountSection {...props} className='mt-2' />
    </Card>
  </li>
)

const ClaimedAmountSection = (props: { className?: string } & PastPrizeListItemProps) => {
  const { claimedAmount, drawPrize, draw, className, token } = props
  const { amountUnformatted } = claimedAmount

  const usersAddress = useUsersAddress()

  const storedDrawResult = getStoredDrawResult(usersAddress, drawPrize, draw.drawId)

  console.log('storedDrawResult', storedDrawResult)
  const userHasntClaimed = amountUnformatted.isZero()
  const userHasAmountToClaim = !storedDrawResult?.drawResults.totalValue.isZero()

  if (!Boolean(storedDrawResult)) {
    return null
  } else if (userHasntClaimed && !userHasAmountToClaim) {
    return <span className={classNames('text-accent-1', className)}>No prizes won</span>
  } else if (userHasntClaimed && userHasAmountToClaim) {
    const { amountPretty } = getAmountFromBigNumber(
      storedDrawResult?.drawResults.totalValue,
      token.decimals
    )
    return (
      <div className={classNames(className, 'animate-pulse')}>
        <span className='text-accent-1'>Unclaimed</span>
        <span className='ml-2 font-bold'>{amountPretty}</span>
        <span className='ml-2 font-bold'>{token.symbol}</span>
      </div>
    )
  }

  const { amountPretty } = claimedAmount

  return (
    <div className={classNames(className)}>
      <span className='text-accent-1'>Claimed</span>
      <span className='ml-2 font-bold'>{amountPretty}</span>
      <span className='ml-2 font-bold'>{token.symbol}</span>
    </div>
  )
}

const HistoricPrizesListHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        props.className,
        'flex justify-between sticky top-20 sm:top-24 bg-body py-2 z-10'
      )}
    >
      <span className='font-semibold text-accent-1 text-lg'>{t('pastPrizes', 'Past prizes')}</span>
      <SelectedNetworkToggle />
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-36' />
