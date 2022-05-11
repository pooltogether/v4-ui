import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { Card } from '@pooltogether/react-components'
import { Amount, Token } from '@pooltogether/hooks'
import { Draw, PrizeDistributor } from '@pooltogether/v4-client-js'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useAllDrawDatas } from '@hooks/v4/PrizeDistributor/useAllDrawDatas'
import { useUsersClaimedAmounts } from '@hooks/v4/PrizeDistributor/useUsersClaimedAmounts'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { AmountInPrizes } from '@components/AmountInPrizes'
import { ViewPrizesSheetCustomTrigger } from '@components/ViewPrizesSheetButton'
import { getTimestampStringWithTime } from '@utils/getTimestampString'
import { useUsersPickCounts } from '@hooks/v4/PrizeDistributor/useUsersPickCounts'
import { BigNumber } from 'ethers'
import { useUsersStoredDrawResults } from '@hooks/v4/PrizeDistributor/useUsersStoredDrawResults'
import { DrawData } from '@interfaces/v4'
import { useSelectedPrizePoolTicket } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicket'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'

/**
 * TODO: Uncliamed draws are only checking valid draws now (not expired), not ALL draws in the draw buffer. This means we are no longer fetching the data to show "inelgible" for past draws that have expired. Not a big deal on mainnet, testnets are kinda awkward though.
 * @param props
 * @returns
 */
export const PastDrawsList = (props: {
  prizeDistributor: PrizeDistributor
  className?: string
}) => {
  const { prizeDistributor, className } = props

  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data: prizeDistributorToken, isFetched: isPrizePoolTokensFetched } =
    usePrizeDistributorToken(prizeDistributor)
  const { data: drawDatas, isFetched: isDrawsAndPrizeTiersFetched } =
    useAllDrawDatas(prizeDistributor)
  const { data: claimedAmountsData } = useUsersClaimedAmounts(usersAddress, prizeDistributor)
  const { data: ticket } = useSelectedPrizePoolTicket()
  const { data: pickCountsData } = useUsersPickCounts(
    usersAddress,
    ticket?.address,
    prizeDistributor
  )

  const isDataForCurrentUser =
    usersAddress === pickCountsData?.usersAddress &&
    usersAddress === claimedAmountsData?.usersAddress

  if (!isPrizePoolTokensFetched || !isDrawsAndPrizeTiersFetched || !isDataForCurrentUser) {
    return (
      <>
        <PastDrawsListHeader className={classNames(className, 'mb-1')} />
        <ul className='space-y-4'>
          <LoadingRow />
          <LoadingRow />
          <LoadingRow />
        </ul>
      </>
    )
  }

  const drawDatasList = Object.values(drawDatas).reverse()

  return (
    <>
      <PastDrawsListHeader className={classNames(className, 'mb-1')} />
      {drawDatasList.length === 0 && (
        <Card>
          <div className='opacity-70 text-center w-full'>
            {t('noDrawsYet', 'No draws yet, check back soon')}
          </div>
        </Card>
      )}
      <div className='relative'>
        <div
          className='absolute inset-0 pointer-events-none bg-body-list-fade'
          style={{ zIndex: 1 }}
        />
        <ul className='space-y-4 max-h-96 overflow-y-auto pb-10'>
          {drawDatasList.map((drawData) => {
            const drawId = drawData.draw.drawId
            return (
              <PastPrizeListItem
                key={`past-prize-list-${drawId}-${prizeDistributor.id()}`}
                drawData={drawData}
                prizeDistributor={prizeDistributor}
                ticket={ticket}
                prizeToken={prizeDistributorToken?.token}
                claimedAmount={claimedAmountsData?.claimedAmounts[drawId]}
                pickCount={pickCountsData?.pickCounts[drawId]}
              />
            )
          })}
        </ul>
      </div>
    </>
  )
}

interface PastPrizeListItemProps {
  prizeToken: Token
  ticket: Token
  drawData: DrawData
  prizeDistributor: PrizeDistributor
  claimedAmount: Amount
  pickCount: BigNumber
}

