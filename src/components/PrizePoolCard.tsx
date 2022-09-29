import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSpoofedPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useSpoofedPrizePoolNetworkOdds'
import { useChainTwabRewardsPromotions } from '@hooks/v4/TwabRewards/useChainTwabRewardsPromotions'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/TwabRewards/usePrizePoolTicketTotalSupply'
import {
  TokenIcon,
  YieldSourceIcon,
  YieldSourceKey,
  getYieldSourceNiceName,
  NetworkIcon,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, numberWithCommas, shorten } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { PromotionsVapr } from './InfoList/TwabRewardsAprItem'
import { RoundButton } from './Input/RoundButton'

const SIZE_CLASSNAME = 'w-64'
const BG_CLASSNAME = 'bg-white bg-opacity-100 dark:bg-white dark:bg-opacity-10'
const RADIUS_CLASSNAME = 'rounded-xl'

export const PrizePoolCard: React.FC<{
  children: React.ReactNode
  prizePool: PrizePool
  onClick?: (prizePool: PrizePool) => void
  className?: string
  sizeClassName?: string
  bgClassName?: string
  radiusClassName?: string
  hoverClassName?: string
}> = (props) => {
  const {
    children,
    prizePool,
    onClick,
    className,
    sizeClassName,
    bgClassName,
    radiusClassName,
    hoverClassName
  } = props

  return (
    <button
      onClick={() => onClick(prizePool)}
      className={classNames(
        'px-3 py-4 text-left transition',
        className,
        sizeClassName,
        bgClassName,
        radiusClassName,
        {
          [hoverClassName]: !!onClick
        }
      )}
    >
      <div className='flex justify-between mb-3'>
        <DepositToken prizePool={prizePool} />
        <Network prizePool={prizePool} className='text-right' />
      </div>
      <div className='flex justify-between items-center space-x-2'>
        <div>
          {children}
          <Rewards prizePool={prizePool} />
        </div>
        <div className='rounded-full bg-actually-black bg-opacity-5 p-1 flex flex-col justify-center items-center ml-auto mt-auto'>
          <FeatherIcon icon='chevron-right' className='w-6 h-6' />
        </div>
      </div>
    </button>
  )
}

PrizePoolCard.defaultProps = {
  sizeClassName: SIZE_CLASSNAME,
  bgClassName: BG_CLASSNAME,
  radiusClassName: RADIUS_CLASSNAME,
  hoverClassName: 'hover:bg-opacity-50 dark:hover:bg-opacity-5'
}

const CardLabelSmall = (props) => (
  <span {...props} className={classNames('text-xxs opacity-80', props.className)} />
)

const CardLabelMedium = (props) => (
  <span {...props} className={classNames('text-xs font-bold', props.className)} />
)

const CardLabelLarge = (props) => (
  <span {...props} className={classNames('text-xl font-bold', props.className)} />
)

/**
 * TODO: Eventually we'll need to actually map the prize pools to yield source images. Aave is fine for now.
 * @param props
 * @returns
 */
const YieldSource: React.FC<{ prizePool: PrizePool }> = (props) => {
  return (
    <div className='flex flex-col'>
      <CardLabelSmall>Yield source</CardLabelSmall>
      <div className='flex space-x-1 items-center'>
        <YieldSourceIcon yieldSource={YieldSourceKey.aave} sizeClassName='w-4 h-4' />
        <CardLabelMedium>{getYieldSourceNiceName(YieldSourceKey.aave)}</CardLabelMedium>
      </div>
    </div>
  )
}

/**
 * @param props
 * @returns
 */
const DepositToken: React.FC<{ prizePool: PrizePool; className?: string }> = (props) => {
  const { prizePool, className } = props
  const { data: tokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  return (
    <div className={classNames('flex flex-col', className)}>
      <CardLabelSmall>Token</CardLabelSmall>
      <div className='flex space-x-1 items-center'>
        <TokenIcon
          address={tokens.token.address}
          chainId={prizePool.chainId}
          sizeClassName='w-5 h-5'
        />
        <CardLabelMedium>{tokens.token.symbol}</CardLabelMedium>
      </div>
    </div>
  )
}

/**
 * @param props
 * @returns
 */
const Network: React.FC<{ prizePool: PrizePool; className?: string }> = (props) => {
  const { prizePool, className } = props
  return (
    <div className={classNames('flex flex-col', className)}>
      <CardLabelSmall>Network</CardLabelSmall>
      <div className='flex space-x-1 items-center'>
        <CardLabelMedium>{getNetworkNiceNameByChainId(prizePool.chainId)}</CardLabelMedium>
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
const Rewards: React.FC<{ prizePool: PrizePool; className?: string }> = (props) => {
  const { prizePool, className } = props

  const { data, isFetched } = useChainTwabRewardsPromotions(prizePool.chainId)

  if (!isFetched || !data?.hasActivePromotions) return null

  return (
    <div className={classNames('flex flex-col', className)}>
      <span className='text-xxs animate-rainbow'>Rewards</span>
      <div className='flex space-x-1 items-center'>
        <CardLabelMedium>
          {data.promotions.map((promotion, index) => (
            <PromotionsVapr key={`promotion-${promotion.id}`} promotion={promotion} />
          ))}
        </CardLabelMedium>
      </div>
    </div>
  )
}

export const OddsPerX: React.FC<{ prizePool: PrizePool; amount: string; decimals: string }> = (
  props
) => {
  const { prizePool, amount, decimals } = props
  const { data, isFetched } = useSpoofedPrizePoolNetworkOdds(amount, decimals, prizePool.id())
  return (
    <div className='flex flex-col'>
      <CardLabelSmall>
        Odds to win at least one prize per draw with a ${numberWithCommas(amount, { precision: 0 })}{' '}
        deposit
      </CardLabelSmall>
      {isFetched ? (
        <CardLabelLarge>1:{numberWithCommas(data.oneOverOdds, { precision: 2 })}</CardLabelLarge>
      ) : (
        <ThemedClipSpinner sizeClassName='w-6 h-6' />
      )}
    </div>
  )
}

export const TotalValueLocked: React.FC<{ prizePool: PrizePool }> = (props) => {
  const { data } = usePrizePoolTicketTotalSupply(props.prizePool)
  const { data: tokenData } = usePrizePoolTokens(props.prizePool)
  return (
    <div className='flex flex-col'>
      <CardLabelSmall>Total value locked</CardLabelSmall>
      <div className='flex items-end space-x-1'>
        <CardLabelLarge>{data?.amount.amountPretty}</CardLabelLarge>
        <CardLabelSmall className='mb-1'>{tokenData?.token.symbol}</CardLabelSmall>
      </div>
    </div>
  )
}

export const NumberOfPrizes: React.FC<{ prizePool: PrizePool }> = (props) => {
  const { data, isFetched } = usePrizePoolExpectedPrizes(props.prizePool)
  return (
    <div className='flex flex-col'>
      <CardLabelSmall>Expected number of prizes</CardLabelSmall>
      {isFetched ? (
        <CardLabelLarge>{Math.round(data?.expectedTotalNumberOfPrizes)}</CardLabelLarge>
      ) : (
        <ThemedClipSpinner />
      )}
    </div>
  )
}

export const PrizePoolCardLoader = () => (
  <div
    className={classNames('animate-pulse h-40', SIZE_CLASSNAME, BG_CLASSNAME, RADIUS_CLASSNAME)}
  />
)
