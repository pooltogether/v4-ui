import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { AnimatedBorderCard } from '@components/AnimatedCard'
import { ModalInfoList } from '@components/InfoList'
import { EstimatedAPRItem } from '@components/InfoList/EstimatedAPRItem'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { ButtonLink, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { msToS } from '@pooltogether/utilities'
import { addDays } from '@utils/date'
import { getTimestampString } from '@utils/getTimestampString'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'react-i18next'

export const DepositReviewTransactionView: React.FC<
  { depositAmount: Amount } & ReviewTransactionViewProps
> = (props) => {
  const { depositAmount, ...reviewViewProps } = props

  const { t } = useTranslation()
  const { chainId } = useSelectedChainId()
  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <ReviewTransactionView
      {...reviewViewProps}
      amount={depositAmount}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
      reviewView={
        <div className='flex flex-col space-y-8'>
          <p className='text-center text-xs'>
            <Trans
              i18nKey='checkDailyForMoreInfoSeeHere'
              components={{
                a: (
                  <a
                    href='https://docs.pooltogether.com/faq/prizes-and-winning'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-highlight-1 hover:opacity-70 transition-opacity'
                  />
                )
              }}
            />
          </p>
          <AmountBeingSwapped
            title={t('depositTicker', { ticker: tokenData.token.symbol })}
            chainId={chainId}
            from={tokenData.token}
            to={tokenData.ticket}
            amountFrom={depositAmount}
            amountTo={depositAmount}
          />

          {prizePool && (
            <>
              <DepositLowAmountWarning chainId={chainId} amountToDeposit={depositAmount} />

              <ModalInfoList>
                {prizePool && (
                  <>
                    <EstimatedAPRItem prizePool={prizePool} />
                    {/* // TODO: Add back odds from main branch */}
                  </>
                )}
                <EstimatedDepositGasItems
                  chainId={chainId}
                  amountUnformatted={depositAmount.amountUnformatted}
                />
              </ModalInfoList>
            </>
          )}
        </div>
      }
      successView={
        <div className='flex flex-col space-y-4'>
          <CheckBackForPrizesBox />
          <AccountPageButton />
        </div>
      }
    />
  )
}

export const AccountPageButton = () => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Link href={{ pathname: '/account', query: router.query }}>
      <ButtonLink
        size={ButtonSize.md}
        theme={ButtonTheme.tealOutline}
        className='w-full text-center'
      >
        {t('viewAccount', 'View account')}
      </ButtonLink>
    </Link>
  )
}

const CheckBackForPrizesBox = () => {
  const { t } = useTranslation()
  const eligibleDate = getTimestampString(msToS(addDays(new Date(), 2).getTime()))

  return (
    <AnimatedBorderCard className='flex flex-col text-center'>
      <div className='mb-2'>
        {t('disclaimerComeBackRegularlyToClaimWinnings', { date: eligibleDate })}
      </div>

      <a
        href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline text-xs'
      >
        {t('learnMore', 'Learn more')}
      </a>
    </AnimatedBorderCard>
  )
}