// Components inside need to account for the case where there is no prizeDistribution
const PastPrizeListItem = (props: PastPrizeListItemProps) => {
  const { prizeToken, drawData } = props
  const { draw, prizeTier } = drawData
  const amount = prizeTier ? roundPrizeAmount(prizeTier.prize, prizeToken.decimals) : null

  return (
    <li>
      <ViewPrizesSheetCustomTrigger
        prizeToken={prizeToken}
        prizeTier={prizeTier}
        Button={({ onClick }) => {
          return (
            <button
              onClick={onClick}
              className={classNames(
                'flex flex-row justify-between w-full bg-white dark:bg-pt-purple-dark dark:bg-opacity-50 rounded-lg p-4',
                'hover:shadow-lg hover:bg-opacity-100'
              )}
            >
              <div className='flex flex-col xs:flex-row justify-between w-full'>
                <div className='flex flex-col sm:w-2/3'>
                  <span className='flex items-start'>
                    <DrawId
                      className='uppercase font-bold text-accent-2 opacity-50 text-xs xs:text-sm mr-2'
                      draw={draw}
                    />
                    <DrawDate
                      className='uppercase font-bold text-accent-1 opacity-80 text-xs xs:text-sm'
                      draw={draw}
                    />
                  </span>

                  <ExtraDetailsSection {...props} className='mt-2 text-left' />
                </div>

                <AmountInPrizes
                  amount={amount}
                  className='hidden xs:flex'
                  numberClassName='font-bold text-inverse text-xs xs:text-sm'
                  textClassName='font-bold text-inverse text-xs xs:text-sm ml-1 opacity-60'
                />
              </div>

              <FeatherIcon
                icon='chevron-right'
                className='text-pt-purple-lighter w-6 h-6 ml-2 mb-auto'
              />
            </button>
          )
        }}
      />
    </li>
  )
}

export const DrawDate = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>
    {getTimestampStringWithTime(
      props.draw.beaconPeriodStartedAt.toNumber() + props.draw.beaconPeriodSeconds
    )}
  </span>
)

DrawDate.defaultProps = {
  className: 'uppercase font-bold text-inverse opacity-70 text-xs leading-none'
}

const DrawId = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>#{props.draw.drawId}</span>
)

DrawId.defaultProps = {
  className: 'uppercase font-bold text-inverse mr-2 opacity-50 text-xs leading-none'
}

const ExtraDetailsSection = (props: { className?: string } & PastPrizeListItemProps) => {
  const { claimedAmount, prizeDistributor, className, prizeToken, drawData, pickCount, ticket } =
    props
  const { draw } = drawData
  const usersAddress = useUsersAddress()

  const storedDrawResults = useUsersStoredDrawResults(usersAddress, prizeDistributor, ticket)
  const { t } = useTranslation()

  const drawResults = storedDrawResults?.[usersAddress]

  const drawResult = drawResults?.[draw.drawId]
  const amountUnformatted = claimedAmount?.amountUnformatted
  const userHasClaimed = amountUnformatted && !amountUnformatted?.isZero()
  const userHasAmountToClaim = drawResult && !drawResult.totalValue.isZero()
  const userWasNotEligible = pickCount && pickCount.isZero()
  const noPrizes = usersAddress && !userHasClaimed && !userHasAmountToClaim && drawResult
  const unclaimed = usersAddress && !userHasClaimed && userHasAmountToClaim

  const messageHeightClassName = 'h-6'

  if (noPrizes || unclaimed) {
    return <div className={classNames('text-inverse', messageHeightClassName, className)} />
  } else if (usersAddress && claimedAmount && !claimedAmount.amountUnformatted.isZero()) {
    const { amountPretty } = claimedAmount
    return (
      <div className={classNames(messageHeightClassName, className)}>
        <span className='text-accent-1'>{t('claimed', 'Claimed')}</span>
        <span className='ml-2 font-bold'>{amountPretty}</span>
        <span className='ml-2 font-bold'>{prizeToken.symbol}</span>
      </div>
    )
  } else if (usersAddress && pickCount && userWasNotEligible) {
    return (
      <div className={classNames(messageHeightClassName, className)}>
        <span className='text-accent-1 opacity-50'>{t('notEligible', 'Not eligible')}</span>
      </div>
    )
  } else {
    return <div className={classNames(messageHeightClassName, className)} />
  }
}

const PastDrawsListHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div className={classNames(props.className, 'pt-4 pb-2')}>
      <span className='font-semibold text-accent-1 text-lg'>{t('pastDraws', 'Past draws')}</span>
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-24' />
