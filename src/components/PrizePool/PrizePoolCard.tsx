import { OddsForDeposit } from '@components/PrizePoolNetwork/OddsForDeposit'
import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { useSpoofedPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useSpoofedPrizePoolNetworkOdds'
import { useChainTwabRewardsPromotions } from '@hooks/v4/TwabRewards/useChainTwabRewardsPromotions'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/TwabRewards/usePrizePoolTicketTotalSupply'
import {
  YieldSourceIcon,
  YieldSourceKey,
  NetworkIcon,
  ThemedClipSpinner,
  Button,
  ButtonSize,
  ButtonTheme
} from '@pooltogether/react-components'
import {
  formatCurrencyNumberForDisplay,
  getNetworkNiceNameByChainId
} from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { PromotionsVapr } from '../InfoList/TwabRewardsAprItem'
import { AveragePrizeValue } from './AveragePrizeValue'
import { DepositToken } from './DepositToken'
import { GrandPrize } from './GrandPrize'
import { NumberOfPrizes } from './NumberOfPrizes'
import { PrizePoolLabelFlat } from './PrizePoolLabel'
import { Prizes } from './Prizes'
import { SmallPrizes } from './SmallPrizes'
import { TicketTotalSupply } from './TicketTotalSupply'
import { YieldSource } from './YieldSource'

const SIZE_CLASSNAME = 'w-full max-w-xl'
const BG_CLASSNAME = 'bg-white bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10'
const RADIUS_CLASSNAME = 'rounded-lg'

export const PrizePoolCard: React.FC<{
  children: React.ReactNode
  prizePool: PrizePool
  onClick?: (prizePool: PrizePool) => void
  className?: string
  sizeClassName?: string
  bgClassName?: string
  radiusClassName?: string
  bgHoverClassName?: string
  borderClassName?: string
  borderHoverClassName?: string
}> = (props) => {
  const {
    children,
    prizePool,
    onClick,
    className,
    sizeClassName,
    bgClassName,
    radiusClassName,
    bgHoverClassName,
    borderClassName,
    borderHoverClassName
  } = props

  return (
    <div
      className={classNames(
        'px-3 py-2 text-left transition',
        className,
        sizeClassName,
        bgClassName,
        radiusClassName,
        borderClassName,
        {
          [bgHoverClassName]: !!onClick,
          [borderHoverClassName]: !!onClick
        }
      )}
    >
      <div className='grid grid-cols-3 mb-4'>
        <div className='col-span-2 grid gap-2 grid-cols-1 md:grid-cols-2'>
          <div className='md:col-span-2'>
            <CardLabelSmall>Prize Pool</CardLabelSmall>
            <PrizePoolLabelFlat prizePool={prizePool} />
          </div>
          <div>
            <CardLabelSmall>Total deposited</CardLabelSmall>
            <TicketTotalSupplyGroup prizePool={prizePool} />
          </div>
          {/* <div>
            <CardLabelSmall>Number of prizes</CardLabelSmall>
            <NumberOfPrizesGroup prizePool={prizePool} />
          </div> */}

          <RewardsGroup prizePool={prizePool} className='' />
          {children}
        </div>

        <div className='col-span-1 flex flex-col'>
          <CardLabelSmall>Prizes</CardLabelSmall>
          <PrizeGroup prizePool={prizePool} />
        </div>
      </div>

      <Button
        size={ButtonSize.sm}
        className='w-full space-x-2'
        theme={ButtonTheme.transparent}
        onClick={() => onClick(prizePool)}
      >
        <div className='font-bold'>Deposit</div>
        <FeatherIcon icon='chevron-right' className='w-4 h-4' />
      </Button>
    </div>
  )
}

PrizePoolCard.defaultProps = {
  sizeClassName: SIZE_CLASSNAME,
  bgClassName: BG_CLASSNAME,
  radiusClassName: RADIUS_CLASSNAME,
  borderClassName: 'border border-transparent'
}

export const CardLabelSmall = (props: {
  isFetched?: boolean
  className?: string
  fontClassName?: string
  children?: React.ReactNode
}) => <CardLabel {...props} className={classNames(props.fontClassName, props.className)} />
CardLabelSmall.defaultProps = {
  fontClassName: 'text-xxs'
}

export const CardLabelMedium = (props: {
  isFetched?: boolean
  className?: string
  fontClassName?: string
  children?: React.ReactNode
}) => <CardLabel {...props} className={classNames(props.fontClassName, props.className)} />
CardLabelMedium.defaultProps = {
  fontClassName: 'text-xs font-bold'
}

export const CardLabelLarge = (props: {
  isFetched?: boolean
  className?: string
  fontClassName?: string
  children?: React.ReactNode
}) => <CardLabel {...props} className={classNames(props.fontClassName, props.className)} />
CardLabelLarge.defaultProps = {
  fontClassName: 'text-lg font-bold'
}

const CardLabel = (
  props: {
    isFetched?: boolean
  } & JSX.IntrinsicElements['div']
) =>
  !props.isFetched ? (
    <ThemedClipSpinner className={classNames(props.className, 'w-3 h-3')} />
  ) : (
    <div {...props} />
  )
CardLabel.defaultProps = {
  isFetched: true
}

export const PrizePoolTitle = (props: {
  prizePool: PrizePool
  className?: string
  fontClassName?: string
}) => (
  <div className={classNames('flex justify-between', props.className)}>
    <DepositTokenGroup prizePool={props.prizePool} mainFontClassName={props.fontClassName} />
    <NetworkGroup
      prizePool={props.prizePool}
      className='text-right'
      mainFontClassName={props.fontClassName}
    />
  </div>
)

/**
 * TODO: Eventually we'll need to actually map the prize pools to yield source images. Aave is fine for now.
 * @param props
 * @returns
 */
const YieldSourceGroup: React.FC<{
  prizePool: PrizePool
  className?: string
  mainFontClassName?: string
}> = (props) => {
  const { prizePool, className, mainFontClassName } = props
  return (
    <div className={className}>
      <CardLabelSmall>Yield source</CardLabelSmall>
      <div className='flex space-x-1 items-center'>
        <YieldSourceIcon yieldSource={YieldSourceKey.aave} sizeClassName='w-4 h-4' />
        <CardLabelLarge fontClassName={mainFontClassName}>
          <YieldSource prizePool={prizePool} />
        </CardLabelLarge>
      </div>
    </div>
  )
}

/**
 * @param props
 * @returns
 */
const DepositTokenGroup = (props: {
  prizePool: PrizePool
  className?: string
  mainFontClassName?: string
}) => {
  const { prizePool, className, mainFontClassName } = props

  return (
    <div className={className}>
      <CardLabelSmall>Deposit Token</CardLabelSmall>
      <div className='flex space-x-1 items-center'>
        <CardLabelLarge fontClassName={mainFontClassName} className='flex items-center'>
          <DepositToken showTokenIcon prizePool={prizePool} iconSizeClassName='w-5 h-5' />
        </CardLabelLarge>
      </div>
    </div>
  )
}

/**
 * @param props
 * @returns
 */
const NetworkGroup = (props: {
  prizePool: PrizePool
  className?: string
  mainFontClassName?: string
}) => {
  const { prizePool, className, mainFontClassName } = props
  return (
    <div className={className}>
      <CardLabelSmall>Network</CardLabelSmall>
      <div className='flex space-x-1 items-center'>
        <CardLabelLarge fontClassName={mainFontClassName}>
          {getNetworkNiceNameByChainId(prizePool.chainId)}
        </CardLabelLarge>
        <NetworkIcon chainId={prizePool.chainId} sizeClassName='w-5 h-5' />
      </div>
    </div>
  )
}

/**
 * TODO: Eventually we'll need to actually map the prize pools to yield source images. Aave is fine for now.
 * @param props
 * @returns
 */
const RewardsGroup: React.FC<{ prizePool: PrizePool; className?: string }> = (props) => {
  const { prizePool, className } = props
  const { data, isFetched } = useChainTwabRewardsPromotions(prizePool.chainId)

  if (!isFetched || data?.promotions.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <CardLabelSmall className='text-flashy flex items-center'>
        <span>Bonus Rewards</span>
      </CardLabelSmall>
      <CardLabelLarge isFetched={isFetched}>
        {data.promotions.map((promotion) => (
          <PromotionsVapr key={`promotion-${promotion.id}`} promotion={promotion} />
        ))}
      </CardLabelLarge>
    </div>
  )
}

export const NetworkOddsForDepositGroup: React.FC<{
  prizePool: PrizePool
  amount: string
  decimals: string
  className?: string
}> = (props) => {
  const { prizePool, amount, decimals, className } = props
  const { isFetched } = useSpoofedPrizePoolNetworkOdds(amount, decimals, prizePool.id())
  return (
    <CardLabelLarge isFetched={isFetched} className={className}>
      <OddsForDeposit prizePool={prizePool} amount={amount} />
    </CardLabelLarge>
  )
}

export const TicketTotalSupplyGroup: React.FC<{ prizePool: PrizePool; className?: string }> = (
  props
) => {
  const { prizePool, className } = props
  const { isFetched } = usePrizePoolTicketTotalSupply(prizePool)
  return (
    <CardLabelLarge isFetched={isFetched} className={className}>
      <TicketTotalSupply prizePool={prizePool} />
    </CardLabelLarge>
  )
}

export const AveragePrizeValueGroup: React.FC<{ prizePool: PrizePool; className?: string }> = (
  props
) => {
  const { prizePool, className } = props
  const { isFetched } = usePrizePoolExpectedPrizes(prizePool)
  return (
    <CardLabelLarge isFetched={isFetched} className={className}>
      <AveragePrizeValue prizePool={prizePool} />
    </CardLabelLarge>
  )
}

export const PrizeGroup: React.FC<{ prizePool: PrizePool; className?: string }> = (props) => {
  const { prizePool, className } = props
  const { data, isFetched } = usePrizePoolExpectedPrizes(prizePool)

  return (
    <CardLabelLarge isFetched={isFetched} className={className}>
      <div className='flex flex-col'>
        <span className='text-flashy'>
          {isFetched && formatCurrencyNumberForDisplay(data?.grandPrizeValue.amount, 'usd')}
        </span>
        {data?.smallPrizeValueList.map((smallPrizeValue, index) => (
          <span key={`prize-${prizePool.id()}-${index}`}>{smallPrizeValue}</span>
        ))}
      </div>
    </CardLabelLarge>
  )
}

export const SmallPrizesGroup: React.FC<{ prizePool: PrizePool; className?: string }> = (props) => {
  const { prizePool, className } = props
  const { isFetched } = usePrizePoolExpectedPrizes(prizePool)
  return (
    <CardLabelLarge isFetched={isFetched} className={className}>
      <SmallPrizes prizePool={prizePool} />
    </CardLabelLarge>
  )
}

export const GrandPrizeGroup: React.FC<{ prizePool: PrizePool; className?: string }> = (props) => {
  const { prizePool, className } = props
  const { isFetched } = usePrizePoolExpectedPrizes(prizePool)
  return (
    <CardLabelLarge isFetched={isFetched} className={className}>
      <GrandPrize prizePool={prizePool} />
    </CardLabelLarge>
  )
}

export const NumberOfPrizesGroup: React.FC<{ prizePool: PrizePool; className?: string }> = (
  props
) => {
  const { prizePool, className } = props
  const { isFetched } = usePrizePoolExpectedPrizes(prizePool)
  return (
    <CardLabelLarge isFetched={isFetched} className={className}>
      <NumberOfPrizes prizePool={prizePool} />
    </CardLabelLarge>
  )
}

export const PrizePoolCardLoader = (props: { className?: string }) => (
  <div
    className={classNames(
      'animate-pulse h-40',
      props.className,
      SIZE_CLASSNAME,
      BG_CLASSNAME,
      RADIUS_CLASSNAME
    )}
  />
)
