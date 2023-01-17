import { CurrencyValue } from '@components/CurrencyValue'
import { TransparentDiv } from '@components/TransparentDiv'
import { EstimateAction } from '@constants/odds'
import { useFormTokenAmount } from '@hooks/useFormTokenAmount'
import { useOdds } from '@hooks/v4/PrizePool/useOdds'
import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { usePrizePoolOddsData } from '@hooks/v4/PrizePool/usePrizePoolOddsData'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useUsersPrizePoolTwab } from '@hooks/v4/PrizePool/useUsersPrizePoolTwab'
import { Amount, Token } from '@pooltogether/hooks'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import { formatNumberForDisplay } from '@pooltogether/utilities'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import classnames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const ExpectedPrizeBreakdown: React.FC<{
  formKey: string
  className?: string
}> = (props) => {
  const { formKey, className } = props
  const { t } = useTranslation()
  const prizePool = useSelectedPrizePool()
  const { data: prizeData, isFetched: isPrizesFetched } = usePrizePoolExpectedPrizes(prizePool)
  const { data: tokenData, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)

  const { data: tokens } = useSelectedPrizePoolTokens()
  const isFetched = isPrizesFetched && isTokensFetched
  const amountToDeposit = useFormTokenAmount(formKey, tokens?.token)

  return (
    <TransparentDiv className='flex flex-col max-w-md text-center px-4 py-2 overflow-y-auto rounded-lg minimal-scrollbar max-h-56'>
      <span className='mb-2 font-bold'>{t('yourPrizeBreakdown')}</span>
      <div className='grid grid-cols-2 mb-2'>
        <PrizeTableHeader>Prize Value</PrizeTableHeader>
        <PrizeTableHeader>Chance to win</PrizeTableHeader>
      </div>

      {!isFetched ? (
        <>
          <LoadingPrizeRow />
          <LoadingPrizeRow />
          <LoadingPrizeRow />
        </>
      ) : (
        <ul className='grid grid-cols-2 gap-3'>
          {prizeData.prizeTier?.tiers.map((_, i) => (
            <PrizeBreakdownTableRow
              key={`distribution_row_${i}`}
              index={i}
              prizeValue={prizeData.valueOfPrizesByTier[i]}
              expectedNumberOfPrizes={prizeData.expectedNumberOfPrizesByTier[i]}
              ticket={tokenData.ticket}
              amountToDeposit={amountToDeposit}
            />
          ))}
        </ul>
      )}
    </TransparentDiv>
  )
}

export const LoadingPrizeRow = () => <li className='h-8 rounded-lg w-full bg-body animate-pulse' />

export const PrizeTableHeader = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => (
  <div
    {...props}
    className={classnames(
      'text-xxs text-pt-purple-darkest text-opacity-70 dark:text-pt-purple-lightest dark:text-opacity-70',
      props.className
    )}
  />
)

// Calculate prize w draw settings
const PrizeBreakdownTableRow: React.FC<{
  index: number
  prizeValue: Amount
  expectedNumberOfPrizes: number
  ticket: Token
  amountToDeposit: Amount
}> = (props) => {
  const { index, prizeValue, expectedNumberOfPrizes, amountToDeposit } = props

  if (prizeValue.amountUnformatted.isZero()) return null

  return (
    <>
      <PrizeTableCell index={index}>
        <CurrencyValue usdValue={prizeValue.amount} hideZeroes />
      </PrizeTableCell>
      <PrizeTableCell index={index}>
        <OddsForTier
          expectedNumberOfPrizes={expectedNumberOfPrizes}
          amountToDeposit={amountToDeposit}
        />
      </PrizeTableCell>
    </>
  )
}

const OddsForTier = (props: { expectedNumberOfPrizes: number; amountToDeposit: Amount }) => {
  const { expectedNumberOfPrizes, amountToDeposit } = props
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()
  const { data: twabData } = useUsersPrizePoolTwab(usersAddress, prizePool)
  const { data: oddsData } = usePrizePoolOddsData(prizePool)
  const { data, isFetched } = useOdds(
    prizePool,
    oddsData?.totalSupply,
    twabData?.twab,
    expectedNumberOfPrizes,
    oddsData?.decimals,
    EstimateAction.deposit,
    amountToDeposit?.amountUnformatted
  )

  if (data?.odds === 0) {
    return <>0</>
  }

  return (
    <>
      1 in{' '}
      {isFetched ? (
        formatNumberForDisplay(data.oneOverOdds, { maximumFractionDigits: 2 })
      ) : (
        <ThemedClipSpinner sizeClassName='w-3 h-3' />
      )}
    </>
  )
}

export const PrizeTableCell = (props: { index: number } & JSX.IntrinsicElements['div']) => (
  <div
    {...props}
    className={classnames(props.className, 'text-sm xs:text-lg leading-none w-full', {
      'text-flashy font-bold': props.index === 0,
      'text-opacity-70': props.index !== 0
    })}
  />
)
